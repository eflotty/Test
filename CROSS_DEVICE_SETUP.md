# 📱 Cross-Device Setup Guide

## How It Works Across Devices

The system now works on **any phone, computer, or device** as long as they can communicate:

1. **Config Server** runs on your main computer
2. **UI** can be accessed from any device (phone, tablet, friend's computer)
3. **Bot** can run on any computer that can reach the config server

## Setup Options

### Option 1: Same WiFi Network (Easiest)

**On your main computer:**
```bash
cd /Users/eddieflottemesch/Downloads/golfbot
npm run config-server
```

You'll see:
```
📡 Config server running!
   Local:  http://localhost:3001
   Network: http://192.168.1.100:3001
```

**On any phone/device on same WiFi:**
1. Open the booking UI (Netlify or local server)
2. If prompted, enter the **Network URL**: `http://192.168.1.100:3001`
3. Fill form and save - it automatically saves to your computer!

**On any computer (same WiFi):**
```bash
# Set the server URL
export CONFIG_SERVER_URL=http://192.168.1.100:3001

# Run the bot
node austin-golf-bot.js --schedule
```

### Option 2: Internet Access (Works Anywhere)

**On your main computer:**
```bash
# Terminal 1: Start config server
npm run config-server

# Terminal 2: Expose with ngrok (free)
ngrok http 3001
```

You'll get a URL like: `https://abc123.ngrok.io`

**On any phone/device (anywhere in the world):**
1. Open booking UI
2. Enter server URL: `https://abc123.ngrok.io`
3. Save config - it goes to your computer!

**On any computer (anywhere):**
```bash
export CONFIG_SERVER_URL=https://abc123.ngrok.io
node austin-golf-bot.js --schedule
```

### Option 3: Cloud Hosting (Permanent)

Deploy `config-server.js` to:
- **Heroku** (free tier)
- **Railway** (free tier)
- **Render** (free tier)
- **Fly.io** (free tier)

Then use that URL everywhere!

## Quick Reference

### Finding Your Computer's IP

**Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

**Linux:**
```bash
hostname -I
```

### Setting Server URL

**In the UI:**
- Enter in the "Config Server URL" field
- Saves to localStorage automatically

**For the Bot:**
```bash
# Linux/Mac
export CONFIG_SERVER_URL=http://192.168.1.100:3001

# Windows
set CONFIG_SERVER_URL=http://192.168.1.100:3001

# Or in .env file
echo "CONFIG_SERVER_URL=http://192.168.1.100:3001" > .env
```

## Examples

### Example 1: You + Friend's Phone
1. You run config server on your Mac: `192.168.1.100:3001`
2. Friend opens UI on their phone (same WiFi)
3. Friend enters: `http://192.168.1.100:3001`
4. Friend saves config → goes to your Mac
5. You run bot → loads friend's config automatically!

### Example 2: You + Remote Friend
1. You run config server + ngrok: `https://abc123.ngrok.io`
2. Friend opens UI from anywhere
3. Friend enters: `https://abc123.ngrok.io`
4. Friend saves → goes to your computer via ngrok
5. Bot loads automatically!

### Example 3: Multiple People, One Bot
1. Deploy config server to Heroku: `https://golf-config.herokuapp.com`
2. Everyone uses same URL in UI
3. Last person to save = active config
4. Bot always uses latest config!

## Troubleshooting

**"Can't connect to server"**
- Check firewall isn't blocking port 3001
- Make sure devices are on same WiFi (for local)
- Verify IP address is correct
- Try ngrok for internet access

**"Config not loading"**
- Check server is running: `npm run config-server`
- Verify URL is correct (include http://)
- Check server logs for errors

**"Works on one device but not another"**
- Make sure server URL is accessible from that device
- Check network connectivity
- Try using ngrok for universal access

## Security Note

The config server has **no authentication** by default. For production use:
- Use ngrok with password protection
- Deploy to cloud with authentication
- Or keep on local network only

