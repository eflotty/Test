# Cloud-Hosted Architecture 🏗️

## Overview

This architecture enables users to schedule golf bookings entirely from the UI, without running any code on their machine. The bot runs in the cloud and executes at scheduled times automatically.

## Architecture Diagram

```
┌─────────────────┐
│   User's Phone  │
│   / Laptop      │
│                 │
│  booking-ui.html│
└────────┬────────┘
         │
         │ HTTP POST
         ▼
┌─────────────────┐
│   Backend API   │  ← Stores booking requests
│   (Node.js)     │  ← Handles scheduling
│                 │
│  /api/bookings  │
│  /api/schedule  │
└────────┬────────┘
         │
         │ Writes to
         ▼
┌─────────────────┐
│   Database      │  ← Stores all booking configs
│   (Supabase/    │  ← Tracks status
│    Firebase)    │
└────────┬────────┘
         │
         │ Polls every minute
         ▼
┌─────────────────┐
│  Scheduler      │  ← Runs 24/7 in cloud
│  Service        │  ← Checks for upcoming bookings
│  (Node.js)      │  ← Triggers bot execution
└────────┬────────┘
         │
         │ Executes
         ▼
┌─────────────────┐
│   Bot Service   │  ← Runs Playwright bot
│   (Node.js)     │  ← Executes booking
│                 │  ← Sends status updates
└─────────────────┘
```

## Components

### 1. Frontend UI (`booking-ui.html`)
- User fills out booking form
- Clicks "Schedule Booking"
- Saves booking request to backend API
- Shows list of scheduled bookings
- Can cancel/modify bookings

### 2. Backend API (`api-server.js`)
- REST API endpoints:
  - `POST /api/bookings` - Create new booking
  - `GET /api/bookings` - List user's bookings
  - `DELETE /api/bookings/:id` - Cancel booking
  - `PUT /api/bookings/:id` - Update booking
- Validates booking data
- Stores in database
- Returns booking ID and status

### 3. Database (Supabase/Firebase)
- Stores booking requests:
  ```json
  {
    "id": "uuid",
    "userId": "email or id",
    "username": "golf@email.com",
    "password": "encrypted",
    "course": 3,
    "date": "2024-01-15",
    "players": 4,
    "holes": 18,
    "timeStart": "07:00",
    "timeEnd": "18:00",
    "targetHour": 7,
    "targetMinute": 0,
    "status": "scheduled",
    "scheduledFor": "2024-01-15T07:00:00Z",
    "createdAt": "2024-01-14T20:00:00Z"
  }
  ```

### 4. Scheduler Service (`scheduler.js`)
- Runs continuously (24/7)
- Polls database every 60 seconds
- Finds bookings where:
  - `status = 'scheduled'`
  - `scheduledFor <= now + 2 minutes` (pre-position time)
- Triggers bot execution
- Updates booking status:
  - `scheduled` → `running` → `completed` / `failed`

### 5. Bot Service (`bot-runner.js`)
- Receives booking config from scheduler
- Runs the actual Playwright bot
- Executes booking
- Sends status updates back to database
- Handles errors gracefully

## Data Flow

### Scheduling a Booking

1. **User fills form** → Clicks "Schedule Booking"
2. **UI sends POST** → `/api/bookings` with config
3. **API validates** → Checks required fields
4. **API saves to DB** → Creates booking record with `status: 'scheduled'`
5. **API returns** → Booking ID and confirmation
6. **UI shows** → "Booking scheduled for [date] at [time]"

### Executing a Booking

1. **Scheduler polls DB** → Every 60 seconds
2. **Finds upcoming booking** → `scheduledFor` is within 2 minutes
3. **Scheduler triggers bot** → Calls bot service with booking config
4. **Bot executes** → Runs Playwright, logs in, books slot
5. **Bot updates status** → `running` → `completed` or `failed`
6. **User sees result** → In UI (can refresh to check status)

## Hosting Options

### Option 1: Railway (Recommended - Easiest)
- **Backend API**: Railway service
- **Scheduler**: Railway service (always-on)
- **Database**: Railway PostgreSQL (free tier)
- **Cost**: ~$5-10/month

### Option 2: Render
- **Backend API**: Render Web Service
- **Scheduler**: Render Background Worker (always-on)
- **Database**: Render PostgreSQL (free tier)
- **Cost**: ~$7/month

### Option 3: AWS (More Complex)
- **Backend API**: AWS Lambda + API Gateway
- **Scheduler**: EventBridge + Lambda (cron)
- **Database**: DynamoDB or RDS
- **Bot Execution**: ECS Fargate or Lambda
- **Cost**: Pay-per-use (~$5-20/month)

### Option 4: Your Own Server
- **Backend API**: Node.js on VPS
- **Scheduler**: PM2 process manager
- **Database**: PostgreSQL on VPS
- **Cost**: VPS ~$5-10/month (DigitalOcean, Linode)

## Security Considerations

1. **Password Storage**: Encrypt passwords before storing (use bcrypt or similar)
2. **API Authentication**: Add API keys or user auth (optional for single-user)
3. **HTTPS**: Always use HTTPS for API calls
4. **Rate Limiting**: Prevent abuse of API
5. **Input Validation**: Validate all user inputs

## Implementation Steps

1. ✅ Create database schema
2. ✅ Build backend API server
3. ✅ Create scheduler service
4. ✅ Update UI to use API
5. ✅ Deploy to cloud
6. ✅ Test end-to-end flow

## Benefits

- ✅ **Zero local setup** - User just uses UI
- ✅ **Works 24/7** - Scheduler runs in cloud
- ✅ **Device independent** - Works even if phone/computer is off
- ✅ **Multi-user ready** - Can add auth later
- ✅ **Scalable** - Can handle many bookings
- ✅ **Reliable** - Cloud infrastructure is stable

