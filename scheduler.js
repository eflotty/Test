/**
 * Scheduler Service - Runs 24/7 in the cloud
 * 
 * Polls the database for upcoming bookings and triggers bot execution.
 * This service should run continuously (use PM2, systemd, or cloud always-on service).
 */

const http = require('http');
const https = require('https');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const POLL_INTERVAL = 60000; // Check every 60 seconds
const PRE_POSITION_BUFFER = 120000; // Start bot 2 minutes before scheduled time

/**
 * Get the appropriate HTTP module based on URL protocol
 */
function getHttpModule(url) {
  return url.protocol === 'https:' ? https : http;
}

/**
 * Fetch upcoming bookings from API
 */
async function fetchUpcomingBookings() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/bookings`);
    const client = getHttpModule(url);
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk.toString(); });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            resolve(response.bookings || []);
          } else {
            reject(new Error('API returned error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Get full booking config (including password) for bot execution
 */
async function getBookingConfig(bookingId) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/bookings/${bookingId}/config`);
    const client = getHttpModule(url);
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk.toString(); });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            resolve(response.config);
          } else {
            reject(new Error('Failed to get booking config'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Update booking status
 */
async function updateBookingStatus(bookingId, status, error = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/bookings/${bookingId}/status`);
    const data = JSON.stringify({ status, error });
    const client = getHttpModule(url);
    
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = client.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk.toString(); });
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (e) {
          resolve({ success: true }); // Assume success if can't parse
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Execute bot for a booking
 */
async function executeBot(bookingConfig) {
  const timestamp = new Date().toISOString();
  console.log(`\n🤖 [${timestamp}] EXECUTING BOT FOR BOOKING ${bookingConfig.id}`);
  console.log(`   Triggered at: ${new Date().toLocaleString()}`);
  console.log(`   Scheduled for: ${new Date(bookingConfig.scheduledFor).toLocaleString()}`);
  
  // Update status to running
  await updateBookingStatus(bookingConfig.id, 'running');
  console.log(`   ✅ Status updated to: running`);
  
  try {
    // Import and run the bot
    const { spawn } = require('child_process');
    const path = require('path');
    
    // Set environment variables for the bot
    // Use booking's testMode preference, or fall back to environment variable, or default to true for safety
    const testModeValue = bookingConfig.testMode !== undefined 
      ? (bookingConfig.testMode ? 'true' : 'false')
      : (process.env.TEST_MODE || 'true');
    
    const env = {
      ...process.env,
      BOOKING_ID: bookingConfig.id,
      USERNAME: bookingConfig.username,
      PASSWORD: bookingConfig.password,
      COURSE: bookingConfig.course,
      DATE: bookingConfig.date || '',
      PLAYERS: bookingConfig.players,
      HOLES: bookingConfig.holes,
      TIME_START: bookingConfig.timeStart,
      TIME_END: bookingConfig.timeEnd,
      TARGET_HOUR: bookingConfig.targetHour,
      TARGET_MINUTE: bookingConfig.targetMinute,
      API_URL: API_URL,
      TEST_MODE: testModeValue
    };
    
    console.log(`   🧪 Test Mode: ${testModeValue === 'true' ? 'ENABLED (simulation only)' : 'DISABLED (will actually book)'}`);
    
    console.log(`   🚀 Spawning bot process...`);
    console.log(`   📋 Environment: BOOKING_ID=${bookingConfig.id}, TARGET_HOUR=${bookingConfig.targetHour}, TARGET_MINUTE=${bookingConfig.targetMinute}`);
    
    // Run the bot
    const botProcess = spawn('node', [path.join(__dirname, 'bot-runner.js')], {
      env,
      stdio: 'inherit'
    });
    
    console.log(`   ✅ Bot process started (PID: ${botProcess.pid})`);
    
    // Wait for bot to complete
    await new Promise((resolve, reject) => {
      botProcess.on('close', (code) => {
        const endTime = new Date().toISOString();
        console.log(`\n   📊 [${endTime}] Bot process exited with code: ${code}`);
        if (code === 0) {
          console.log(`   ✅ Bot execution completed successfully`);
          resolve();
        } else {
          console.log(`   ❌ Bot execution failed with code ${code}`);
          reject(new Error(`Bot exited with code ${code}`));
        }
      });
      
      botProcess.on('error', (err) => {
        console.error(`   ❌ Bot process error:`, err);
        reject(err);
      });
    });
    
    // Update status to completed
    await updateBookingStatus(bookingConfig.id, 'completed');
    console.log(`   ✅ Booking ${bookingConfig.id} status updated to: completed`);
    
  } catch (error) {
    const errorTime = new Date().toISOString();
    console.error(`\n   ❌ [${errorTime}] Error executing bot for booking ${bookingConfig.id}:`, error);
    console.error(`   Stack:`, error.stack);
    await updateBookingStatus(bookingConfig.id, 'failed', error.message);
  }
}

/**
 * Check for bookings that need to be executed
 */
async function checkAndExecuteBookings() {
  try {
    const timestamp = new Date().toISOString();
    const now = new Date();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`⏰ [${now.toLocaleString()}] Checking for upcoming bookings...`);
    console.log(`📡 API URL: ${API_URL}`);
    
    const bookings = await fetchUpcomingBookings();
    console.log(`📋 Total bookings in system: ${bookings.length}`);
    
    // Find bookings that need to be executed
    const upcomingBookings = bookings.filter(booking => {
      if (booking.status !== 'scheduled') {
        console.log(`   ⏭️  Booking ${booking.id.substring(0, 8)}... status: ${booking.status} (skipping)`);
        return false;
      }
      
      const scheduledTime = new Date(booking.scheduledFor);
      const timeUntilExecution = scheduledTime - now;
      
      // Execute if scheduled time is within the next 2 minutes
      const shouldExecute = timeUntilExecution > 0 && timeUntilExecution <= PRE_POSITION_BUFFER;
      
      if (shouldExecute) {
        console.log(`   ✅ Booking ${booking.id.substring(0, 8)}... needs execution!`);
        console.log(`      Scheduled: ${scheduledTime.toLocaleString()}`);
        console.log(`      Time until: ${Math.round(timeUntilExecution / 1000)}s`);
      } else {
        console.log(`   ⏳ Booking ${booking.id.substring(0, 8)}... scheduled for ${scheduledTime.toLocaleString()} (${Math.round(timeUntilExecution / 1000)}s away)`);
      }
      
      return shouldExecute;
    });
    
    if (upcomingBookings.length === 0) {
      console.log(`   ℹ️  No bookings to execute right now`);
      console.log('='.repeat(60));
      return;
    }
    
    console.log(`\n🚀 Found ${upcomingBookings.length} booking(s) ready to execute!`);
    
    // Execute each booking
    for (const booking of upcomingBookings) {
      const scheduledTime = new Date(booking.scheduledFor);
      const timeUntilExecution = scheduledTime - now;
      
      console.log(`\n📅 Executing Booking: ${booking.id}`);
      console.log(`   Scheduled for: ${scheduledTime.toLocaleString()}`);
      console.log(`   Current time: ${now.toLocaleString()}`);
      console.log(`   Time until execution: ${Math.round(timeUntilExecution / 1000)}s`);
      console.log(`   Course: ${booking.course}, Players: ${booking.players}`);
      
      // Get full config and execute
      const config = await getBookingConfig(booking.id);
      
      console.log(`   ✅ Config loaded, triggering bot execution...`);
      
      // Execute immediately (bot will handle timing internally)
      executeBot(config).catch(err => {
        console.error(`   ❌ Failed to execute booking ${booking.id}:`, err);
      });
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error checking bookings:`, error.message);
    console.error(error.stack);
  }
}

/**
 * Main scheduler loop
 */
async function startScheduler() {
  console.log('🚀 Scheduler Service Starting...');
  console.log(`📡 API URL: ${API_URL}`);
  console.log(`⏱️  Poll interval: ${POLL_INTERVAL / 1000}s`);
  console.log(`⏰ Pre-position buffer: ${PRE_POSITION_BUFFER / 1000}s`);
  console.log('\n' + '='.repeat(60));
  
  // Check immediately
  await checkAndExecuteBookings();
  
  // Then check every interval
  setInterval(checkAndExecuteBookings, POLL_INTERVAL);
  
  console.log('✅ Scheduler is running. Checking for bookings every minute...\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down scheduler gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down scheduler gracefully...');
  process.exit(0);
});

// Start the scheduler
startScheduler().catch(error => {
  console.error('❌ Fatal error starting scheduler:', error);
  process.exit(1);
});

