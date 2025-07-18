import functions from 'firebase-functions';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

admin.initializeApp();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendInviteEmail = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const { to, link, subject } = req.body || {};
  if (!to || !link) {
    res.status(400).send('Missing params');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: subject || 'Invite',
      text: `Please complete your registration: ${link}`,
    });
    res.status(200).send('sent');
  } catch (err) {
    console.error(err);
    res.status(500).send('fail');
  }
});
