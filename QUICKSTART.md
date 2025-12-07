# Quick Start Guide 🚀

## 1. Install (One Time)

```bash
./setup.sh
```

Or manually:
```bash
npm install
npx playwright install chromium
```

## 2. Configure (One Time)

Open `austin-golf-bot.js` in your editor and update:

```javascript
const CONFIG = {
  USERNAME: 'your_actual_username',     // ← Change this
  PASSWORD: 'your_actual_password',     // ← Change this
  
  TARGET_HOUR: 7,        // ← Time when tee times open (24-hour)
  TARGET_MINUTE: 0,      // ← Usually :00
  TARGET_SECOND: 0,
  
  // ... rest can stay default
};
```

## 3. Test (Before Real Booking!)

```bash
node austin-golf-bot.js --now
```

Watch it:
- ✓ Log in
- ✓ Navigate to booking page
- ✓ Find time slots

Press Enter when prompted to test booking.

If it works → proceed to Step 4
If it fails → check credentials and selectors

## 4. Schedule Real Booking

The day you want to book, run:

```bash
node austin-golf-bot.js --schedule
```

What happens:
```
7:00 AM ← Target time (slots open)
6:59:15 AM ← Bot opens browser (45s early)
6:59:16 AM ← Logs in
6:59:17 AM ← Navigates to booking page
6:59:18-59 AM ← Waits, ready to go
7:00:00 AM ← BOOM! Books first slot
7:00:01 AM ← Added to cart
```

**Keep terminal open!** Don't close it while waiting.

Browser will stay open for you to complete checkout.

## Command Reference

| Command | What It Does |
|---------|-------------|
| `--now` | Run immediately for testing |
| `--schedule` | Wait and run at target time |
| `--test` | Test selectors only |

## Timing Examples

**Slots open at 7:00 AM:**
```javascript
TARGET_HOUR: 7,
TARGET_MINUTE: 0,
TARGET_SECOND: 0,
```

**Slots open at 6:00 PM (18:00):**
```javascript
TARGET_HOUR: 18,
TARGET_MINUTE: 0,
TARGET_SECOND: 0,
```

## Tips for Success

1. **Test the night before** - Make sure login works
2. **Run 10 min early** - Start the schedule command with time to spare
3. **Stable internet** - Use wired if possible
4. **Close other apps** - Free up bandwidth
5. **Stay nearby** - You need to complete checkout manually
6. **Have backup** - Be ready to book manually if needed

## What You'll See

```
⏰ BOOKING SCHEDULER
Current time:        6:50:00 AM
Pre-position at:     6:59:15 AM
Execute booking at:  7:00:00 AM

Time until start:    555 seconds
Time until booking:  600 seconds
================================

[waits...]

⏰ PRE-POSITIONING NOW...
🚀 Launching browser...
✅ Browser launched
🔐 Attempting login...
✅ Successfully logged in!
🧭 Navigating to booking page...
✅ On booking page

✅ Positioned and ready!
⏳ Waiting 45s for exact execution time...

[waits...]

⚡ EXECUTING BOOKING SEQUENCE NOW!
⚡ SEARCHING FOR AVAILABLE SLOTS...
  Method 1: Looking for + icon links...
  ✓ Found 12 available slots!
  🎯 Clicking first available slot...
✅ SLOT BOOKED - ADDED TO CART!

✅ SUCCESS! Slot added to cart.
👆 YOU CAN NOW TAKE OVER TO COMPLETE CHECKOUT
```

## Troubleshooting Quick Fixes

**"Login failed"**
→ Double-check username/password in CONFIG

**"No slots available"**  
→ Normal if testing off-hours. Will work when slots open.

**Browser closes immediately**
→ Check console error. Likely missing Chromium: `npx playwright install chromium`

**Can't find time slots**
→ Run `--test` to see what elements are found
→ May need to update selectors

## Still Stuck?

1. Run with `--test` and check output
2. Take screenshot when error occurs (auto-saved)
3. Check README.md for detailed troubleshooting
4. Test manually in the browser first
