/**
 * Bot Runner - Executes the booking bot with provided config
 * 
 * This is called by the scheduler service to execute a booking.
 * It loads config from environment variables and runs the bot.
 */

// Note: The actual bot class is in austin-golf-bot.js
// For test mode, we'll simulate without requiring the full bot

// Load config from environment variables (set by scheduler)
const CONFIG = {
  USERNAME: process.env.USERNAME,
  PASSWORD: process.env.PASSWORD,
  COURSE: parseInt(process.env.COURSE) || 3,
  DATE: process.env.DATE || null,
  PLAYERS: parseInt(process.env.PLAYERS) || 4,
  HOLES: parseInt(process.env.HOLES) || 18,
  TIME_START: process.env.TIME_START || '07:00',
  TIME_END: process.env.TIME_END || '18:00',
  TARGET_HOUR: parseInt(process.env.TARGET_HOUR) || 7,
  TARGET_MINUTE: parseInt(process.env.TARGET_MINUTE) || 0,
  TARGET_SECOND: 0,
  PRE_POSITION_SECONDS: 45,
  BOOKING_ID: process.env.BOOKING_ID,
  SCHEDULED_FOR: process.env.SCHEDULED_FOR || null, // Exact time when booking should execute
  API_URL: process.env.API_URL || 'http://localhost:3000'
};

// Validate required config
if (!CONFIG.USERNAME || !CONFIG.PASSWORD) {
  console.error('❌ Missing USERNAME or PASSWORD in environment variables');
  process.exit(1);
}

/**
 * Update booking status via API
 */
async function updateStatus(status, error = null) {
  if (!CONFIG.BOOKING_ID || !CONFIG.API_URL) return;
  
  try {
    const http = require('http');
    const https = require('https');
    const url = new URL(`${CONFIG.API_URL}/api/bookings/${CONFIG.BOOKING_ID}/status`);
    const client = url.protocol === 'https:' ? https : http;
    const data = JSON.stringify({ status, error });
    
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 5000 // 5 second timeout
    };
    
    const req = client.request(url, options);
    req.on('timeout', () => {
      req.destroy();
    });
    req.write(data);
    req.end();
  } catch (e) {
    // Ignore errors updating status
  }
}

// Check for test mode
const TEST_MODE = process.env.TEST_MODE === 'true' || process.env.TEST_MODE === '1';

/**
 * Main execution
 */
