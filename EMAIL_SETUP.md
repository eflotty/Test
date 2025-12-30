# Email Setup Guide 📧

The bot automatically sends email notifications when bookings are completed. This guide explains how to configure email sending.

## Quick Setup

### Using Gmail (Recommended)

1. **Enable App Password:**
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

2. **Set Environment Variables in Render:**
   
   For the **Scheduler** service, add these environment variables:
   
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   ```

### Using Other Email Providers

#### Outlook/Hotmail
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### Yahoo
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

#### Custom SMTP Server
```
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
```

For SSL (port 465), use:
```
SMTP_PORT=465
SMTP_SECURE=true
```

## Environment Variables

Add these to your **Scheduler** service in Render:

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` (TLS) or `465` (SSL) |
| `SMTP_SECURE` | Use SSL/TLS | `false` for port 587, `true` for port 465 |
| `SMTP_USER` | Your email address | `your-email@gmail.com` |
| `SMTP_PASSWORD` | Email password or app password | `your-password` |

## How It Works

1. When a booking completes successfully, the scheduler calls `sendBookingCompletionEmail()`
2. The email is sent to the email address used for booking (the `username` field)
3. The email includes:
   - Thank you message
   - Booking details (course, date, players, holes)
   - Fun "+300 Aura" message ✨

## Email Content

The email sent includes:
- Subject: "Thank you for booking with Austin Golf Bot! 🎉"
- HTML formatted message with booking details
- Plain text fallback version

## Troubleshooting

### Email not sending?

1. **Check logs in Render:**
   - Look for "⚠️ Email service: SMTP credentials not configured" if credentials are missing
   - Look for error messages if credentials are wrong

2. **Verify environment variables:**
   - Make sure all SMTP variables are set in Render
   - Check that SMTP_USER and SMTP_PASSWORD are correct

3. **Gmail-specific issues:**
   - Must use App Password, not your regular password
   - 2-Step Verification must be enabled
   - Make sure you're using the 16-character app password, not your account password

4. **Test connection:**
   - Try sending a test email manually using the same credentials
   - Check if your email provider blocks SMTP connections

### Email sending fails but booking succeeds

- The email service is designed to not break the booking flow
- If email sending fails, it logs an error but doesn't affect the booking
- Check Render logs for email error messages

## Security Notes

- Never commit email passwords to git
- Use environment variables for all SMTP credentials
- Use App Passwords instead of main account passwords when possible
- The SMTP password is only stored in Render environment variables

## Optional: Disable Email

If you don't want to send emails, simply don't set the SMTP environment variables. The bot will continue to work normally, just without email notifications.
