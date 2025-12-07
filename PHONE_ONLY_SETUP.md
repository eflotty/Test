# 📱 Phone-Only Setup (Computer Off)

## Perfect for Your Use Case!

This setup works **even when your computer is completely off**. You save configs from your phone, and when you later start your computer and run the bot, it automatically loads your config from the cloud.

## How It Works

1. **Fill form on phone** → Saves to cloud (jsonstorage.net - free, always available)
2. **Computer is off** → No problem! Config is stored in the cloud
3. **Later, start computer** → Run bot with Storage ID
4. **Bot loads automatically** → Gets config from cloud

## One-Time Setup

### Step 1: Save Config from Phone

1. Open booking UI on your phone
2. Fill out the form
3. Click "Save Config"
4. You'll see a **Storage ID** displayed (something like `abc123-def456-...`)
5. **Copy this ID** - you'll need it!

### Step 2: Set Storage ID When Running Bot

When you run the bot on your computer, set the Storage ID:

```bash
export CONFIG_STORAGE_ID=your-storage-id-here
node austin-golf-bot.js --schedule
```

Or create a `.env` file in the golfbot folder:
```
CONFIG_STORAGE_ID=your-storage-id-here
```

### Step 3: That's It!

Now every time:
- Save config from phone → Goes to cloud automatically
- Run bot → Loads from cloud automatically

## Finding Your Storage ID

After saving the config, you'll see:

```
✅ Config saved to cloud! Storage ID: abc123-def456-...
```

The Storage ID is also displayed in a blue box below the form.

You can also find it by:
1. Opening browser console on phone
2. Typing: `localStorage.getItem('configStorageId')`

## Workflow Example

**Monday 6:00 PM (on phone):**
1. Open booking UI
2. Set date: Tuesday
3. Set time range: 7:00 AM - 10:00 AM
4. Click "Save Config"
5. See Storage ID: `abc123-def456-ghi789`
6. Computer is off - no problem!

**Tuesday 6:45 AM (on computer):**
1. Start computer
2. Run: `export CONFIG_STORAGE_ID=abc123-def456-ghi789`
3. Run: `node austin-golf-bot.js --schedule`
4. Bot loads config from cloud automatically
5. Bot books at 7:00 AM!

## Benefits

✅ **No computer needed** - Save configs even when computer is off  
✅ **Always available** - Cloud storage is always accessible  
✅ **Automatic** - Bot loads config automatically  
✅ **Free** - jsonstorage.net is completely free  
✅ **No API keys** - Works without any authentication  
✅ **Works from anywhere** - Phone can be anywhere in the world  

## Troubleshooting

**"Could not load from cloud"**
- Check Storage ID is correct: `echo $CONFIG_STORAGE_ID`
- Make sure you saved a config from the phone first
- Check internet connection

**"Empty config"**
- Make sure you filled out the form completely before saving
- Try saving again from the phone

**"Storage ID not found"**
- Save config again from phone
- Copy the new Storage ID
- Update your `CONFIG_STORAGE_ID` environment variable

## Fallback Options

If cloud doesn't work, the bot will:
1. Try local config server (if running)
2. Try local file (`booking-config.json`)
3. Use default values from CONFIG

So you always have options!

## Quick Reference

**Save config:**
- Fill form → Click "Save Config" → Copy Storage ID

**Run bot:**
```bash
export CONFIG_STORAGE_ID=your-id-here
node austin-golf-bot.js --schedule
```

That's it! Simple and works even when your computer is off! 🎉

