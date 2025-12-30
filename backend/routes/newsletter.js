const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Subscribe
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  const verifyToken = crypto.randomBytes(32).toString('hex');
  const unsubscribeToken = crypto.randomBytes(32).toString('hex');

  try {
    await db.query(
      `INSERT INTO subscribers (email, verify_token, unsubscribe_token)
       VALUES (?, ?, ?)`,
      [email, verifyToken, unsubscribeToken]
    );

    const verifyUrl = `${process.env.BASE_URL}/api/newsletter/verify/${verifyToken}`;

    await transporter.sendMail({
      from: `"Small Wins" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirm your subscription',
      html: `
        <p>Thanks for subscribing!</p>
        <p><a href="${verifyUrl}">Click here to verify your email</a></p>
      `
    });

    res.json({ message: 'Check your email to verify' });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ message: 'Already subscribed' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  const [result] = await db.query(
    `UPDATE subscribers
     SET verified = TRUE, verify_token = NULL
     WHERE verify_token = ?`,
    [token]
  );

  if (result.affectedRows === 0) {
    return res.status(400).send('Invalid or expired token');
  }

  res.send('Email verified! 🎉');
});

// Unsubscribe
router.get('/unsubscribe/:token', async (req, res) => {
  const { token } = req.params;

  const [result] = await db.query(
    'DELETE FROM subscribers WHERE unsubscribe_token = ?',
    [token]
  );

  if (result.affectedRows === 0) {
    return res.status(400).send('Invalid unsubscribe link');
  }

  res.send('You have been unsubscribed.');
});

// Send newsletter (admin only)
router.post('/send', async (req, res) => {
  const { subject, content } = req.body;

  const [rows] = await db.query(
    'SELECT email, unsubscribe_token FROM subscribers WHERE verified = TRUE'
  );

  for (const sub of rows) {
    const unsubscribeLink = `${process.env.BASE_URL}/api/newsletter/unsubscribe/${sub.unsubscribe_token}`;

    await transporter.sendMail({
      from: `"Small Wins" <${process.env.EMAIL_USER}>`,
      to: sub.email,
      subject,
      html: `
        <div>${content}</div>
        <hr />
        <p><a href="${unsubscribeLink}">Unsubscribe</a></p>
      `
    });
  }

  res.json({ message: 'Newsletter sent' });
});

module.exports = router;