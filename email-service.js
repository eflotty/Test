/**
 * Email Service - Sends email notifications for booking completion
 */

const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * Uses environment variables for SMTP configuration
 */
function createTransporter() {
  // Support multiple email providers via environment variables
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  
  // If no SMTP credentials provided, return null (email sending will be skipped)
  if (!smtpUser || !smtpPassword) {
    console.log('⚠️  Email service: SMTP credentials not configured (SMTP_USER, SMTP_PASSWORD)');
    return null;
  }
  
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
}

/**
 * Send booking completion email
 */
async function sendBookingCompletionEmail(recipientEmail, bookingDetails) {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️  Cannot send email: SMTP not configured');
      return false;
    }
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: 'Thank you for booking with Austin Golf Bot! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5016;">Thank you for booking with Austin Golf Bot!</h2>
          <p>Your booking has been completed successfully.</p>
          
          ${bookingDetails ? `
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details:</h3>
            ${bookingDetails.course ? `<p><strong>Course:</strong> ${bookingDetails.course}</p>` : ''}
            ${bookingDetails.date ? `<p><strong>Date:</strong> ${bookingDetails.date}</p>` : ''}
            ${bookingDetails.players ? `<p><strong>Players:</strong> ${bookingDetails.players}</p>` : ''}
            ${bookingDetails.holes ? `<p><strong>Holes:</strong> ${bookingDetails.holes}</p>` : ''}
          </div>
          ` : ''}
          
          <p>We hope you enjoy your round of golf!</p>
          <p style="font-size: 18px; color: #2d5016; font-weight: bold; margin-top: 20px;">
            +300 Aura ✨
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message from Austin Golf Bot.
          </p>
        </div>
      `,
      text: `
Thank you for booking with Austin Golf Bot!

Your booking has been completed successfully.

${bookingDetails ? `
Booking Details:
${bookingDetails.course ? `Course: ${bookingDetails.course}` : ''}
${bookingDetails.date ? `Date: ${bookingDetails.date}` : ''}
${bookingDetails.players ? `Players: ${bookingDetails.players}` : ''}
${bookingDetails.holes ? `Holes: ${bookingDetails.holes}` : ''}
` : ''}

We hope you enjoy your round of golf!

+300 Aura ✨

This is an automated message from Austin Golf Bot.
      `.trim(),
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${recipientEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    // Don't throw - email failure shouldn't break the booking flow
    return false;
  }
}

module.exports = {
  sendBookingCompletionEmail,
};
