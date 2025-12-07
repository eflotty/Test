# 🤖 Fully Automated Config Setup

## How It Works

1. **User fills out form on phone** → Saves to config server
2. **Bot automatically loads** → Reads from config server
3. **No file transfers needed!** → Everything is automatic

## Quick Start

### Step 1: Start the Config Server

On your computer, run:

```bash
cd /Users/eddieflottemesch/Downloads/golfbot
npm run config-server
```

This starts a local server on port 3001 that stores your config.

**Keep this running** in a terminal window.

### Step 2: Update UI to Point to Your Computer

If your phone and computer are on the same WiFi:

1. Find your computer's IP address:
   ```bash
   # Mac
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```
   Look for something like `192.168.1.100`

2. In the booking UI on your phone:
   - Open browser console (if possible) or
   - The UI will try `http://localhost:3001` first
   - If that doesn't work, you need to update the server URL

### Step 3: Use the UI

1. Fill out the form on your phone
2. Click "Save Config"
3. Config is automatically saved to the server
4. Bot will load it automatically when you run it!

### Step 4: Run the Bot

```bash
node austin-golf-bot.js --schedule
```

The bot will automatically load the latest config from the server!

## Alternative: Use Netlify + Config Server

If you want to access the UI from anywhere (not just same WiFi):

### Option A: Expose Config Server with ngrok

1. Start config server:
   ```bash
   npm run config-server
   ```

2. In another terminal, start ngrok:
   ```bash
   ngrok http 3001
   ```

3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

4. Update the UI to use that URL (or set it in localStorage)

### Option B: Use a Cloud Service

The config server can be deployed to:
- Heroku (free tier)
- Railway
- Render
- Any Node.js hosting

Just deploy `config-server.js` and update the UI URL.

## Fully Automated Workflow

1. **Start config server** (once, keep running):
   ```bash
   npm run config-server
   ```

2. **User fills form on phone** → Auto-saves to server

3. **Run bot** → Auto-loads from server:
   ```bash
   node austin-golf-bot.js --schedule
   ```

That's it! No file transfers, no manual steps!

## Troubleshooting

**"Config server not available"**
→ Make sure `npm run config-server` is running

**"Can't connect from phone"**
→ Make sure phone and computer are on same WiFi
→ Check firewall isn't blocking port 3001
→ Try using ngrok for external access

**"Bot uses old config"**
→ Config server stores the latest config
→ Restart the bot to reload

