# Pre-Deployment Verification Checklist ✅

Use this checklist to verify everything is configured correctly in Render before someone uses the UI.

## 🔍 Quick Health Check

**Test your API right now:**
1. Open: `https://test-2dln.onrender.com/api/health`
2. Should see: `{"status":"ok","timestamp":"...","bookings":0}`
3. If you see this → ✅ API is working!

---

## ✅ Step-by-Step Verification

### 1. **API Server (test-2dln) - Verify it's Running**

**In Render Dashboard:**
- [ ] Service shows **"Live"** status (green)
- [ ] Service type is **"Web Service"**
- [ ] Go to **"Logs"** tab
  - [ ] Should see: `🚀 API Server running on port 3000`
  - [ ] Should see: `📡 Endpoints:` list
  - [ ] No error messages

**Test the API:**
```bash
# In your browser or terminal:
curl https://test-2dln.onrender.com/api/health
```
- [ ] Returns: `{"status":"ok","timestamp":"...","bookings":0}`

---

### 2. **Scheduler Service (golf-scheduler) - Verify it's Running**

**In Render Dashboard:**
- [ ] Service shows **"Live"** status (green)
- [ ] Service type is **"Background Worker"**
- [ ] Go to **"Settings"** → **"Scaling"**
  - [ ] Should show **1 instance** (not 0)
- [ ] Go to **"Environment"** tab
  - [ ] Should have: `API_URL` = `https://test-2dln.onrender.com`
  - [ ] Verify the URL matches your API server URL exactly
- [ ] Go to **"Logs"** tab
  - [ ] Should see: `🚀 Scheduler Service Starting...`
  - [ ] Should see: `📡 API URL: https://test-2dln.onrender.com`
  - [ ] Should see polling messages every 60 seconds:
    ```
    ⏰ [timestamp] Checking for upcoming bookings...
    📡 API URL: https://test-2dln.onrender.com
    📋 Total bookings in system: 0
    ```
  - [ ] **NO** `Protocol "https:" not supported` errors
  - [ ] **NO** `ECONNREFUSED` or connection errors

---

### 3. **Test End-to-End Flow**

#### Test 1: Create a Booking via API

**Option A: Use browser**
1. Open: `https://test-2dln.onrender.com/api/bookings`
2. Should see: `{"success":true,"bookings":[],"count":0}`

**Option B: Use curl/terminal**
```bash
curl -X POST https://test-2dln.onrender.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "test123",
    "course": 3,
    "players": 4,
    "holes": 18,
    "targetHour": 7,
    "targetMinute": 0
  }'
```
- [ ] Returns booking with `"success":true`
- [ ] Check scheduler logs - should show the new booking within 60 seconds

#### Test 2: Verify Scheduler Detects Booking

1. Create a test booking (via API or UI)
2. Wait 1 minute
3. Check scheduler logs
4. Should see:
   ```
   📋 Total bookings in system: 1
   ⏳ Booking abc123... scheduled for [date/time] (X seconds away)
   ```

#### Test 3: Test UI Connection

1. Open `booking-ui.html` in browser
2. Click **"⚙️ API Settings"** (if visible)
3. Set API URL to: `https://test-2dln.onrender.com`
4. Click **"Save API URL"**
5. Should see: `✅ Connected to API (X bookings)`
6. Fill out form and submit a test booking
7. Should see: `✅ Booking scheduled for [date/time]`

---

## 🚨 Common Issues to Check

### Issue 1: Scheduler Not Polling
**Symptoms:** No polling messages in scheduler logs
**Check:**
- [ ] Scheduler service status is "Live"
- [ ] Scaling is set to 1 (not 0)
- [ ] Check logs for startup errors

### Issue 2: HTTPS Protocol Error
**Symptoms:** `Protocol "https:" not supported. Expected "http:"`
**Solution:** Make sure the latest code with HTTPS support is deployed
- [ ] Check if scheduler.js has been pushed to GitHub
- [ ] Check Render logs to see which commit is deployed
- [ ] If error persists, trigger a manual deploy

### Issue 3: API Connection Failed
**Symptoms:** `ECONNREFUSED` or connection errors in scheduler
**Check:**
- [ ] API_URL environment variable is set correctly
- [ ] API_URL uses `https://` not `http://`
- [ ] API server is running and shows "Live"
- [ ] API health endpoint works: `https://test-2dln.onrender.com/api/health`

### Issue 4: Bookings Not Executing
**Symptoms:** Bookings are created but never execute
**Check:**
- [ ] Booking `status` is `'scheduled'` (check via `/api/bookings`)
- [ ] Booking `scheduledFor` time is in the future
- [ ] Scheduler is running and polling
- [ ] Wait for scheduled time to be within 2 minutes (scheduler only executes when within 2 min window)

---

## 📋 Quick Verification Script

Run this to test everything at once:

```bash
# Test 1: API Health
echo "Testing API Health..."
curl https://test-2dln.onrender.com/api/health

# Test 2: List Bookings
echo "\n\nTesting List Bookings..."
curl https://test-2dln.onrender.com/api/bookings

# Test 3: Create Booking
echo "\n\nTesting Create Booking..."
curl -X POST https://test-2dln.onrender.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "test123",
    "targetHour": 23,
    "targetMinute": 59
  }'

echo "\n\n✅ All tests complete!"
```

---

## ✅ Final Checklist Before Going Live

Before someone uses the UI, verify:

- [ ] API server is "Live" and responding to `/api/health`
- [ ] Scheduler is "Live" and polling every 60 seconds
- [ ] Scheduler logs show `📡 API URL: https://test-2dln.onrender.com`
- [ ] No errors in scheduler logs
- [ ] API_URL environment variable is set correctly in scheduler
- [ ] Test booking can be created via API
- [ ] Test booking appears in scheduler logs within 60 seconds
- [ ] UI can connect to API (test with booking-ui.html)

---

## 🎯 When Someone Submits a Booking via UI

Here's what will happen:

1. **UI sends POST** to `https://test-2dln.onrender.com/api/bookings`
2. **API receives booking** and stores it in memory
3. **API logs:** `✅ New booking created: [id]`
4. **API returns** booking confirmation to UI
5. **UI shows:** "✅ Booking scheduled for [date/time]"
6. **Scheduler polls** every 60 seconds
7. **When booking time is within 2 minutes:**
   - Scheduler detects it
   - Scheduler triggers bot execution
   - Bot runs and attempts booking
   - Status updates to `completed` or `failed`

---

## 📞 If Something Doesn't Work

1. **Check API logs** - Look for error messages
2. **Check Scheduler logs** - Look for connection or execution errors
3. **Verify environment variables** - Make sure API_URL is correct
4. **Test API directly** - Use curl or browser to test endpoints
5. **Check service status** - Make sure both services show "Live"

---

## 🎉 You're Ready When...

✅ API server responds to `/api/health`  
✅ Scheduler shows polling messages every 60 seconds  
✅ No errors in either service's logs  
✅ Test booking can be created and appears in scheduler logs  

Then you're good to go! The UI will work when someone submits a booking.
