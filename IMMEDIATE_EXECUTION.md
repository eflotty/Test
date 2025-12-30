# How to Run Bot Immediately ⚡

## The Issue

The bot is currently scheduled to run at the "Booking Opens At" time you specified. If you set it to 8:21 PM on a future date, it won't run until then.

## Solution: Set "Booking Opens At" to Current Time

To make the bot run **immediately** (or very soon), set the "Booking Opens At" fields to **2-3 minutes from now**.

### Steps:

1. **Check current time** (look at your computer clock)

2. **In the UI form:**
   - **Booking Opens At (Hour):** Set to current hour (or hour + 1 if you want a small buffer)
   - **Booking Opens At (Minute):** Set to current minute + 2 or + 3
   
   Example:
   - If it's **3:45 PM** now, set:
     - Hour: **15** (3 PM in 24-hour format)
     - Minute: **47** or **48** (2-3 minutes from now)

3. **Submit the booking**

4. **The scheduler will pick it up within 60 seconds** and execute within the next 2-3 minutes

---

## Understanding the Timing

- **"Booking Opens At"** = When the bot should RUN (when tee times are released)
- **"Time Range (Start/End Time)"** = When you want to PLAY (your preferred tee time window)
- **"Date"** = What date you want to book for

### Example Scenario:

You want to:
- Book for **January 4, 2026**
- Play sometime between **8:00 AM - 6:00 PM**
- Run the bot **RIGHT NOW** to grab a slot immediately

**Settings:**
- Date: `01/04/2026`
- Time Range: `08:00 AM - 06:00 PM`
- Booking Opens At: `[Current Hour]` : `[Current Minute + 2]`

This will make the bot run in ~2 minutes to grab the best available slot in your time range.

---

## Quick Reference: Current Time

To set it to run in 2 minutes:

1. Look at current time (e.g., 3:45 PM)
2. Current time in 24-hour format: **15:45**
3. Set Hour: **15**, Minute: **47** (45 + 2 = 47)
4. If minute would be >= 60, add 1 to hour and subtract 60 from minute
   - Example: 15:58 → Set Hour: **16**, Minute: **00** (58 + 2 = 60 = 16:00)

---

## What Changed in the Code

I updated the API to allow immediate execution if the target time is in the past (within last 5 minutes). This means:

- If you set a time that's 1-2 minutes ago, it will execute immediately
- If you set a time more than 5 minutes in the past, it schedules for tomorrow (as before)

But **it's still best to set it 2-3 minutes in the future** to ensure the scheduler picks it up reliably.
