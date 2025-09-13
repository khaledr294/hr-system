import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"شركة ساعد للإستقدام" <no-reply@saed.com>',
      to,
      subject,
      html,
    });
    console.log('Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function generateContractExpirationEmail(
  clientName: string,
  workerName: string,
  expiryDate: Date
) {
  const date = new Intl.DateTimeFormat('ar-SA').format(expiryDate);

  return `
    <div dir="rtl" style="font-family: Arial, sans-serif;">
      <h2>تنبيه انتهاء عقد</h2>
      <p>عزيزي ${clientName}،</p>
      <p>نود إخباركم أن عقد العامل/ة ${workerName} سينتهي بتاريخ ${date}.</p>
      <p>يرجى التواصل معنا لتجديد العقد أو إنهائه.</p>
      <br/>
      <p>مع تحيات،<br/>شركة ساعد للإستقدام</p>
    </div>
  `;
}