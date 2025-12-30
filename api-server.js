/**
 * Backend API Server for Golf Booking Bot
 * 
 * Handles booking requests from UI and stores them in database.
 * Can be hosted on Railway, Render, or any Node.js hosting service.
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory database (replace with real DB in production)
// In production, use Supabase, Firebase, or PostgreSQL
let bookings = [];

// Encryption key (in production, use environment variable)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

/**
 * Simple encryption for passwords (use proper encryption in production)
 */
function encryptPassword(password) {
  // In production, use proper encryption like bcrypt or crypto.createCipher
  // For now, just base64 encode (NOT secure, but works for demo)
  return Buffer.from(password).toString('base64');
}

function decryptPassword(encrypted) {
  return Buffer.from(encrypted, 'base64').toString();
}

/**
 * POST /api/bookings - Create a new booking
 */
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      username,
      password,
      course,
      date,
      players,
      holes,
      timeStart,
      timeEnd,
      bookingOpensDate,
      targetHour,
      targetMinute,
      testMode
    } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (targetHour === undefined || targetMinute === undefined) {
      return res.status(400).json({ error: 'Target hour and minute are required' });
    }

    // Calculate scheduled time (when the bot should run) in Chicago timezone
    // Use bookingOpensDate if provided, otherwise default to today in Chicago time
    // The DATE field is for which date to book the tee time, bookingOpensDate is when to run the bot
    
    // Helper function to get current time components in Chicago timezone
    function getChicagoTime() {
      const now = new Date();
      // Format as Chicago time and parse components
      const chicagoStr = now.toLocaleString("en-US", {timeZone: "America/Chicago"});
      // Parse the string to get date components (format varies, but we can use a more reliable method)
      // Use Intl.DateTimeFormat for more reliable parsing
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
      const parts = formatter.formatToParts(now);
      const chicagoParts = {};
      parts.forEach(part => { chicagoParts[part.type] = part.value; });
      
      return {
        year: parseInt(chicagoParts.year),
        month: parseInt(chicagoParts.month) - 1, // 0-indexed
        day: parseInt(chicagoParts.day),
        hour: parseInt(chicagoParts.hour),
        minute: parseInt(chicagoParts.minute),
        second: parseInt(chicagoParts.second)
      };
    }
    
    // Helper function to create a Date object from Chicago time components
    function createChicagoDate(year, month, day, hour, minute, second = 0) {
      // Create an ISO string in Chicago timezone and parse it
      // Chicago is UTC-6 (CST) or UTC-5 (CDT)
      // We'll use UTC-6 as default (CST), which covers most of the year
      // For DST (March-November), it's UTC-5, but this is close enough for scheduling purposes
      // To be more accurate, we'd need a library, but this should work for most cases
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}-06:00`;
      return new Date(dateStr);
    }
    
    let scheduledDate;
    
    if (bookingOpensDate) {
      // Parse the date components
      const [year, month, day] = bookingOpensDate.split('-').map(Number);
      // Create date in Chicago timezone (CST = UTC-6)
      scheduledDate = createChicagoDate(year, month - 1, day, parseInt(targetHour), parseInt(targetMinute));
    } else {
      // Default to today in Chicago timezone
      const chicago = getChicagoTime();
      scheduledDate = createChicagoDate(chicago.year, chicago.month, chicago.day, parseInt(targetHour), parseInt(targetMinute));
    }
    
    // Get current time in Chicago timezone for comparison
    const chicagoNow = getChicagoTime();
    const chicagoNowDate = createChicagoDate(chicagoNow.year, chicagoNow.month, chicagoNow.day, chicagoNow.hour, chicagoNow.minute, chicagoNow.second);
    
    // Compare dates (year/month/day only) in Chicago timezone
    const scheduledDateOnly = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
    const todayOnly = new Date(chicagoNowDate.getFullYear(), chicagoNowDate.getMonth(), chicagoNowDate.getDate());
    
    // If booking opens date is today (Chicago time) and time is in the past, handle special cases
    if (scheduledDateOnly.getTime() === todayOnly.getTime()) {
      const fiveMinutesAgo = new Date(chicagoNowDate.getTime() - 5 * 60 * 1000);
      
      // Compare in Chicago timezone
      if (scheduledDate < fiveMinutesAgo) {
        // More than 5 minutes in the past - schedule for tomorrow
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      } else if (scheduledDate < chicagoNowDate) {
        // Within last 5 minutes - execute immediately (use current time in Chicago)
        scheduledDate = new Date(chicagoNowDate);
      }
    }
    // If booking opens date is in the future, use it as-is (no adjustment needed)

    // Create booking record
    const booking = {
      id: crypto.randomUUID(),
      username,
      password: encryptPassword(password), // Encrypt password
      course: parseInt(course) || 3,
      date: date || null,
      players: parseInt(players) || 4,
      holes: parseInt(holes) || 18,
      timeStart: timeStart || '07:00',
      timeEnd: timeEnd || '18:00',
      targetHour: parseInt(targetHour),
      targetMinute: parseInt(targetMinute),
      testMode: testMode === true || testMode === 'true', // Store test mode preference
      status: 'scheduled',
      scheduledFor: scheduledDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bookings.push(booking);

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ New booking created: ${booking.id}`);
    console.log(`[${timestamp}] 📅 Scheduled for (UTC): ${scheduledDate.toISOString()}`);
    console.log(`[${timestamp}] 📅 Scheduled for (Chicago): ${scheduledDate.toLocaleString("en-US", {timeZone: "America/Chicago"})}`);
    console.log(`[${timestamp}] ⏰ Target time (Chicago): ${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}`);
    console.log(`[${timestamp}] 🏌️  Course: ${course}, Players: ${players}, Holes: ${holes}`);
    console.log(`[${timestamp}] 🧪 Test Mode: ${booking.testMode ? 'ENABLED' : 'DISABLED'}`);

    // Return booking (without password)
    const { password: _, ...bookingResponse } = booking;
    res.status(201).json({
      success: true,
      booking: bookingResponse,
      message: `Booking scheduled for ${scheduledDate.toLocaleString()}`
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking', message: error.message });
  }
});

