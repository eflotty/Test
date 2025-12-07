# Quick Test Guide 🧪

## Test Your Booking System

### Step 1: Enable Test Mode

In Render, when you deploy the scheduler:
1. Go to your Background Worker service
2. Click "Environment" tab
3. Add variable:
   - **Key**: `TEST_MODE`
   - **Value**: `true`
4. Save and redeploy

### Step 2: Create a Test Booking

1. Open your UI
2. Set API URL to: `https://test-2dln.onrender.com`
3. Fill form with:
   - **Target Hour**: Current hour
   - **Target Minute**: Current minute + 2 (so it triggers in 2 minutes)
   - Other fields: any values
4. Click "📅 Schedule Booking"

### Step 3: Watch the Logs

In Render dashboard:
1. Go to your **scheduler** service (Background Worker)
2. Click "Logs" tab
3. You'll see:
   ```
   ⏰ [timestamp] Checking for upcoming bookings...
   📋 Total bookings in system: 1
   ✅ Booking abc123... needs execution!
   🚀 Found 1 booking(s) ready to execute!
   🤖 EXECUTING BOT FOR BOOKING...
   ```

### Step 4: Verify Status Updates

1. In UI, click "🔄 Refresh Bookings"
2. Watch status change:
   - `scheduled` → `running` → `completed`
3. Check Render API logs to see status updates

### Step 5: Check Timing

In scheduler logs, you'll see:
```
⏰ TIMING CALCULATION:
   Current time: [time]
   Target time:  [time]
   Delay: 120s
🧪 [execution time] TEST MODE: EXECUTION TIME REACHED!
```

This proves the bot runs at the exact scheduled time!

## What Test Mode Proves

✅ **Request received** - Booking appears in API  
✅ **Scheduler detects** - Logs show booking found  
✅ **Bot triggered** - Logs show bot execution  
✅ **Timing accurate** - Logs show exact execution time  
✅ **Status updates** - Status changes in UI  

## Next Steps

Once test mode works:
1. Remove `TEST_MODE` or set to `false`
2. Bot will actually book (requires bot refactoring for full functionality)
3. For now, test mode proves the system works!

