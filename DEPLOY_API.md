# Deploy API Server 🚀

Quick guide to deploy the API server to the cloud.

## Option 1: Railway (Recommended - Easiest)

### Steps:

1. **Sign up at [railway.app](https://railway.app)**
   - Free tier available
   - GitHub integration

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Configure Service**
   - Railway auto-detects `api-server.js`
   - Set environment variables:
     - `ENCRYPTION_KEY` - Generate a random string (or leave blank for auto-generated)
     - `PORT` - Auto-set by Railway (don't change)

4. **Deploy**
   - Railway will automatically deploy
   - Get your URL: `https://your-project.railway.app`

5. **Update UI**
   - Open `booking-ui.html`
   - Set API URL to your Railway URL
   - Save and test!

### Railway CLI (Alternative):

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

---

## Option 2: Render

### Steps:

1. **Sign up at [render.com](https://render.com)**
   - Free tier available

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - **Name**: `golf-booking-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node api-server.js`
   - **Plan**: Free (or paid for always-on)

4. **Environment Variables**
   - Add variable:
     - Key: `ENCRYPTION_KEY`
     - Value: (generate random string, or leave blank)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Get your URL: `https://golf-booking-api.onrender.com`

6. **Update UI**
   - Set API URL in UI to your Render URL

---

## Option 3: Your Own Server (VPS)

### Steps:

1. **Setup Server**
   ```bash
   # SSH into your server
   ssh user@your-server.com
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy Code**
   ```bash
   # Clone repo
   git clone <your-repo-url>
   cd golfbot
   
   # Install dependencies
   npm install
   
   # Set environment variables
   export ENCRYPTION_KEY="your-random-key-here"
   export PORT=3000
   ```

3. **Start with PM2**
   ```bash
   # Start API server
   pm2 start api-server.js --name "golf-api"
   
   # Save PM2 configuration
   pm2 save
   
   # Setup PM2 to start on boot
   pm2 startup
   ```

4. **Setup Nginx (for HTTPS)**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Testing Deployment

Once deployed, test your API:

```bash
# Health check
curl https://your-api-url.com/api/health

# Should return:
# {"status":"ok","timestamp":"...","bookings":0}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `ENCRYPTION_KEY` | No | Encryption key for passwords (auto-generated if not set) |

---

## Troubleshooting

### API not responding
- Check if service is running
- Verify PORT is set correctly
- Check logs for errors

### CORS errors
- API already has CORS enabled
- Make sure API URL in UI matches deployed URL

### Bookings not persisting
- Currently using in-memory storage
- Bookings reset on server restart
- For production, add database (see DEPLOYMENT.md)

---

## Next Steps

After deploying API:
1. ✅ Get your API URL
2. ✅ Update UI with API URL
3. ✅ Test creating a booking
4. ⏳ Deploy scheduler service (next step)

