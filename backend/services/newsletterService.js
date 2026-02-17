const db = require('../db');
const resendClient = require('./resendClient');
const { ensureNewsletterTables } = require('../utils/newsletterTables');

const inFlightCampaigns = new Set();

const DELIVERY_STATUS_PRECEDENCE = {
  PENDING: 10,
  SENT: 20,
  DELIVERED: 30,
  OPENED: 40,
  CLICKED: 50,
  FAILED: 60,
  BOUNCED: 70,
  COMPLAINED: 80,
};

const DELIVERY_TERMINAL_STATUSES = new Set([
  'FAILED',
  'BOUNCED',
  'COMPLAINED',
]);

const DELIVERY_TIMESTAMP_FIELD = {
  SENT: 'sent_at',
  DELIVERED: 'delivered_at',
  OPENED: 'opened_at',
  CLICKED: 'clicked_at',
  FAILED: 'failed_at',
  BOUNCED: 'bounced_at',
  COMPLAINED: 'complained_at',
};

const normalizeWhitespace = (value) =>
  value.replace(/\s+/g, ' ').trim();

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripHtml = (value) =>
  normalizeWhitespace(String(value || '').replace(/<[^>]*>/g, ''));

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const getBaseUrl = () => trimTrailingSlash(process.env.BASE_URL || 'http://localhost:5000');
const getSiteUrl = () => trimTrailingSlash(process.env.SITE_URL || process.env.BASE_URL || 'http://localhost:5173');

const buildUnsubscribeFooter = (unsubscribeLink) => `
  <hr style="margin-top:24px;margin-bottom:12px;border:none;border-top:1px solid #e5e7eb;" />
  <p style="margin:0;font-size:13px;color:#6b7280;">
    You are receiving this email because you subscribed to updates.
    <a href="${unsubscribeLink}" style="color:#2563eb;">Unsubscribe</a>.
  </p>
`;

const buildCampaignHtml = (content, unsubscribeLink) => `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
    ${content}
    ${buildUnsubscribeFooter(unsubscribeLink)}
  </div>
`;

const buildAutoArticleHtml = (article) => {
  const articleId = article?.id;
  const safeTitle = escapeHtml(article?.title || 'New post');
  const excerpt = stripHtml(article?.content || '').slice(0, 280);
  const readMoreUrl = `${getSiteUrl()}/story/${articleId}`;

  return `
    <h2 style="margin:0 0 12px 0;">${safeTitle}</h2>
    <p style="margin:0 0 18px 0;color:#374151;">
      ${escapeHtml(excerpt)}${excerpt.length >= 280 ? '...' : ''}
    </p>
    <p style="margin:0;">
      <a
        href="${readMoreUrl}"
        style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;"
      >
        Read full post
      </a>
    </p>
  `;
};

const normalizeCampaignSubject = (subject) => {
  if (!subject || typeof subject !== 'string') return '';
  return subject.trim().slice(0, 255);
};

const normalizeCampaignHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.trim();
};

const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const shouldTransitionStatus = (currentStatus, nextStatus) => {
  if (!nextStatus) return false;

  if (!currentStatus) return true;
  if (currentStatus === nextStatus) return false;
  if (DELIVERY_TERMINAL_STATUSES.has(currentStatus)) return false;

  const currentPriority = DELIVERY_STATUS_PRECEDENCE[currentStatus] || 0;
  const nextPriority = DELIVERY_STATUS_PRECEDENCE[nextStatus] || 0;
  return nextPriority >= currentPriority;
};

const parseEventTime = (value) => {
  if (!value) return new Date();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date();
  return date;
};

const getCampaignStatusFromAggregates = ({
  totalRecipients,
  pendingCount,
  failedCount,
}) => {
  if (totalRecipients === 0) return 'FAILED';
  if (pendingCount > 0) return 'SENDING';
  if (failedCount === totalRecipients) return 'FAILED';
  if (failedCount > 0) return 'PARTIAL';
  return 'COMPLETED';
};

const createCampaignRecord = async ({
  triggerType,
  subject,
  htmlContent,
  articleId = null,
  createdByAdminId = null,
}) => {
  await ensureNewsletterTables();

  const normalizedSubject = normalizeCampaignSubject(subject);
  const normalizedHtml = normalizeCampaignHtml(htmlContent);

  if (!normalizedSubject) {
    throw new Error('Campaign subject is required');
  }
  if (!normalizedHtml) {
    throw new Error('Campaign html content is required');
  }

  const [result] = await db.query(
    `INSERT INTO newsletter_campaigns
      (trigger_type, status, subject, html_content, article_id, created_by_admin_id)
     VALUES (?, 'QUEUED', ?, ?, ?, ?)`,
    [
      triggerType,
      normalizedSubject,
      normalizedHtml,
      articleId,
      createdByAdminId,
    ]
  );

  return result.insertId;
};