async function main() {
  const startTime = new Date();
  const timestamp = startTime.toISOString();
  
  console.log('\n' + '='.repeat(60));
  console.log(`🤖 BOT RUNNER STARTING`);
  console.log(`📅 Started at: ${startTime.toLocaleString()}`);
  console.log(`🕐 Timestamp: ${timestamp}`);
  if (TEST_MODE) {
    console.log(`🧪 TEST MODE: ENABLED (will not actually book)`);
  }
  console.log('='.repeat(60));
  console.log(`📋 Booking ID: ${CONFIG.BOOKING_ID || 'N/A'}`);
  console.log(`👤 Username: ${CONFIG.USERNAME}`);
  console.log(`🏌️  Course: ${CONFIG.COURSE}`);
  console.log(`⏰ Target Time: ${CONFIG.TARGET_HOUR}:${String(CONFIG.TARGET_MINUTE).padStart(2, '0')}`);
  console.log(`📅 Date: ${CONFIG.DATE || 'Today'}`);
  console.log(`👥 Players: ${CONFIG.PLAYERS}, Holes: ${CONFIG.HOLES}`);
  console.log(`⏱️  Time Range: ${CONFIG.TIME_START} - ${CONFIG.TIME_END}`);
  console.log('='.repeat(60) + '\n');
  
  try {
    // IMPORTANT: The scheduler triggers the bot when scheduledFor is within 2 minutes
    // We should pre-position early (launch, login, navigate) then wait until exact time
    // CONFIG.DATE is for which date to book (tee time date), not when to run
    // CONFIG.SCHEDULED_FOR is the exact time when booking opens (when to execute)
    
    const PRE_POSITION_BUFFER = 60000; // Pre-position 60 seconds (1 minute) before execution
    const now = new Date();
    let scheduledTime = null;
    let bot = null;
    
    if (CONFIG.SCHEDULED_FOR) {
      scheduledTime = new Date(CONFIG.SCHEDULED_FOR);
      const delayToExecution = scheduledTime - now;
      const prePositionTime = scheduledTime.getTime() - PRE_POSITION_BUFFER;
      const delayToPrePosition = prePositionTime - now.getTime();
      
      console.log(`\n⏰ EXECUTION TIMING:`);
      console.log(`   Scheduled for: ${scheduledTime.toLocaleString("en-US", {timeZone: "America/Chicago"})} (Chicago)`);
      console.log(`   Current time: ${now.toLocaleString("en-US", {timeZone: "America/Chicago"})} (Chicago)`);
      console.log(`   Pre-position at: ${new Date(prePositionTime).toLocaleString("en-US", {timeZone: "America/Chicago"})} (Chicago)`);
      console.log(`   Delay to pre-position: ${Math.round(delayToPrePosition / 1000)}s`);
      console.log(`   Delay to execution: ${Math.round(delayToExecution / 1000)}s`);
      console.log(`   Tee Time Date: ${CONFIG.DATE || 'Today'}`);
      console.log(`   Time Range: ${CONFIG.TIME_START} - ${CONFIG.TIME_END}\n`);
      
      await updateStatus('running');
      
      if (!TEST_MODE) {
        // Import bot early
        const { AustinGolfBookingBot, applyConfigFromEnv } = require('./austin-golf-bot.js');
        // Apply environment variables to bot's CONFIG
        if (typeof applyConfigFromEnv === 'function') {
          applyConfigFromEnv();
        }
        bot = new AustinGolfBookingBot();
      }
      
      // Pre-position phase: launch browser, login, navigate (if we have time)
      if (delayToPrePosition > 0 && delayToExecution > PRE_POSITION_BUFFER) {
        console.log(`⏳ Waiting ${Math.round(delayToPrePosition / 1000)}s until pre-position time...\n`);
        await new Promise(resolve => setTimeout(resolve, delayToPrePosition));
        
        console.log(`\n🚀 PRE-POSITIONING NOW (${Math.round(PRE_POSITION_BUFFER / 1000)}s before execution)...\n`);
        if (TEST_MODE) {
          console.log('🧪 TEST MODE: Would launch browser, login, and navigate now');
        } else {
          await bot.launch();
          await bot.login();
          await bot.navigateToBookingPage();
          console.log(`✅ Pre-positioned! Browser ready, logged in, on booking page.\n`);
        }
        
        // Wait until exact execution time
        const remainingDelay = scheduledTime - new Date();
        if (remainingDelay > 0) {
          console.log(`⏳ Waiting ${Math.round(remainingDelay / 1000)}s until exact booking opens time...\n`);
          await new Promise(resolve => setTimeout(resolve, remainingDelay));
        }
      } else if (delayToExecution > 0) {
        // Not enough time to pre-position, but we can wait until execution time
        console.log(`⏳ Waiting ${Math.round(delayToExecution / 1000)}s until exact booking opens time (no pre-position)...\n`);
        await new Promise(resolve => setTimeout(resolve, delayToExecution));
      } else if (delayToExecution < -300000) {
        // More than 5 minutes late - probably a problem, but execute anyway
        console.log(`⚠️  Booking opens time was ${Math.round(Math.abs(delayToExecution) / 1000)}s ago, executing anyway...\n`);
      } else {
        // Within 5 minutes of scheduled time - execute now (no pre-position)
        console.log(`✅ Executing now (${Math.round(Math.abs(delayToExecution) / 1000)}s after scheduled time, no pre-position)\n`);
      }
      
      console.log(`✅ Booking opens time reached! Executing booking now...\n`);
    } else {
      // No scheduled time provided - execute immediately
      console.log(`\n⏰ EXECUTION MODE:`);
      console.log(`   No scheduled time provided - executing immediately`);
      console.log(`   Tee Time Date: ${CONFIG.DATE || 'Today'}`);
      console.log(`   Time Range: ${CONFIG.TIME_START} - ${CONFIG.TIME_END}\n`);
      
      await updateStatus('running');
      
      if (!TEST_MODE) {
        const { AustinGolfBookingBot, applyConfigFromEnv } = require('./austin-golf-bot.js');
        // Apply environment variables to bot's CONFIG
        if (typeof applyConfigFromEnv === 'function') {
          applyConfigFromEnv();
        }
        bot = new AustinGolfBookingBot();
      }
    }
    
    // Execute booking
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: Simulating booking (not actually booking)');
      console.log(`🧪 TEST MODE: Would book tee time for date: ${CONFIG.DATE || 'Today'}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2 second delay
      console.log('🧪 TEST MODE: Simulated booking complete');
    } else {
      if (!bot) {
        const { AustinGolfBookingBot, applyConfigFromEnv } = require('./austin-golf-bot.js');
        // Apply environment variables to bot's CONFIG
        if (typeof applyConfigFromEnv === 'function') {
          applyConfigFromEnv();
        }
        bot = new AustinGolfBookingBot();
      }
      
      // Check if we already pre-positioned (browser is open and on booking page)
      let alreadyPositioned = false;
      try {
        if (bot.page) {
          const url = await bot.page.url();
          alreadyPositioned = url && url.includes('search.html');
        }
      } catch (e) {
        alreadyPositioned = false;
      }
      
      if (alreadyPositioned) {
        // Already positioned - just execute booking
        console.log('✅ Browser already positioned, executing booking now...\n');
        await bot.executeBooking();
      } else {
        // Need to launch, login, navigate, then execute
        console.log('🚀 Launching browser and positioning now...\n');
        await bot.launch();
        await bot.login();
        await bot.navigateToBookingPage();
        await bot.executeBooking();
      }
      
      // Close browser after completion (bot.executeBooking() will handle this in headless mode)
      // If bot didn't close it, we close it here
      try {
        if (bot.browser) {
          await bot.close();
        }
      } catch (e) {
        console.error('⚠️  Error closing browser:', e.message);
      }
    }
    
    await updateStatus('completed');
    
    const endTime = new Date();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Bot execution completed`);
    console.log(`📅 Ended at: ${endTime.toLocaleString()}`);
    console.log(`⏱️  Duration: ${Math.round((endTime - startTime) / 1000)}s`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Bot execution failed:', error);
    
    // Try to close browser if it's still open
    try {
      if (typeof bot !== 'undefined' && bot && bot.browser) {
        await bot.close();
      }
    } catch (e) {
      // Ignore cleanup errors
    }
    
    await updateStatus('failed', error.message);
    process.exit(1);
  }
}

main();

