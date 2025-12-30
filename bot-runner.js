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
    // IMPORTANT: The scheduler already determined the right time to run
    // We should run immediately, not re-calculate timing
    // CONFIG.DATE is for which date to book (tee time date), not when to run
    // CONFIG.TARGET_HOUR/TARGET_MINUTE were used by scheduler, we don't need them here
    
    console.log(`\n⏰ EXECUTION MODE:`);
    console.log(`   Scheduler triggered bot execution`);
    console.log(`   Bot will run immediately to book tee time`);
    console.log(`   Tee Time Date: ${CONFIG.DATE || 'Today'}`);
    console.log(`   Time Range: ${CONFIG.TIME_START} - ${CONFIG.TIME_END}\n`);
    
    await updateStatus('running');
    
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: Simulating booking (not actually booking)');
      console.log(`🧪 TEST MODE: Would book tee time for date: ${CONFIG.DATE || 'Today'}`);
      console.log(`🧪 TEST MODE: Would launch browser, login, and book slot`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2 second delay
      console.log('🧪 TEST MODE: Simulated booking complete');
    } else {
      // Import and use actual bot
      const { AustinGolfBookingBot } = require('./austin-golf-bot.js');
      const bot = new AustinGolfBookingBot();
      await bot.runImmediately();
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
    await updateStatus('failed', error.message);
    process.exit(1);
  }
}

main();

