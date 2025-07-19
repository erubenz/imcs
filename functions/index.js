import functions from 'firebase-functions';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

admin.initializeApp();
const db = admin.firestore();

async function createTransporter() {
  const snap = await db.doc('config/mailing').get();
  const cfg = snap.exists ? snap.data() : {};
  return nodemailer.createTransport({
    host: cfg.smtpHost || process.env.SMTP_HOST,
    port: parseInt(cfg.smtpPort || process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: cfg.smtpUser || process.env.SMTP_USER,
      pass: cfg.smtpPass || process.env.SMTP_PASS,
    },
  });
}

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
    const transporter = await createTransporter();
    const snap = await db.doc('config/mailing').get();
    const cfg = snap.exists ? snap.data() : {};
    await transporter.sendMail({
      from: cfg.smtpFrom || process.env.SMTP_FROM || cfg.smtpUser || process.env.SMTP_USER,
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
