const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,  // set to true if using port 465 for SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,  // Enable connection pooling
  socketTimeout: 30000,  // Increase timeout (default: 10000 ms)
  connectionTimeout: 30000,  // Set connection timeout to 30 seconds
});

// Function to read HTML template and replace placeholders
const readTemplate = async (templatePath, replacements) => {
  const template = await fs.promises.readFile(templatePath, 'utf8');
  return Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
  }, template);
};

// Function to send verification email
const sendVerificationEmail = async (userEmail, verificationCode) => {
  const templatePath = path.join(__dirname, '../templates/verificationEmail.html');
  const html = await readTemplate(templatePath, { verificationCode });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: 'Email Verification Code',
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: ', info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};

// Function to send password reset email
const sendResetPasswordEmail = async (userEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const templatePath = path.join(__dirname, '../templates/resetPasswordEmail.html');
  const html = await readTemplate(templatePath, { userEmail, resetLink });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: 'Password Reset Request',
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reset email sent: ', info.response);
  } catch (error) {
    console.error('Error sending reset email: ', error);
    throw new Error('Failed to send reset password email');
  }
};


// Function to send password reset email
const sendRegistrationPasswordResetEmail = async (userEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const templatePath = path.join(__dirname, '../templates/registrationPasswordEmail.html');
  const html = await readTemplate(templatePath, { userEmail, resetLink });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: 'Welcome to JUMBLY - Reset your password',
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Registration Reset email sent: ', info.response);
  } catch (error) {
    console.error('Error sending registration reset email: ', error);
    throw new Error('Failed to send registration reset password email');
  }
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail, sendRegistrationPasswordResetEmail };