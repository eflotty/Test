# 🎯 Austin Golf Booking Bot - Complete Package

## What You Have

This is a complete, production-ready booking bot specifically built for Austin municipal golf courses using the WebTrac system.

## 📦 Files Included

### Core Files (Required)

1. **austin-golf-bot.js** - The main bot
   - Pre-positions 45 seconds before target time
   - Logs in automatically
   - Books first available slot
   - Optimized for maximum speed
   - Keeps browser open for manual checkout

2. **package.json** - Dependencies configuration
   - Lists Playwright as dependency
   - Includes helpful npm scripts
   - Required for `npm install`

### Documentation (Helpful)

3. **README.md** - Complete documentation
   - Full feature list
   - Configuration options
   - Troubleshooting guide
   - Technical details

4. **QUICKSTART.md** - Quick reference guide
   - Step-by-step usage
   - Command reference
   - Common scenarios
   - Tips for success

5. **CURSOR_SETUP.md** - Installation guide for Cursor/VS Code
   - Step-by-step setup
   - Editor-specific tips
   - Common issues
   - File structure

### Optional Tools

6. **setup.sh** - One-command setup script (Mac/Linux)
   - Checks Node.js installation
   - Installs dependencies
   - Installs Chromium browser
   - Validates everything

7. **inspect-page.js** - Debugging tool
   - Opens the booking page
   - Extracts HTML structure
   - Tests selectors
   - Takes screenshots
   - Useful if selectors need updating

## 🚀 Quick Start (3 Steps)

### 1. Install
```bash
npm install
npx playwright install chromium
```

### 2. Configure
Edit `austin-golf-bot.js`:
- Add your USERNAME
- Add your PASSWORD
- Set TARGET_HOUR (when slots open)

### 3. Run
```bash
# Test first:
node austin-golf-bot.js --now

# For real booking:
node austin-golf-bot.js --schedule
```

## 🎯 What Makes This Bot Special

### Speed Optimizations
- Disables images for faster loading
- Pre-positions before target time
- Uses fastest Playwright settings
- Direct DOM manipulation
- Minimal wait times

### Built for Austin WebTrac
- Uses correct WebTrac selectors
- Handles WebTrac login system
- Knows WebTrac page structure
- Optimized for golf booking flow

### Safety Features
- Visible browser (you can watch)
- Manual checkout (you complete it)
- Error screenshots
- Graceful failure handling
- Respects one-booking-per-day rule

### Smart Scheduling
- Precise JavaScript timing
- Pre-positions early (45s default)
- Accounts for login/navigation time
- Executes at exact second
- Handles next-day scheduling

## 📋 Typical Usage Flow

**Day Before Booking:**
```bash
# Test that everything works
node austin-golf-bot.js --now
```

**Day of Booking:**
```bash
# Start 5-10 minutes before target time
node austin-golf-bot.js --schedule

# Terminal shows countdown and status
# Browser opens 45s early
# Books at exact target time
# You complete checkout manually
```

## 🔧 Customization

Everything is configurable in the CONFIG section:

```javascript
const CONFIG = {
  USERNAME: 'your_username',
  PASSWORD: 'your_password',
  
  BOOKING_URL: 'https://txaustinweb.myvscloud.com/...',
  
  TARGET_HOUR: 7,           // When slots open
  TARGET_MINUTE: 0,
  TARGET_SECOND: 0,
  
  PRE_POSITION_SECONDS: 45, // How early to position
  
  DISABLE_IMAGES: true,     // Speed optimization
  MAX_WAIT_FOR_SLOTS: 10000,
  
  SELECTORS: {
    // All WebTrac selectors pre-configured
    // Update if page structure changes
  }
};
```

## 🎓 Advanced Features

### Selector Testing
```bash
node austin-golf-bot.js --test
```
Shows which page elements are found.

### Page Inspection
```bash
node inspect-page.js
```
Saves HTML, takes screenshots, analyzes structure.

### NPM Scripts
```bash
npm run now      # Quick test
npm run schedule # Schedule booking
npm run test     # Test selectors
```

## 📊 Success Factors

The bot will be most successful when:

1. ✅ **Internet is stable** - Wired connection recommended
2. ✅ **Tested beforehand** - Run --now to verify login
3. ✅ **Started early** - Run schedule command 5-10 min before
4. ✅ **Credentials correct** - Double-check username/password
5. ✅ **Ready to checkout** - Be nearby to complete booking

## 🛠️ If Something Goes Wrong

The bot includes multiple fallback methods:

1. **Method 1**: Looks for standard + icon links
2. **Method 2**: Looks for + icon images
3. **Method 3**: Scans table rows for bookable slots

If all fail:
- Browser stays open
- Error screenshot saved
- Console shows detailed error
- You can book manually

## 🎯 Target Site

Specifically built for:
- **Site**: Austin municipal golf courses (txaustinweb.myvscloud.com)
- **System**: WebTrac by Vermont Systems
- **Module**: Golf Reservations (GR)
- **URL Pattern**: `.../search.html?display=detail&module=GR&secondarycode=X`

## 📝 Notes

- **Legal**: This bot respects the booking system and course policies
- **Rate**: Only books one slot (per Austin golf rules)
- **Manual**: You complete checkout (ensures you review before paying)
- **Visible**: Browser stays open (no hiding what it does)

## 🏆 Advantages Over Manual Booking

- **Faster**: Executes in milliseconds
- **Precise**: Runs at exact second
- **Reliable**: No human delay
- **Pre-positioned**: Already logged in and ready
- **Optimized**: Maximum speed settings

---

## Which File Do I Use?

**Just want to run it?**
→ `CURSOR_SETUP.md` (or `QUICKSTART.md`)

**Need full documentation?**
→ `README.md`

**Want to customize?**
→ Edit `austin-golf-bot.js`

**Having issues?**
→ Use `inspect-page.js` to debug

**On Mac/Linux?**
→ Run `./setup.sh` for easy setup

---

**You have everything you need! Good luck with your booking!** 🏌️⛳
