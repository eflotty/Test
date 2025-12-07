/**
 * Bot Runner - Executes the booking bot with provided config
 * 
 * This is called by the scheduler service to execute a booking.
 * It loads config from environment variables and runs the bot.
 */

// We'll use the existing bot file but set CONFIG from env vars
// For now, we'll require the bot and modify CONFIG before it's used
const botModule = require('./austin-golf-bot.js');

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

/**
 * Main execution
 */
async function main() {
  console.log('🤖 Bot Runner Starting...');
  console.log(`📋 Booking ID: ${CONFIG.BOOKING_ID || 'N/A'}`);
  console.log(`👤 Username: ${CONFIG.USERNAME}`);
  console.log(`🏌️  Course: ${CONFIG.COURSE}`);
  console.log(`⏰ Target Time: ${CONFIG.TARGET_HOUR}:${String(CONFIG.TARGET_MINUTE).padStart(2, '0')}`);
  console.log(`📅 Date: ${CONFIG.DATE || 'Today'}`);
  console.log(`👥 Players: ${CONFIG.PLAYERS}, Holes: ${CONFIG.HOLES}`);
  console.log(`⏱️  Time Range: ${CONFIG.TIME_START} - ${CONFIG.TIME_END}`);
  console.log('\n' + '='.repeat(60) + '\n');
  
  try {
    // Create bot instance with config
    const bot = new AustinGolfBookingBot(CONFIG);
    
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
    
    if (delayToExecution < 0) {
      console.log('⚠️  Target time is in the past! Running immediately...\n');
      await updateStatus('running');
      await bot.runImmediately();
      await updateStatus('completed');
    } else {
      console.log(`⏰ Scheduling for ${target.toLocaleString()}`);
      console.log(`   Time until execution: ${Math.round(delayToExecution / 1000)}s\n`);
      
      await updateStatus('running');
      await bot.scheduleBooking();
      await updateStatus('completed');
    }
    
    console.log('\n✅ Bot execution completed');
    
  } catch (error) {
    console.error('\n❌ Bot execution failed:', error);
    await updateStatus('failed', error.message);
    process.exit(1);
  }
}

main();

