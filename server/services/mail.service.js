const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = String(process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  if (!host || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  const smtp = getTransporter();
  const user = process.env.EMAIL_USER;
  const fromName = process.env.EMAIL_FROM_NAME || 'ResQFood';
  const from = process.env.EMAIL_FROM || `${fromName} <${user}>`;

  if (!smtp || !user) {
    console.warn('Mail service skipped: SMTP credentials missing');
    return { sent: false, skipped: true };
  }

  const info = await smtp.sendMail({
    from,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    html,
    text,
  });

  return { id: info.messageId, accepted: info.accepted, rejected: info.rejected };
};

module.exports = { sendMail };
