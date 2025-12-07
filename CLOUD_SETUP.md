# ☁️ Cloud Storage Setup (No Computer Needed!)

## Perfect for Phone-Only Usage

This setup lets you save configs from your phone **even when your computer is off**. The config is stored in the cloud and the bot loads it automatically when you run it.

## How It Works

1. **Phone saves config** → Stored in JSONBin.io (free cloud storage)
2. **Computer is off** → No problem! Config is in the cloud
3. **Later, you start computer** → Bot automatically loads from cloud
4. **No server needed!** → Everything works automatically

## Setup (One Time)

### Step 1: Get Your Bin ID

1. Fill out the form on your phone
2. Click "Save Config"
3. Open browser console (if possible) or check the status message
4. Note the **Bin ID** that gets saved (or check localStorage)

### Step 2: Tell the Bot Your Bin ID

When you run the bot, set the Bin ID:

```bash
export CONFIG_BIN_ID=your-bin-id-here
node austin-golf-bot.js --schedule
```

Or create a `.env` file:
```
CONFIG_BIN_ID=your-bin-id-here
```

### Step 3: That's It!

Now:
- Save config from phone → Goes to cloud
- Run bot on computer → Loads from cloud automatically

## Finding Your Bin ID

### Method 1: From Browser Console
1. Open booking UI on phone
2. Open browser developer tools (if possible)
3. Go to Console tab
4. Save config
5. Look for: `Bin ID: abc123...`

### Method 2: From localStorage
1. Open booking UI
2. In browser console, type: `localStorage.getItem('configBinId')`
3. Copy the ID that appears

### Method 3: Check Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Save config
4. Look at the request to `api.jsonbin.io`
5. Check response for `metadata.id`

## Alternative: Use a Fixed Bin ID

If you want to always use the same bin, you can hardcode it in the UI. But the automatic method (saving bin ID to localStorage) is easier.

## Workflow

**Day 1: Setup**
1. Fill form on phone → Save
2. Get Bin ID from console/localStorage
3. Set `CONFIG_BIN_ID` environment variable

**Every Time After:**
1. Fill form on phone → Save (automatically uses same bin)
2. Run bot → Automatically loads from cloud

## Troubleshooting

**"Could not load from cloud"**
- Check Bin ID is correct: `echo $CONFIG_BIN_ID`
- Verify bin is public (should work without API key)
- Check internet connection

**"Empty config"**
- Make sure you saved a config from the UI first
- Check bin ID matches the one from your phone

**"Bin ID not found"**
- Save config again from phone
- Check browser console for the Bin ID
- Or use the file download fallback method

## Benefits

✅ **No server needed** - Works even when computer is off  
✅ **Always available** - Cloud storage is always accessible  
✅ **Automatic** - Bot loads config automatically  
✅ **Free** - JSONBin.io free tier is plenty  
✅ **Works from anywhere** - Phone can be anywhere in the world  

## Fallback Options

If cloud doesn't work:
1. Bot tries local config server (if running)
2. Bot tries local file (`booking-config.json`)
3. Bot uses default values from CONFIG

So you always have options!

