/**
 * Diagnostic script to check scheduler configuration and connectivity
 */

const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:3000';

console.log('🔍 Scheduler Diagnostic Tool\n');
console.log('='.repeat(60));
console.log(`📡 API URL: ${API_URL}`);
console.log('='.repeat(60));

// Test 1: Check if API is reachable
async function testAPIConnectivity() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/health`);
    
    console.log('\n1️⃣ Testing API Connectivity...');
    console.log(`   GET ${url.toString()}`);
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk.toString(); });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`   ✅ API is reachable!`);
          console.log(`   📊 Status: ${response.status}`);
          console.log(`   📅 Timestamp: ${response.timestamp}`);
          console.log(`   📋 Bookings in system: ${response.bookings}`);
          resolve(response);
        } catch (e) {
          console.log(`   ⚠️  API responded but response is not JSON`);
          console.log(`   Response: ${data.substring(0, 200)}`);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Cannot reach API!`);
      console.log(`   Error: ${err.message}`);
      if (err.code === 'ENOTFOUND') {
        console.log(`   💡 Check if API_URL is correct: ${API_URL}`);
      } else if (err.code === 'ECONNREFUSED') {
        console.log(`   💡 API server might not be running or URL is wrong`);
      }
      reject(err);
    });
  });
}

// Test 2: Fetch bookings
async function testFetchBookings() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/bookings`);
    
    console.log('\n2️⃣ Testing Bookings Endpoint...');
    console.log(`   GET ${url.toString()}`);
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk.toString(); });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log(`   ✅ Successfully fetched bookings!`);
            console.log(`   📋 Total bookings: ${response.bookings.length}`);
            
            if (response.bookings.length === 0) {
              console.log(`   ⚠️  No bookings found in system`);
              console.log(`   💡 This could mean:`);
              console.log(`      - No bookings have been created`);
              console.log(`      - API server restarted (in-memory storage lost)`);
            } else {
              console.log(`\n   📅 Bookings:`);
              response.bookings.forEach((booking, idx) => {
                const scheduledTime = new Date(booking.scheduledFor);
                const now = new Date();
                const timeUntil = scheduledTime - now;
                const hoursUntil = Math.round(timeUntil / (1000 * 60 * 60));
                const minutesUntil = Math.round(timeUntil / (1000 * 60));
                
                console.log(`\n   Booking ${idx + 1}:`);
                console.log(`      ID: ${booking.id.substring(0, 8)}...`);
                console.log(`      Status: ${booking.status}`);
                console.log(`      Scheduled: ${scheduledTime.toLocaleString()}`);
                console.log(`      Course: ${booking.course}, Players: ${booking.players}`);
                console.log(`      Time until: ${hoursUntil}h ${minutesUntil % 60}m`);
                
                if (booking.status === 'scheduled') {
                  if (timeUntil < 0) {
                    console.log(`      ⚠️  Scheduled time has PASSED!`);
                    console.log(`      💡 Scheduler should have executed this already`);
                  } else if (timeUntil <= 120000) {
                    console.log(`      ✅ Within 2-minute window - should execute soon!`);
                  } else {
                    console.log(`      ⏳ Too far in future - scheduler will wait`);
                  }
                } else {
                  console.log(`      ℹ️  Status is '${booking.status}' - scheduler will skip this`);
                }
              });
            }
            
            resolve(response.bookings);
          } else {
            console.log(`   ❌ API returned error`);
            reject(new Error('API returned error'));
          }
        } catch (e) {
          console.log(`   ❌ Failed to parse response: ${e.message}`);
          console.log(`   Response: ${data.substring(0, 200)}`);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Cannot fetch bookings!`);
      console.log(`   Error: ${err.message}`);
      reject(err);
    });
  });
}

// Test 3: Check timezone
function testTimezone() {
  console.log('\n3️⃣ Checking Timezone...');
  const now = new Date();
  console.log(`   Current time: ${now.toLocaleString()}`);
  console.log(`   UTC time: ${now.toISOString()}`);
  console.log(`   Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  console.log(`   Timezone offset: ${now.getTimezoneOffset()} minutes`);
}

// Test 4: Simulate scheduler logic
async function simulateSchedulerCheck() {
  console.log('\n4️⃣ Simulating Scheduler Check...');
  
  try {
    const bookings = await testFetchBookings();
    if (bookings.length === 0) {
      console.log(`   ⏭️  No bookings to check`);
      return;
    }
    
    const now = new Date();
    const PRE_POSITION_BUFFER = 120000; // 2 minutes
    
    const upcomingBookings = bookings.filter(booking => {
      if (booking.status !== 'scheduled') {
        return false;
      }
      
      const scheduledTime = new Date(booking.scheduledFor);
      const timeUntilExecution = scheduledTime - now;
      
      return timeUntilExecution > 0 && timeUntilExecution <= PRE_POSITION_BUFFER;
    });
    
    if (upcomingBookings.length > 0) {
      console.log(`\n   ✅ Found ${upcomingBookings.length} booking(s) that SHOULD execute now!`);
      upcomingBookings.forEach(booking => {
        const scheduledTime = new Date(booking.scheduledFor);
        const timeUntil = scheduledTime - now;
        console.log(`      - ${booking.id.substring(0, 8)}... (${Math.round(timeUntil / 1000)}s until scheduled time)`);
      });
    } else {
      console.log(`   ℹ️  No bookings ready to execute right now`);
    }
  } catch (err) {
    console.log(`   ❌ Could not simulate check: ${err.message}`);
  }
}

// Main
async function main() {
  try {
    await testAPIConnectivity();
    testTimezone();
    await simulateSchedulerCheck();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnostic Complete!');
    console.log('='.repeat(60));
    console.log('\n💡 Next Steps:');
    console.log('   1. Check scheduler logs on Render');
    console.log('   2. Verify API_URL environment variable in scheduler service');
    console.log('   3. Make sure scheduler service is running (not scaled to 0)');
    console.log('   4. Check if API server restarted (would lose in-memory bookings)');
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ Diagnostic Failed!');
    console.log('='.repeat(60));
    console.log(`\nError: ${error.message}`);
    process.exit(1);
  }
}

main();
