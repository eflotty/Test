# Deployment Guide 🚀

## Overview

This guide explains how to deploy the fully hosted golf booking system so users can schedule bookings from the UI without running any code locally.

## Architecture

- **Frontend UI**: `booking-ui.html` (hosted on Netlify/Vercel)
- **Backend API**: `api-server.js` (hosted on Railway/Render)
- **Scheduler**: `scheduler.js` (hosted on Railway/Render - always-on)
- **Bot Runner**: `bot-runner.js` + `austin-golf-bot.js` (executed by scheduler)

## Deployment Steps

### Option 1: Railway (Recommended - Easiest)

#### 1. Deploy API Server

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repo
4. Add new service → Select `api-server.js`
5. Set environment variables:
   - `PORT=3000` (auto-set by Railway)
   - `ENCRYPTION_KEY` (generate random string)
6. Deploy

#### 2. Deploy Scheduler

1. In same Railway project, add another service
2. Select `scheduler.js`
3. Set environment variables:
   - `API_URL=https://your-api-service.railway.app`
4. Make sure it's set to "Always On" (not sleep)
5. Deploy

#### 3. Update UI

Update `booking-ui.html` to point to your API URL:
```javascript
const API_URL = 'https://your-api-service.railway.app';
```

### Option 2: Render

#### 1. Deploy API Server

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect repo, select `api-server.js`
4. Build command: `npm install`
5. Start command: `node api-server.js`
6. Set environment variables (same as Railway)
7. Deploy

#### 2. Deploy Scheduler

1. New → Background Worker
2. Select `scheduler.js`
3. Build: `npm install`
4. Start: `node scheduler.js`
5. Set `API_URL` env var
6. Deploy (Background Workers are always-on)

### Option 3: Your Own Server (VPS)

#### 1. Setup Server

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone repo
git clone <your-repo>
cd golfbot
npm install
```

#### 2. Start API Server

```bash
cd /path/to/golfbot
pm2 start api-server.js --name "golf-api"
pm2 save
```

#### 3. Start Scheduler

```bash
pm2 start scheduler.js --name "golf-scheduler" --env API_URL=http://localhost:3000
pm2 save
```

#### 4. Setup Nginx (optional - for HTTPS)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
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

## Environment Variables

### API Server
- `PORT` - Server port (default: 3000)
- `ENCRYPTION_KEY` - Random string for password encryption

### Scheduler
- `API_URL` - URL of API server (e.g., `https://api.example.com`)

### Bot Runner (set by scheduler)
- `BOOKING_ID` - Booking ID
- `USERNAME` - Golf account username
- `PASSWORD` - Golf account password
- `COURSE` - Course number
- `DATE` - Booking date
- `PLAYERS` - Number of players
- `HOLES` - Number of holes
- `TIME_START` - Start time range
- `TIME_END` - End time range
- `TARGET_HOUR` - Hour when booking opens
- `TARGET_MINUTE` - Minute when booking opens
- `API_URL` - API server URL

## Database Setup

Currently uses in-memory storage. For production, use:

### Option 1: Supabase (Free tier)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Create `bookings` table:
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  course INTEGER,
  date DATE,
  players INTEGER,
  holes INTEGER,
  time_start TEXT,
  time_end TEXT,
  target_hour INTEGER,
  target_minute INTEGER,
  status TEXT DEFAULT 'scheduled',
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
4. Update `api-server.js` to use Supabase client

### Option 2: PostgreSQL (Railway/Render)
1. Add PostgreSQL service
2. Run migrations
3. Update `api-server.js` to use `pg` library

## Testing

1. **Test API**:
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@email.com",
    "password": "test123",
    "targetHour": 7,
    "targetMinute": 0
  }'
```

2. **Test Scheduler**:
   - Create a booking with time 2 minutes in future
   - Watch scheduler logs
   - Should trigger bot execution

3. **Test UI**:
   - Open `booking-ui.html`
   - Fill form
   - Click "Schedule Booking"
   - Should see confirmation

## Monitoring

- **API Health**: `GET /api/health`
- **View Bookings**: `GET /api/bookings`
- **Check Scheduler**: Look at scheduler logs

## Troubleshooting

### Scheduler not running
- Check if service is "Always On"
- Check scheduler logs for errors
- Verify `API_URL` is correct

### Bot not executing
- Check scheduler logs
- Verify booking status in database
- Check bot-runner logs

### API not responding
- Check API server is running
- Verify port is correct
- Check CORS settings

## Cost Estimates

- **Railway**: ~$5-10/month (API + Scheduler)
- **Render**: ~$7/month (API + Background Worker)
- **VPS**: ~$5-10/month (DigitalOcean, Linode)
- **Database**: Free tier available (Supabase, Railway)

## Next Steps

1. Deploy API server
2. Deploy scheduler
3. Update UI with API URL
4. Test end-to-end
5. Add database (optional but recommended)
6. Add authentication (optional)

