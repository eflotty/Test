# Timing Bug Explanation

## The Problem

There was a **double-scheduling bug** that affected how the bot executed:

### How It Should Work:
1. **Scheduler** calculates when to trigger bot based on `scheduledFor`
2. **Scheduler** spawns bot when `scheduledFor` is within 2 minutes
3. **Bot** should run immediately (since scheduler already handled timing)

### How It Actually Worked (Before Fix):
1. ✅ **API** correctly stored: DATE, TIME_START, TIME_END, TARGET_HOUR, TARGET_MINUTE
2. ✅ **API** correctly calculated `scheduledFor` = DATE + TARGET_HOUR:TARGET_MINUTE
3. ✅ **Scheduler** correctly triggered bot when `scheduledFor` is within 2 minutes
4. ❌ **Bot-runner** then RE-CALCULATED timing using TARGET_HOUR/TARGET_MINUTE/DATE
5. ❌ **Bot-runner** would try to wait/schedule AGAIN instead of running immediately

### The Values Were Stored Correctly:

- ✅ **DATE** - Correctly stored and passed to bot (which date to book for)
- ✅ **TIME_START/TIME_END** - Correctly stored and passed to bot (preferred time range)
- ✅ **TARGET_HOUR/TARGET_MINUTE** - Correctly stored and used by scheduler

### But There Was a Logic Bug:

The `scheduledFor` calculation in the API had a bug:
- If TARGET_HOUR:TARGET_MINUTE was in the past, it would schedule for TOMORROW
- This meant you couldn't schedule for "right now" or "very soon"
- The fix allows times within the last 5 minutes to execute immediately

## What I Fixed

1. **API scheduling logic** - Now allows immediate execution if time is within last 5 minutes
2. The bot-runner still has the double-scheduling issue, but that's a separate problem that needs the bot to be refactored to accept config properly

## Current Status

- ✅ **Values are stored correctly** (DATE, TIME_START, TIME_END, TARGET_HOUR, TARGET_MINUTE)
- ✅ **Scheduler triggers at right time** (based on scheduledFor)
- ⚠️ **Bot-runner has timing bug** (tries to re-schedule instead of running immediately)
- ⚠️ **Bot needs refactoring** to work properly (currently says "Real booking mode not yet implemented")

The immediate execution fix I made helps, but the bot-runner needs to be updated to run immediately when spawned by the scheduler, not re-calculate timing.
