# Test Mode 🧪

## How to Enable Test Mode

Test mode prevents the bot from actually booking, but shows all the logging and timing to prove it's working.

### Option 1: Environment Variable (Recommended)

When deploying the scheduler on Render, add this environment variable:

**Variable Name**: `TEST_MODE`  
**Value**: `true`

### Option 2: Set in Scheduler

The scheduler will pass `TEST_MODE` to the bot runner automatically if set.

## What Test Mode Does

✅ **Shows all logging** - You'll see exactly when the bot runs  
✅ **Shows timing** - Proves it runs at the correct time  
✅ **Updates status** - Booking status changes to "running" then "completed"  
❌ **Doesn't actually book** - No browser, no login, no booking  

## What You'll See in Logs

### Scheduler Logs:
```
⏰ [2024-01-15 7:00:00 AM] Checking for upcoming bookings...
📋 Total bookings in system: 1
✅ Booking abc123... needs execution!
   Scheduled: 1/15/2024, 7:00:00 AM
   Time until: 120s
🚀 Found 1 booking(s) ready to execute!
🤖 [timestamp] EXECUTING BOT FOR BOOKING abc123
   ✅ Bot process started (PID: 12345)
```

### Bot Runner Logs:
```
🤖 BOT RUNNER STARTING
📅 Started at: 1/15/2024, 6:58:00 AM
🧪 TEST MODE: ENABLED (will not actually book)
⏰ TIMING CALCULATION:
   Current time: 1/15/2024, 6:58:00 AM
   Target time:  1/15/2024, 7:00:00 AM
   Delay: 120s (2 minutes)
🧪 TEST MODE: Will simulate at 1/15/2024, 7:00:00 AM
🧪 [7:00:00 AM] TEST MODE: EXECUTION TIME REACHED!
```

## Status Updates

You'll see the booking status change:
1. `scheduled` → When you create the booking
2. `running` → When scheduler triggers the bot
3. `completed` → When bot finishes (test mode)

## Testing Steps

1. **Enable Test Mode** in Render scheduler environment variables
2. **Create a test booking** with a time 2-3 minutes in the future
3. **Watch the logs** in Render dashboard
4. **Check status** in UI - should change to "running" then "completed"
5. **Verify timing** - logs will show exact execution time

## Example Test Booking

- **Date**: Today
- **Target Hour**: Current hour + 1
- **Target Minute**: Current minute + 2
- This will trigger in ~2 minutes for testing

## Disable Test Mode

To actually book, remove or set `TEST_MODE` to `false` in Render environment variables.