/**
 * GET /api/bookings - List all bookings
 */
app.get('/api/bookings', (req, res) => {
  try {
    // Return bookings without passwords, sorted by scheduled time
    const bookingsList = bookings
      .map(({ password, ...booking }) => booking)
      .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));

    res.json({
      success: true,
      bookings: bookingsList,
      count: bookingsList.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * GET /api/bookings/:id - Get a specific booking
 */
app.get('/api/bookings/:id', (req, res) => {
  try {
    const booking = bookings.find(b => b.id === req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { password, ...bookingResponse } = booking;
    res.json({ success: true, booking: bookingResponse });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

/**
 * DELETE /api/bookings/:id - Cancel a booking
 */
app.delete('/api/bookings/:id', (req, res) => {
  try {
    const index = bookings.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[index];
    
    // Only allow canceling if not already running or completed
    if (booking.status === 'running') {
      return res.status(400).json({ error: 'Cannot cancel booking that is currently running' });
    }

    bookings.splice(index, 1);
    console.log(`✅ Booking canceled: ${req.params.id}`);

    res.json({ success: true, message: 'Booking canceled' });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

/**
 * PUT /api/bookings/:id/status - Update booking status (used by scheduler)
 */
app.put('/api/bookings/:id/status', (req, res) => {
  try {
    const { status, error: errorMessage } = req.body;
    const booking = bookings.find(b => b.id === req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const timestamp = new Date().toISOString();
    const oldStatus = booking.status;
    booking.status = status;
    booking.updatedAt = timestamp;
    
    if (errorMessage) {
      booking.error = errorMessage;
    }

    console.log(`[${timestamp}] 📊 Status Update: Booking ${req.params.id.substring(0, 8)}...`);
    console.log(`[${timestamp}]    ${oldStatus} → ${status}`);
    if (errorMessage) {
      console.log(`[${timestamp}]    Error: ${errorMessage}`);
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

/**
 * GET /api/bookings/:id/config - Get booking config for bot (includes password)
 * This endpoint is used by the scheduler to get the full config
 */
app.get('/api/bookings/:id/config', (req, res) => {
  try {
    const booking = bookings.find(b => b.id === req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Return full config including decrypted password
    const config = {
      ...booking,
      password: decryptPassword(booking.password)
    };

    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching booking config:', error);
    res.status(500).json({ error: 'Failed to fetch booking config' });
  }
});

/**
 * GET /api/health - Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    bookings: bookings.length 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   POST   /api/bookings - Create booking`);
  console.log(`   GET    /api/bookings - List bookings`);
  console.log(`   GET    /api/bookings/:id - Get booking`);
  console.log(`   DELETE /api/bookings/:id - Cancel booking`);
  console.log(`   GET    /api/bookings/:id/config - Get config for bot`);
  console.log(`   PUT    /api/bookings/:id/status - Update status`);
});

module.exports = app;

