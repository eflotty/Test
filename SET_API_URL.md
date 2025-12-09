# How to Set API_URL in Render - Step by Step Guide

## Problem
Your scheduler isn't polling because it doesn't know where your API server is. You need to set the `API_URL` environment variable.

## Step-by-Step Instructions

### Step 1: Open Your Scheduler Service
1. Go to https://dashboard.render.com
2. Find and click on your **`golf-scheduler`** service

### Step 2: Navigate to Environment Tab
1. Look at the **left sidebar** (under the service name)
2. Find the section labeled **"MANAGE"**
3. Click on **"Environment"** (it should be in that section)

### Step 3: Add the API_URL Variable
1. You should see a section for **"Environment Variables"**
2. Look for an input field or a button that says **"Add Environment Variable"** or **"Add Variable"**
3. Click it to add a new variable

4. Fill in:
   - **Key**: `API_URL`
   - **Value**: Your API server URL
     - This should be something like: `https://golf-booking-api.onrender.com`
     - **Important**: 
       - Use `https://` not `http://`
       - Don't include `/api` at the end
       - Just the base URL of your API service

5. Click **"Save"** or **"Add"**

### Step 4: Restart the Service
After adding the environment variable, Render should automatically restart the service. But to be sure:
1. Go to the **"Manual Deploy"** dropdown (top right)
2. Click **"Deploy latest commit"** or restart the service

### Step 5: Verify It's Working
1. Click on **"Logs"** in the left sidebar
2. Look for the startup message:
   ```
   🚀 Scheduler Service Starting...
   📡 API URL: https://your-api-url.com
   ```
3. You should start seeing polling messages every 60 seconds:
   ```
   ⏰ [timestamp] Checking for upcoming bookings...
   📡 API URL: https://your-api-url.com
   📋 Total bookings in system: X
   ```

## Finding Your API Server URL

If you don't know your API server URL:
1. Go to your Render dashboard
2. Find your **API service** (probably named something like `golf-booking-api`)
3. The URL should be displayed at the top, something like:
   - `https://golf-booking-api.onrender.com`
   - `https://golf-booking-api-xxxx.onrender.com`
4. Copy that URL (without any path like `/api`)

## Common Mistakes

❌ **Wrong**: `https://golf-booking-api.onrender.com/api`  
✅ **Correct**: `https://golf-booking-api.onrender.com`

❌ **Wrong**: `http://golf-booking-api.onrender.com` (missing 's')  
✅ **Correct**: `https://golf-booking-api.onrender.com`

❌ **Wrong**: `localhost:3000`  
✅ **Correct**: `https://golf-booking-api.onrender.com`

## Still Not Working?

If you've set the API_URL but still don't see polling messages:

1. **Check the logs** for error messages
2. **Verify your API server is running** - Check the API service logs
3. **Test connectivity** - The API should be accessible at `https://your-api-url.com/api/health`
4. **Check service status** - Make sure the scheduler service shows as "Live" or "Running"
