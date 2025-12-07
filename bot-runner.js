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
    const url = new URL(`${CONFIG.API_URL}/api/bookings/${CONFIG.BOOKING_ID}/status`);
    const data = JSON.stringify({ status, error });
    
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(url, options);
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
    // Calculate target time
    const now = new Date();
    const target = new Date();
    target.setHours(CONFIG.TARGET_HOUR, CONFIG.TARGET_MINUTE, CONFIG.TARGET_SECOND, 0);
    
    // If date is specified, use that date
    if (CONFIG.DATE) {
      const [year, month, day] = CONFIG.DATE.split('-');
      target.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // If target time is in the past, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    const delayToExecution = target - now;
    
    console.log(`\n⏰ TIMING CALCULATION:`);
    console.log(`   Current time: ${now.toLocaleString()}`);
    console.log(`   Target time:  ${target.toLocaleString()}`);
    console.log(`   Delay: ${Math.round(delayToExecution / 1000)}s (${Math.round(delayToExecution / 60000)} minutes)\n`);
    
    if (delayToExecution < 0) {
      console.log('⚠️  Target time is in the past! Running immediately...\n');
      await updateStatus('running');
      
      if (TEST_MODE) {
        console.log('🧪 TEST MODE: Simulating booking (not actually booking)');
        console.log('🧪 TEST MODE: Would launch browser, login, and book slot');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2 second delay
        console.log('🧪 TEST MODE: Simulated booking complete');
      } else {
        await bot.runImmediately();
      }
      
      await updateStatus('completed');
    } else {
      console.log(`⏰ Scheduling for ${target.toLocaleString()}`);
      console.log(`   Will execute in: ${Math.round(delayToExecution / 1000)}s\n`);
      
      await updateStatus('running');
      
      if (TEST_MODE) {
        console.log('🧪 TEST MODE: Simulating scheduled booking');
        console.log(`🧪 TEST MODE: Will simulate at ${target.toLocaleString()}`);
        console.log(`🧪 TEST MODE: Waiting ${Math.round(delayToExecution / 1000)}s until execution time...\n`);
        
        // In test mode, wait until execution time and log
        await new Promise(resolve => setTimeout(resolve, delayToExecution));
        
        const execTime = new Date();
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🧪 [${execTime.toLocaleString()}] TEST MODE: EXECUTION TIME REACHED!`);
        console.log(`🧪 Target was: ${target.toLocaleString()}`);
        console.log(`🧪 Actual time: ${execTime.toLocaleString()}`);
        console.log(`🧪 Difference: ${Math.round((execTime - target) / 1000)}s`);
        console.log(`🧪 TEST MODE: Would launch browser, login, and book slot`);
        console.log(`🧪 TEST MODE: Simulated booking complete`);
        console.log('='.repeat(60));
      } else {
        // Import and use actual bot
        const { AustinGolfBookingBot } = require('./austin-golf-bot.js');
        // Note: The bot class uses global CONFIG, so we need to set it
        // For now, we'll need to modify the bot to accept config
        // This is a limitation - for production, refactor bot to accept config
        console.log('⚠️  Real booking mode requires bot refactoring');
        console.log('⚠️  For now, use TEST_MODE=true to verify timing');
        await updateStatus('failed', 'Real booking mode not yet implemented - use TEST_MODE');
      }
      
      await updateStatus('completed');
    }
    
    const endTime = new Date();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Bot execution completed`);
    console.log(`📅 Ended at: ${endTime.toLocaleString()}`);
    console.log(`⏱️  Duration: ${Math.round((endTime - startTime) / 1000)}s`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Bot execution failed:', error);
    await updateStatus('failed', error.message);
    process.exit(1);
  }
}

main();

