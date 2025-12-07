# 👋 START HERE

## You've Got Everything You Need!

This package contains a complete, ready-to-use booking bot for Austin municipal golf courses.

## 🏃 Get Started in 3 Steps

### Step 1: Setup (5 minutes)
Open `CURSOR_SETUP.md` and follow the installation steps.

**Or quick version:**
```bash
npm install
npx playwright install chromium
```

### Step 2: Configure (2 minutes)
Open `austin-golf-bot.js` and change these lines:

```javascript
USERNAME: 'your_username_here',  // ← Your login
PASSWORD: 'your_password_here',  // ← Your password
TARGET_HOUR: 7,                  // ← When slots open
```

(See `CONFIG_TEMPLATE.md` for more examples)

### Step 3: Test & Run
```bash
# Test it works:
node austin-golf-bot.js --now

# Schedule real booking:
node austin-golf-bot.js --schedule
```

## 📚 Documentation Guide

**New to this?** → Read `QUICKSTART.md`

**Installing in Cursor?** → Read `CURSOR_SETUP.md`

**Want all the details?** → Read `README.md`

**Need to customize?** → See `CONFIG_TEMPLATE.md`

**Overview of everything?** → Read `OVERVIEW.md`

## 🎯 What This Bot Does

1. **Waits** until 45 seconds before your target time
2. **Opens** browser and logs in
3. **Navigates** to booking page
4. **Executes** booking at exact target time
5. **Adds** first available slot to cart
6. **Leaves browser open** for you to checkout

## ⚡ Quick Command Reference

```bash
# First time setup
npm install
npx playwright install chromium

# Test the bot (do this first!)
node austin-golf-bot.js --now

# Schedule for real booking
node austin-golf-bot.js --schedule

# Test selectors only
node austin-golf-bot.js --test

# Debug the page
node inspect-page.js
```

## ✅ Pre-flight Checklist

Before your real booking:

- [ ] Tested with `--now` command
- [ ] Login works correctly
- [ ] Bot reaches booking page
- [ ] Credentials saved in config
- [ ] Target time is correct
- [ ] Stable internet connection
- [ ] Will be near computer to checkout

## 🆘 Need Help?

**Login fails?**
→ Check username/password in austin-golf-bot.js

**No slots found?**
→ Normal if testing off-hours. Will work when slots release.

**Browser won't open?**
→ Run: `npx playwright install chromium`

**Other issues?**
→ Check `README.md` troubleshooting section

## 🎓 How It Works

This bot uses **Playwright** (browser automation) to:
- Control a real Chrome browser
- Execute actions at precise times
- Maximize booking speed
- Let you complete checkout manually

It's specifically built for the **Austin WebTrac** booking system with optimized selectors and timing.

## 📝 Files Included

| File | Purpose |
|------|---------|
| `austin-golf-bot.js` | Main bot code |
| `package.json` | Dependencies |
| `setup.sh` | Easy setup script |
| `README.md` | Full documentation |
| `QUICKSTART.md` | Quick reference |
| `CURSOR_SETUP.md` | Cursor installation guide |
| `CONFIG_TEMPLATE.md` | Configuration examples |
| `OVERVIEW.md` | Complete overview |
| `inspect-page.js` | Debugging tool |

## 🚀 Ready to Go?

1. **Right now**: Open `CURSOR_SETUP.md`
2. **Follow the steps**: 5-minute setup
3. **Test it**: Run with `--now`
4. **Book your tee time**: Run with `--schedule`

---

**Good luck with your booking!** 🏌️⛳

Questions? Check the other documentation files for detailed info.
