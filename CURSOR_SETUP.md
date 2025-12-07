# Installation Guide for Cursor/VS Code 💻

## Step-by-Step Setup

### 1. Create Project Folder

In your terminal or Cursor:

```bash
mkdir austin-golf-bot
cd austin-golf-bot
```

### 2. Copy All Files

Copy these files into your `austin-golf-bot` folder:
- `austin-golf-bot.js` - Main bot script
- `package.json` - Dependencies
- `setup.sh` - Setup script (optional)
- `inspect-page.js` - Page inspector (optional, for debugging)
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick reference

### 3. Install Dependencies

In Cursor terminal:

**Option A: Use the setup script (Mac/Linux)**
```bash
chmod +x setup.sh
./setup.sh
```

**Option B: Manual install (All platforms)**
```bash
npm install
npx playwright install chromium
```

### 4. Configure Your Credentials

Open `austin-golf-bot.js` in Cursor and find the CONFIG section (around line 10):

```javascript
const CONFIG = {
  // YOUR INFO - CHANGE THESE!
  USERNAME: 'your_username_here',  // ← Your Austin golf username
  PASSWORD: 'your_password_here',  // ← Your Austin golf password
  
  // BOOKING TIME - CHANGE THESE!
  TARGET_HOUR: 7,      // ← Hour when tee times open (24-hour format)
  TARGET_MINUTE: 0,    // ← Minute
  TARGET_SECOND: 0,    // ← Second
  
  // Everything else below can stay default...
```

Save the file.

### 5. Test It

In Cursor terminal:

```bash
node austin-golf-bot.js --now
```

This will:
1. Open a browser window
2. Log in with your credentials
3. Navigate to the booking page
4. Pause for you to inspect
5. Press Enter in terminal to test booking

**What to check:**
- ✅ Does it log in successfully?
- ✅ Does it reach the booking page?
- ✅ Can you see time slots (if any are available)?

### 6. Run for Real

When you're ready to book (the day of):

```bash
node austin-golf-bot.js --schedule
```

**Important:**
- Run this 5-10 minutes BEFORE your target time
- Keep Cursor/terminal open
- The bot will wait and execute at exact time
- Browser will stay open for you to complete checkout

## Cursor-Specific Tips

### Running Commands in Cursor

1. Open terminal: `` Ctrl+` `` (or View → Terminal)
2. Make sure you're in the project folder: `pwd`
3. Run commands as shown above

### Editing the Bot

Use Cursor's search (Cmd+F or Ctrl+F) to find:
- `USERNAME:` - to update your username
- `PASSWORD:` - to update your password  
- `TARGET_HOUR:` - to set booking time

### Debugging

If something doesn't work:

1. **Check console output** - Errors will show in terminal
2. **View screenshots** - Error screenshots save automatically
3. **Use the inspector** - Run `node inspect-page.js` to analyze the page
4. **Test selectors** - Run `node austin-golf-bot.js --test`

### File Structure

```
austin-golf-bot/
├── austin-golf-bot.js     ← Main bot (this is what runs)
├── package.json           ← Dependencies list
├── package-lock.json      ← (Created by npm install)
├── node_modules/          ← (Created by npm install)
├── setup.sh               ← One-command setup
├── inspect-page.js        ← Debugging tool
├── README.md              ← Full documentation
└── QUICKSTART.md          ← Quick reference
```

## Common Issues in Cursor

### "node: command not found"
→ Install Node.js from https://nodejs.org/
→ Restart Cursor after installing

### "Cannot find module 'playwright'"
→ Run `npm install` in the terminal
→ Make sure you're in the right folder (`pwd`)

### "Permission denied: ./setup.sh"
→ Run `chmod +x setup.sh` first
→ Or use manual install method instead

### Browser doesn't open
→ Run `npx playwright install chromium`
→ Check if antivirus is blocking it

### Login fails every time
→ Verify credentials work on the website manually
→ Check for typos in USERNAME and PASSWORD
→ Make sure account is active

## NPM Scripts (Shortcuts)

Add these to your workflow:

```bash
npm run now      # Same as: node austin-golf-bot.js --now
npm run schedule # Same as: node austin-golf-bot.js --schedule  
npm run test     # Same as: node austin-golf-bot.js --test
```

## VS Code Users

Everything above works the same in VS Code! Just:
1. Open folder in VS Code
2. Open integrated terminal
3. Follow the same commands

## Need Help?

1. Check `README.md` for detailed troubleshooting
2. Check `QUICKSTART.md` for common solutions
3. Run `--test` to see what's being detected
4. Save error screenshots that are auto-generated

---

**You're all set! Good luck with your booking!** 🏌️⛳
