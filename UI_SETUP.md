# 📱 How to Open the Booking UI on Your Phone

## Option 1: Simple File Transfer (Easiest)

### For iPhone:
1. **Email it to yourself:**
   - Attach `booking-ui.html` to an email
   - Open the email on your phone
   - Tap the attachment
   - Choose "Save to Files" or open in Safari

2. **AirDrop (Mac to iPhone):**
   - Right-click `booking-ui.html`
   - Share → AirDrop
   - Select your iPhone
   - Open in Safari on your phone

3. **iCloud/Google Drive:**
   - Upload `booking-ui.html` to iCloud Drive or Google Drive
   - Open the file on your phone
   - It will open in Safari

### For Android:
1. **Email it to yourself:**
   - Attach `booking-ui.html` to an email
   - Open the email on your phone
   - Tap the attachment
   - It will open in Chrome

2. **Google Drive:**
   - Upload `booking-ui.html` to Google Drive
   - Open the file on your phone
   - It will open in Chrome

## Option 2: Local Web Server (Best for Testing)

### On Your Computer:

1. **Open Terminal** in the golfbot folder:
   ```bash
   cd /Users/eddieflottemesch/Downloads/golfbot
   ```

2. **Start a simple web server:**
   
   **Python 3 (most common):**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Or Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```
   
   **Or Node.js (if you have it):**
   ```bash
   npx http-server -p 8000
   ```

3. **Find your computer's IP address:**
   
   **Mac:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Look for something like `192.168.1.xxx` or `10.0.0.xxx`
   
   **Windows:**
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under your network adapter

4. **On your phone:**
   - Make sure your phone is on the **same WiFi network** as your computer
   - Open a browser (Safari on iPhone, Chrome on Android)
   - Go to: `http://YOUR-IP-ADDRESS:8000/booking-ui.html`
   - Example: `http://192.168.1.100:8000/booking-ui.html`

5. **To stop the server:**
   - Press `Ctrl+C` in the terminal

## Option 3: Share with Friends (Online Hosting)

### Quick & Free Options:

1. **GitHub Pages** (Free, permanent):
   - Create a GitHub account
   - Create a new repository
   - Upload `booking-ui.html` and `manifest.json`
   - Enable GitHub Pages in settings
   - Share the URL: `https://yourusername.github.io/repository-name/booking-ui.html`

2. **Netlify Drop** (Free, instant):
   - Go to https://app.netlify.com/drop
   - Drag and drop the `golfbot` folder
   - Get instant URL to share

3. **Surge.sh** (Free, command-line):
   ```bash
   npm install -g surge
   cd /Users/eddieflottemesch/Downloads/golfbot
   surge
   ```
   Follow prompts to get a URL like `yourname.surge.sh`

4. **ngrok** (Free, temporary tunnel):
   ```bash
   # Install ngrok from https://ngrok.com
   # Start local server first (Option 2)
   ngrok http 8000
   ```
   Share the ngrok URL (works from anywhere, expires when you close it)

## Option 4: Use the Quick Server Script

I've created a `serve-ui.sh` script that does everything automatically!

```bash
cd /Users/eddieflottemesch/Downloads/golfbot
chmod +x serve-ui.sh
./serve-ui.sh
```

It will:
- Start a web server
- Show your IP address
- Give you the exact URL to open on your phone

## 📝 Notes:

- **For PWA features** (install as app), you need HTTPS or localhost
- **The config file** (`booking-config.json`) downloads to your phone's Downloads folder
- **To use the config:** Transfer `booking-config.json` back to your computer in the golfbot folder
- **Same WiFi required** for local server method (Option 2)

## 🎯 Recommended for You:

**For personal use:** Option 2 (Local Web Server) - fastest and easiest

**For sharing with friends:** Option 3 (Netlify Drop or Surge) - instant and free

