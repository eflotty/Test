# Scheduler Setup Guide ⏰

## The Problem

Your booking was created and received by the API server, but **the scheduler service is not running**. The scheduler is what actually executes the bookings when their scheduled time arrives.

## Quick Fix: Deploy Scheduler on Render

### Option 1: Using Render Dashboard (Recommended)

1. **Go to your Render dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Background Worker"**
3. **Configure the service**:
   - **Name**: `golf-booking-scheduler`
   - **Repository**: Select your GitHub repo
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave blank (or `/` if required)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node scheduler.js`
4. **Add Environment Variable**:
   - **Key**: `API_URL`
   - **Value**: Your API server URL (e.g., `https://golf-booking-api.onrender.com`)
     - ⚠️ **Important**: Use `https://` not `http://`
     - ⚠️ **Important**: Don't include `/api` at the end, just the base URL
5. **Click "Create Background Worker"**
6. **Wait for deployment** - The scheduler will start polling for bookings

### Option 2: Using render.yaml (If you redeploy)

If you redeploy your entire stack using `render.yaml`, the scheduler service will be included. However, you'll still need to:

1. Set the `API_URL` environment variable manually in the Render dashboard
2. The value should be: `https://golf-booking-api.onrender.com` (or your actual API URL)

## Verify It's Working

Once deployed, check the scheduler logs:

1. Go to your scheduler service in Render dashboard
2. Click on "Logs" tab
3. You should see:
   ```
   🚀 Scheduler Service Starting...
   📡 API URL: https://your-api-url.com
   ⏱️  Poll interval: 60s
   ⏰ Pre-position buffer: 120s
   ⏰ [timestamp] Checking for upcoming bookings...
   ```

4. Every 60 seconds, you should see logs like:
   ```
   ⏰ [timestamp] Checking for upcoming bookings...
   📋 Total bookings in system: 1
   ⏳ Booking abc123... scheduled for 12/13/2025, 8:00:00 PM (12345s away)
   ```

## How It Works

1. **Scheduler polls every 60 seconds** for upcoming bookings
2. **When a booking is within 2 minutes** of its scheduled time, the scheduler triggers the bot
3. **The bot executes** the booking automatically
4. **Status updates** are sent back to the API

## Troubleshooting

### Scheduler not finding bookings
- ✅ Check `API_URL` is correct (should be your API server URL)
- ✅ Make sure API server is running and accessible
- ✅ Check scheduler logs for connection errors

### Scheduler not executing bookings
- ✅ Verify booking `status` is `'scheduled'` (not `'running'` or `'completed'`)
- ✅ Check that scheduled time is in the future
- ✅ Look for errors in scheduler logs

### API_URL format
- ✅ **Correct**: `https://golf-booking-api.onrender.com`
- ❌ **Wrong**: `https://golf-booking-api.onrender.com/api`
- ❌ **Wrong**: `http://golf-booking-api.onrender.com` (use https)

## Test It

1. Create a test booking scheduled for **2-3 minutes in the future**
2. Watch the scheduler logs
3. You should see:
   ```
   ✅ Booking abc123... needs execution!
      Scheduled: [timestamp]
      Time until: 120s
   🚀 Found 1 booking(s) ready to execute!
   🤖 EXECUTING BOT FOR BOOKING abc123...
   ```

## Important Notes

- **Background Workers on Render are always-on** (unlike free web services which sleep)
- **The scheduler must be running 24/7** to catch bookings
- **If the scheduler stops, bookings won't execute** (but they'll remain in the database)
- **Free tier on Render**: Background Workers may have some limitations, consider upgrading if needed
