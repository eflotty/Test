# Quick Deploy Guide 🚀

## Fastest Way: Railway (5 minutes)

### Step 1: Push to GitHub
```bash
cd /Users/eddieflottemesch/Downloads/golfbot
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect `api-server.js`
5. Click **"Deploy"**
6. Wait ~2 minutes for deployment
7. Click on your service → **"Settings"** → Copy the **"Public Domain"** URL

### Step 3: Update UI

1. Open `booking-ui.html`
2. Click **"⚙️ API Settings"**
3. Paste your Railway URL (e.g., `https://your-project.railway.app`)
4. Click **"Save API URL"**
5. Done! ✅

---

## Alternative: Render (Free Tier)

1. Go to [render.com](https://render.com) and sign up
2. **New +** → **Web Service**
3. Connect GitHub repo
4. Settings:
   - **Name**: `golf-api`
   - **Build Command**: `npm install`
   - **Start Command**: `node api-server.js`
5. Click **"Create Web Service"**
6. Wait for deployment
7. Copy URL and update UI

---

## Test Your Deployment

Once deployed, test it:

```bash
# Replace with your URL
curl https://your-api.railway.app/api/health
```

Should return:
```json
{"status":"ok","timestamp":"...","bookings":0}
```

---

## Your API URL

After deployment, your API URL will be something like:
- Railway: `https://your-project.railway.app`
- Render: `https://golf-api.onrender.com`

**Copy this URL and paste it into the UI's API Settings!**

