// backend/utils/email.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for port 465, false for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html // Optional HTML version
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${options.email}`);
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    // Re-throw so controller can handle it
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;