const ensureCampaignDeliveries = async (campaignId) => {
  await ensureNewsletterTables();

  const [subscribers] = await db.query(
    `SELECT id, email, unsubscribe_token
     FROM subscribers
     WHERE verified = TRUE`
  );

  if (subscribers.length === 0) {
    return 0;
  }

  const placeholders = subscribers.map(() => '(?, ?, ?, ?)').join(', ');
  const values = [];

  for (const subscriber of subscribers) {
    values.push(
      campaignId,
      subscriber.id,
      subscriber.email,
      subscriber.unsubscribe_token
    );
  }

  await db.query(
    `INSERT INTO newsletter_deliveries
      (campaign_id, subscriber_id, email, unsubscribe_token)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
      subscriber_id = VALUES(subscriber_id),
      unsubscribe_token = VALUES(unsubscribe_token)`,
    values
  );

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total
     FROM newsletter_deliveries
     WHERE campaign_id = ?`,
    [campaignId]
  );

  return total;
};

const recomputeCampaignAggregates = async (campaignId, eventTime = null) => {
  await ensureNewsletterTables();

  const [[aggregate]] = await db.query(
    `SELECT
      COUNT(*) AS total_recipients,
      COALESCE(SUM(status IN ('SENT', 'DELIVERED', 'OPENED', 'CLICKED')), 0) AS sent_count,
      COALESCE(SUM(status IN ('DELIVERED', 'OPENED', 'CLICKED')), 0) AS delivered_count,
      COALESCE(SUM(status IN ('OPENED', 'CLICKED')), 0) AS opened_count,
      COALESCE(SUM(status = 'CLICKED'), 0) AS clicked_count,
      COALESCE(SUM(status IN ('FAILED', 'BOUNCED', 'COMPLAINED')), 0) AS failed_count,
      COALESCE(SUM(status = 'BOUNCED'), 0) AS bounced_count,
      COALESCE(SUM(status = 'COMPLAINED'), 0) AS complained_count,
      COALESCE(SUM(status = 'PENDING'), 0) AS pending_count
     FROM newsletter_deliveries
     WHERE campaign_id = ?`,
    [campaignId]
  );

  const totalRecipients = Number(aggregate?.total_recipients || 0);
  const sentCount = Number(aggregate?.sent_count || 0);
  const deliveredCount = Number(aggregate?.delivered_count || 0);
  const openedCount = Number(aggregate?.opened_count || 0);
  const clickedCount = Number(aggregate?.clicked_count || 0);
  const failedCount = Number(aggregate?.failed_count || 0);
  const bouncedCount = Number(aggregate?.bounced_count || 0);
  const complainedCount = Number(aggregate?.complained_count || 0);
  const pendingCount = Number(aggregate?.pending_count || 0);

  const nextStatus = getCampaignStatusFromAggregates({
    totalRecipients,
    pendingCount,
    failedCount,
  });

  const shouldComplete = nextStatus === 'COMPLETED' || nextStatus === 'PARTIAL' || nextStatus === 'FAILED';

  await db.query(
    `UPDATE newsletter_campaigns
     SET
      status = ?,
      total_recipients = ?,
      sent_count = ?,
      delivered_count = ?,
      opened_count = ?,
      clicked_count = ?,
      failed_count = ?,
      bounced_count = ?,
      complained_count = ?,
      completed_at = CASE
        WHEN ? THEN COALESCE(completed_at, CURRENT_TIMESTAMP)
        ELSE completed_at
      END,
      last_event_at = CASE
        WHEN ? IS NOT NULL THEN ?
        ELSE last_event_at
      END
     WHERE id = ?`,
    [
      nextStatus,
      totalRecipients,
      sentCount,
      deliveredCount,
      openedCount,
      clickedCount,
      failedCount,
      bouncedCount,
      complainedCount,
      shouldComplete ? 1 : 0,
      eventTime ? 1 : 0,
      eventTime,
      campaignId,
    ]
  );

  return {
    status: nextStatus,
    totalRecipients,
    sentCount,
    deliveredCount,
    openedCount,
    clickedCount,
    failedCount,
  };
};

const processCampaign = async (campaignId) => {
  if (inFlightCampaigns.has(campaignId)) return;
  inFlightCampaigns.add(campaignId);

  try {
    await ensureNewsletterTables();

    const [[campaign]] = await db.query(
      `SELECT
        id,
        status,
        subject,
        html_content
      FROM newsletter_campaigns
      WHERE id = ?`,
      [campaignId]
    );

    if (!campaign) return;
    if (['COMPLETED', 'PARTIAL', 'FAILED'].includes(campaign.status)) return;

    await db.query(
      `UPDATE newsletter_campaigns
       SET status = 'SENDING', started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
       WHERE id = ?`,
      [campaignId]
    );

    const totalRecipients = await ensureCampaignDeliveries(campaignId);

    if (totalRecipients === 0) {
      await db.query(
        `UPDATE newsletter_campaigns
         SET
          status = 'FAILED',
          total_recipients = 0,
          sent_count = 0,
          delivered_count = 0,
          opened_count = 0,
          clicked_count = 0,
          failed_count = 0,
          bounced_count = 0,
          complained_count = 0,
          completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)
         WHERE id = ?`,
        [campaignId]
      );
      return;
    }

    const [deliveries] = await db.query(
      `SELECT id, email, unsubscribe_token
       FROM newsletter_deliveries
       WHERE campaign_id = ? AND status = 'PENDING'
       ORDER BY id ASC`,
      [campaignId]
    );

    for (const delivery of deliveries) {
      const unsubscribeLink = `${getBaseUrl()}/api/newsletter/unsubscribe/${delivery.unsubscribe_token}`;
      const emailHtml = buildCampaignHtml(campaign.html_content, unsubscribeLink);

      try {
        const response = await resendClient.sendEmail({
          to: delivery.email,
          subject: campaign.subject,
          html: emailHtml,
          headers: {
            'X-Campaign-Id': String(campaignId),
            'X-Delivery-Id': String(delivery.id),
          },
        });

        await db.query(
          `UPDATE newsletter_deliveries
           SET
            status = 'SENT',
            provider_message_id = ?,
            provider_response_code = 'accepted',
            provider_response_message = NULL,
            sent_at = COALESCE(sent_at, CURRENT_TIMESTAMP)
           WHERE id = ?`,
          [response.id, delivery.id]
        );
      } catch (err) {
        const errorCode = err?.code || String(err?.status || 'send_error');
        const errorMessage = err?.message || 'Failed to send email';

        await db.query(
          `UPDATE newsletter_deliveries
           SET
            status = 'FAILED',
            provider_response_code = ?,
            provider_response_message = ?,
            failed_at = COALESCE(failed_at, CURRENT_TIMESTAMP)
           WHERE id = ?`,
          [errorCode, errorMessage, delivery.id]
        );
      }
    }

    await recomputeCampaignAggregates(campaignId, new Date());
  } catch (err) {
    console.error('Newsletter campaign processing failed:', err);
    await db.query(
      `UPDATE newsletter_campaigns
       SET
        status = 'FAILED',
        completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)
       WHERE id = ?`,
      [campaignId]
    );
  } finally {
    inFlightCampaigns.delete(campaignId);
  }
};

const enqueueCampaign = (campaignId) => {
  setImmediate(() => {
    processCampaign(campaignId).catch((err) => {
      console.error('Newsletter campaign queue execution failed:', err);
    });
  });
};

const resumePendingCampaigns = async () => {
  await ensureNewsletterTables();

  const [rows] = await db.query(
    `SELECT id
     FROM newsletter_campaigns
     WHERE status IN ('QUEUED', 'SENDING')
     ORDER BY created_at ASC`
  );

  for (const row of rows) {
    enqueueCampaign(row.id);
  }
};

const createManualCampaign = async ({ subject, html, createdByAdminId = null }) => {
  const campaignId = await createCampaignRecord({
    triggerType: 'MANUAL',
    subject,
    htmlContent: html,
    createdByAdminId,
  });

  enqueueCampaign(campaignId);
  return campaignId;
};

const createAutoArticleCampaign = async ({
  article,
  createdByAdminId = null,
  subjectOverride = '',
}) => {
  const subject =
    normalizeCampaignSubject(subjectOverride) ||
    normalizeCampaignSubject(`New post: ${article?.title || 'Latest story'}`);

  const html = buildAutoArticleHtml(article);
  const campaignId = await createCampaignRecord({
    triggerType: 'AUTO_ARTICLE',
    subject,
    htmlContent: html,
    articleId: article?.id || null,
    createdByAdminId,
  });

  enqueueCampaign(campaignId);
  return campaignId;
};

const normalizeWebhookEventType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  return normalized;
};

const mapWebhookEventToStatus = (eventType) => {
  const normalized = normalizeWebhookEventType(eventType);
  if (!normalized) return null;

  if (normalized.includes('click')) return 'CLICKED';
  if (normalized.includes('open')) return 'OPENED';
  if (normalized.includes('deliver')) return 'DELIVERED';
  if (normalized.includes('bounce')) return 'BOUNCED';
  if (normalized.includes('complaint') || normalized.includes('spam')) return 'COMPLAINED';
  if (normalized.includes('fail') || normalized.includes('reject')) return 'FAILED';
  if (normalized.includes('sent')) return 'SENT';

  return null;
};

const extractProviderEventId = ({ payload, rawBody }) => {
  const explicitId =
    payload?.id ||
    payload?.event_id ||
    payload?.data?.id ||
    payload?.data?.event_id ||
    null;

  if (explicitId) return String(explicitId);

  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(rawBody || JSON.stringify(payload || {})).digest('hex');
  return `derived_${hash}`;
};

const extractProviderMessageId = (payload) => {
  return (
    payload?.data?.email_id ||
    payload?.data?.emailId ||
    payload?.email_id ||
    payload?.emailId ||
    payload?.message_id ||
    payload?.messageId ||
    payload?.data?.message_id ||
    payload?.data?.messageId ||
    null
  );
};

const applyWebhookEvent = async ({ payload, rawBody }) => {
  await ensureNewsletterTables();

  const providerEventId = extractProviderEventId({ payload, rawBody });
  const providerMessageId = extractProviderMessageId(payload);
  const eventType = normalizeWebhookEventType(payload?.type || payload?.event || payload?.name);
  const eventTimestamp = parseEventTime(
    payload?.created_at ||
      payload?.createdAt ||
      payload?.timestamp ||
      payload?.data?.created_at ||
      payload?.data?.createdAt
  );

  let delivery = null;
  if (providerMessageId) {
    [[delivery]] = await db.query(
      `SELECT id, campaign_id, status, provider_message_id
       FROM newsletter_deliveries
       WHERE provider_message_id = ?
       LIMIT 1`,
      [providerMessageId]
    );
  }

  const campaignId = delivery?.campaign_id || null;
  const deliveryId = delivery?.id || null;

  try {
    await db.query(
      `INSERT INTO newsletter_events
        (campaign_id, delivery_id, provider, provider_event_id, provider_message_id, event_type, event_timestamp, payload_json)
       VALUES (?, ?, 'resend', ?, ?, ?, ?, ?)`,
      [
        campaignId,
        deliveryId,
        providerEventId,
        providerMessageId,
        eventType || 'unknown',
        eventTimestamp,
        JSON.stringify(payload || {}),
      ]
    );
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return { duplicate: true, processed: false };
    }
    throw err;
  }

  const nextStatus = mapWebhookEventToStatus(eventType);
  if (!delivery || !nextStatus) {
    return { duplicate: false, processed: true };
  }

  const updates = [];
  const params = [];
  const canApplyEvent =
    shouldTransitionStatus(delivery.status, nextStatus) || delivery.status === nextStatus;

  if (shouldTransitionStatus(delivery.status, nextStatus)) {
    updates.push('status = ?');
    params.push(nextStatus);
  }

  if (!delivery.provider_message_id && providerMessageId) {
    updates.push('provider_message_id = ?');
    params.push(providerMessageId);
  }

  const timestampField = DELIVERY_TIMESTAMP_FIELD[nextStatus];
  if (canApplyEvent && timestampField) {
    updates.push(`${timestampField} = COALESCE(${timestampField}, ?)`);
    params.push(eventTimestamp);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  await db.query(
    `UPDATE newsletter_deliveries
     SET ${updates.join(', ')}
     WHERE id = ?`,
    [...params, delivery.id]
  );

  await db.query(
    `UPDATE newsletter_campaigns
     SET last_event_at = ?
     WHERE id = ?`,
    [eventTimestamp, delivery.campaign_id]
  );

  await recomputeCampaignAggregates(delivery.campaign_id, eventTimestamp);

  return { duplicate: false, processed: true };
};

module.exports = {
  parseBoolean,
  createManualCampaign,
  createAutoArticleCampaign,
  enqueueCampaign,
  processCampaign,
  resumePendingCampaigns,
  recomputeCampaignAggregates,
  applyWebhookEvent,
};
