const nodemailer = require('nodemailer');
const { Resend } = require('resend');
require('dotenv').config();

// Use Resend for production (SMTP might be blocked), Gmail for local dev
const useResend = !!process.env.RESEND_API_KEY;

let resend;
if (useResend) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('📧 Using Resend for email delivery');
}

let transporter;
if (!useResend) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('📧 Using Gmail SMTP for email delivery');
}

const sendEmail = async (to, subject, html) => {
  try {
    if (useResend) {
      const { data, error } = await resend.emails.send({
        from: 'University Portal <support@znu-cs.online>',
        to: to,
        subject: subject,
        html: html,
      });
      if (error) {
        console.error('❌ Resend error:', error);
        return false;
      }
      console.log('✅ Email sent via Resend:', data?.id);
      return true;
    } else {
      const info = await transporter.sendMail({
        from: `"University Portal Support" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html,
      });
      console.log('✅ Email sent via Gmail:', info.messageId);
      return true;
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

const sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://www.znu-cs.online'}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
      <h2 style="color: #2c3e50; text-align: center;">Reset Your Password</h2>
      <p style="color: #34495e; font-size: 16px;">
        You requested a password reset for your University Portal account. Click the button below to set a new password:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="color: #7f8c8d; font-size: 14px; text-align: center;">
        If you did not request a password reset, please ignore this email or contact support if you have questions.
        <br><br>
        This link will expire in 15 minutes.
      </p>
    </div>
  `;

  return await sendEmail(to, 'Password Reset Request', html);
};

const sendEmailVerification = async (to, verifyToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'https://www.znu-cs.online'}/verify-email?token=${verifyToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
      <h2 style="color: #2c3e50; text-align: center;">Verify Your Email</h2>
      <p style="color: #34495e; font-size: 16px;">
        Someone requested to link this email to a University Portal account. If this was you, click the button below to verify:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
          Verify Email
        </a>
      </div>
      <p style="color: #7f8c8d; font-size: 14px; text-align: center;">
        If you did not request this, please ignore this email.
        <br><br>
        This link will expire in 15 minutes.
      </p>
    </div>
  `;

  return await sendEmail(to, 'Verify Your Email Address', html);
};

module.exports = {
  sendPasswordResetEmail,
  sendEmailVerification,
};
