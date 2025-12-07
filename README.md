# Austin Golf Booking Bot 🏌️

Automated booking bot for Austin municipal golf courses using the WebTrac system.

## 🎯 What It Does

- **Logs in** to your Austin golf account
- **Pre-positions** on the booking page 45 seconds before slots open
- **Instantly books** the first available time slot at your target time
- **Adds to cart** and leaves browser open for you to complete checkout
- **Maximum speed** with optimized settings

## 📋 Requirements

- Node.js (v16 or higher)
- npm
- Your Austin golf account credentials

## 🚀 Setup

1. **Install dependencies:**
   ```bash
   npm install
   npx playwright install chromium
   ```

2. **Configure the bot:**
   
   Open `austin-golf-bot.js` and edit the CONFIG section:
   
   ```javascript
   const CONFIG = {
     USERNAME: 'your_username_here',  // Your Austin golf login
     PASSWORD: 'your_password_here',  // Your password
     
     TARGET_HOUR: 7,      // What time slots open (24-hour)
     TARGET_MINUTE: 0,    // Usually :00
     TARGET_SECOND: 0,
     
     // Other settings can stay as-is
   };
   ```

## 🧪 Testing First (Important!)

Before running for a real booking, TEST THE BOT:

```bash
node austin-golf-bot.js --now
```

This will:
1. Open the browser
2. Log you in
3. Navigate to the booking page
4. Let you inspect the page
5. Press Enter to test the booking sequence

**Check that:**
- Login works
- It navigates to the correct course page
- It can find time slots (if any are available)

## 🎮 Usage

### Test Mode (recommended first)
```bash
node austin-golf-bot.js --now
```

### Test Selectors Only
```bash
node austin-golf-bot.js --test
```
Shows which page elements it can find

### Schedule Real Booking
```bash
node austin-golf-bot.js --schedule
```
This will:
1. Wait until 45 seconds before target time
2. Open browser and log in
3. Navigate to booking page
4. At exactly TARGET_TIME, book first available slot
5. Leave browser open for you to checkout

**Keep the terminal window open** while waiting!

## ⚙️ Configuration Options

In `austin-golf-bot.js`, you can adjust:

| Setting | Description | Default |
|---------|-------------|---------|
| `TARGET_HOUR` | Hour when slots open (24-hour) | 7 |
| `TARGET_MINUTE` | Minute when slots open | 0 |
| `TARGET_SECOND` | Second when slots open | 0 |
| `PRE_POSITION_SECONDS` | How early to log in & position | 45 |
| `DISABLE_IMAGES` | Speed optimization | true |
| `MAX_WAIT_FOR_SLOTS` | Max time to wait for slots | 10000ms |

## 🔍 Troubleshooting

### "Login failed" error
- Check your username/password in CONFIG
- Make sure you can log in manually first
- Check if account is active

### "No slots available"
- This is normal if you're testing when slots aren't open
- The bot will still add them to cart when they appear
- You can book manually in the open browser

### Selectors not working
1. Run with `--test` flag to see what's found
2. Use browser dev tools (F12) to inspect elements
3. Update selectors in CONFIG.SELECTORS
4. The default selectors are for standard WebTrac systems

### Browser closes immediately
- Check the console for error messages
- Make sure Chromium installed: `npx playwright install chromium`
- Try running with `--now` first

## 📝 How It Works

1. **Scheduling**: Uses JavaScript setTimeout for precise timing
2. **Pre-positioning**: Opens browser early, logs in, navigates to page
3. **Execution**: At exact target time, finds and clicks first available slot
4. **Speed optimizations**: 
   - Disables images to load faster
   - Uses fastest Playwright settings
   - Minimizes wait times
   - Direct DOM manipulation

## ⚡ Speed Tips

- Make sure internet connection is stable
- Close other apps using bandwidth
- Use wired connection if possible
- Test beforehand to ensure login works
- Don't schedule too close to target time (45s pre-position is good)

## 🛡️ Safety

- Browser stays visible (not headless) so you can intervene
- You complete the checkout manually
- Only books one slot (as per Austin golf rules)
- Respects the booking system

## 📸 Error Recovery

If something goes wrong:
- Screenshot saved as `error-[timestamp].png`
- Browser stays open for manual booking
- Check console for error details
- Common issues have specific error messages

## 🎯 Best Practices

1. **Test first** with `--now` during off hours
2. **Schedule 5-10 minutes early** to ensure system is ready
3. **Have backup plan** - be ready to book manually
4. **One booking per account per day** (Austin golf rule)
5. **Be ready to checkout** - bot adds to cart, you finish

## 📧 Common Issues

**Q: Can I book multiple times?**
A: No - Austin golf allows one tee time per account per day

**Q: Will it work for other courses?**
A: Yes, if they use WebTrac system. Update BOOKING_URL in config.

**Q: Can I run headless?**
A: Not recommended - you need to see the browser to complete checkout

**Q: What if slots are already full?**
A: Bot will report no slots found. Browser stays open for you to check.

## 🏗️ Technical Details

- Built with Playwright (browser automation)
- Uses Chromium browser
- Optimized for speed with resource blocking
- Precise timing with JavaScript scheduling
- Error handling with screenshots
- Graceful degradation if elements not found

## 📜 License

MIT - Use at your own risk. Respect the booking system and golf course policies.

---

**Good luck with your tee time!** 🏌️⛳
