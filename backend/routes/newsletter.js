const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const resendClient = require('../services/resendClient');
const newsletterService = require('../services/newsletterService');
const { ensureNewsletterTables } = require('../utils/newsletterTables');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBHOOK_MAX_AGE_SECONDS = 5 * 60;

const getBaseUrl = () =>
  String(process.env.BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

const timingSafeCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const extractSignatureCandidates = (headerValue) => {
  if (!headerValue || typeof headerValue !== 'string') return [];

  const segments = headerValue
    .split(/[ ]+/)
    .flatMap((part) => part.split(','))
    .map((part) => part.trim())
    .filter(Boolean);

  const signatures = [];
  for (const segment of segments) {
    if (segment.startsWith('v1=')) {
      signatures.push(segment.slice(3));
      continue;
    }
    if (segment.startsWith('v1,') || segment.startsWith('v1:')) {
      signatures.push(segment.slice(3));
      continue;
    }
    if (segment.startsWith('v1')) {
      signatures.push(segment.slice(2));
      continue;
    }
    if (!segment.includes('=')) {
      signatures.push(segment);
    }
  }

  return signatures.filter(Boolean);
};

const verifyResendWebhookSignature = ({ rawBody, headers }) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return { ok: false, reason: 'RESEND_WEBHOOK_SECRET is not configured' };
  }

  const secretCandidates = [];
  const trimmedSecret = secret.trim();
  if (trimmedSecret) {
    secretCandidates.push(trimmedSecret);
  }

  const unprefixedSecret = trimmedSecret.startsWith('whsec_')
    ? trimmedSecret.slice(6)
    : trimmedSecret;
  if (unprefixedSecret && !secretCandidates.includes(unprefixedSecret)) {
    secretCandidates.push(unprefixedSecret);
  }

  if (unprefixedSecret) {
    try {
      const decodedSecret = Buffer.from(unprefixedSecret, 'base64');
      if (decodedSecret.length > 0) {
        secretCandidates.push(decodedSecret);
      }
    } catch (_err) {
      // Keep fallback secret candidates only.
    }
  }

  const signatureHeader = headers.signature || '';
  const timestampHeader = headers.timestamp || '';
  const eventIdHeader = headers.eventId || '';

  if (!signatureHeader || !timestampHeader) {
    return { ok: false, reason: 'Missing webhook signature headers' };
  }

  const timestampInt = parseInt(timestampHeader, 10);
  if (!isNaN(timestampInt)) {
    const normalizedTimestamp =
      timestampInt > 1_000_000_000_000 ? Math.floor(timestampInt / 1000) : timestampInt;
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - normalizedTimestamp) > WEBHOOK_MAX_AGE_SECONDS) {
      return { ok: false, reason: 'Webhook timestamp is outside allowed window' };
    }
  }

  const receivedSignatures = extractSignatureCandidates(signatureHeader);
  if (receivedSignatures.length === 0) {
    return { ok: false, reason: 'No signature candidates found' };
  }

  const payloadVariants = [];
  if (eventIdHeader) {
    payloadVariants.push(`${eventIdHeader}.${timestampHeader}.${rawBody}`);
  }
  payloadVariants.push(`${timestampHeader}.${rawBody}`);

  const expectedSignatures = [];
  for (const payload of payloadVariants) {
    for (const signingSecret of secretCandidates) {
      expectedSignatures.push(
        crypto.createHmac('sha256', signingSecret).update(payload).digest('hex')
      );
      expectedSignatures.push(
        crypto.createHmac('sha256', signingSecret).update(payload).digest('base64')
      );
    }
  }

  for (const received of receivedSignatures) {
    for (const expected of expectedSignatures) {
      if (timingSafeCompare(received, expected)) {
        return { ok: true };
      }
    }
  }

  return { ok: false, reason: 'Webhook signature verification failed' };
};

router.post('/subscribe', async (req, res) => {
  let insertedSubscriber = null;

  try {
    await ensureNewsletterTables();

    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    const verifyUrl = `${getBaseUrl()}/api/newsletter/verify/${verifyToken}`;

    await db.query(
      `INSERT INTO subscribers (email, verify_token, unsubscribe_token)
       VALUES (?, ?, ?)`,
      [email, verifyToken, unsubscribeToken]
    );
    insertedSubscriber = { email, verifyToken };

    await resendClient.sendEmail({
      to: [email],
      subject: 'Confirm your subscription',
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
          <p>Thanks for subscribing!</p>
          <p>Please confirm your email to receive the latest posts.</p>
          <p><a href="${verifyUrl}">Verify my subscription</a></p>
        </div>
      `,
    });

    return res.json({ message: 'Check your email to verify' });
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return res.json({ message: 'Already subscribed' });
    }

    if (insertedSubscriber) {
      try {
        await db.query(
          `DELETE FROM subscribers
           WHERE email = ? AND verify_token = ? AND verified = FALSE`,
          [insertedSubscriber.email, insertedSubscriber.verifyToken]
        );
      } catch (cleanupErr) {
        console.error('Failed to cleanup unverified subscriber after send error:', cleanupErr);
      }
    }

    console.error('Newsletter subscribe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    await ensureNewsletterTables();
    const { token } = req.params;

    const [result] = await db.query(
      `UPDATE subscribers
       SET
        verified = TRUE,
        verify_token = NULL,
        verified_at = COALESCE(verified_at, CURRENT_TIMESTAMP)
       WHERE verify_token = ?`,
      [token]
    );

    if (result.affectedRows === 0) {
      return res.status(400).send('Invalid or expired token');
    }

    return res.send('Email verified! 🎉');
  } catch (err) {
    console.error('Newsletter verify error:', err);
    return res.status(500).send('Verification failed');
  }
});

router.get('/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const [result] = await db.query(
      'DELETE FROM subscribers WHERE unsubscribe_token = ?',
      [token]
    );

    if (result.affectedRows === 0) {
      return res.status(400).send('Invalid unsubscribe link');
    }

    return res.send('You have been unsubscribed.');
  } catch (err) {
    console.error('Newsletter unsubscribe error:', err);
    return res.status(500).send('Unsubscribe failed');
  }
});

router.post('/send', async (_req, res) => {
  res.status(410).json({
    message: 'This endpoint has been retired. Use /api/admin/newsletter/campaigns instead.',
  });
});

router.post('/webhooks/resend', async (req, res) => {
  try {
    await ensureNewsletterTables();

    const rawBody =
      req.rawBody ||
      (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));

    const signatureCheck = verifyResendWebhookSignature({
      rawBody,
      headers: {
        signature: req.get('resend-signature') || req.get('svix-signature'),
        timestamp: req.get('resend-timestamp') || req.get('svix-timestamp'),
        eventId: req.get('resend-id') || req.get('svix-id'),
      },
    });

    if (!signatureCheck.ok) {
      return res.status(401).json({ message: signatureCheck.reason || 'Invalid signature' });
    }

    const payload =
      typeof req.body === 'object' && req.body !== null
        ? req.body
        : JSON.parse(rawBody || '{}');

    const result = await newsletterService.applyWebhookEvent({ payload, rawBody });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Resend webhook processing failed:', err);
    return res.status(500).json({ message: 'Failed to process webhook' });
  }
});

module.exports = router;
