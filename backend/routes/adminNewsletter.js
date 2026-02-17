const express = require('express');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');
const newsletterService = require('../services/newsletterService');
const { ensureNewsletterTables } = require('../utils/newsletterTables');

const router = express.Router();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const VALID_CAMPAIGN_STATUS = new Set([
  'QUEUED',
  'SENDING',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
]);

const VALID_TRIGGER_TYPES = new Set(['MANUAL', 'AUTO_ARTICLE']);

const VALID_DELIVERY_STATUS = new Set([
  'PENDING',
  'SENT',
  'DELIVERED',
  'OPENED',
  'CLICKED',
  'FAILED',
  'BOUNCED',
  'COMPLAINED',
]);

const sendError = (res, status, message) => {
  res.status(status).json({ message });
};

const getPagination = (query) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const parsePositiveInt = (value) => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return null;
  return parsed;
};

router.use(adminAuth);

router.get('/summary', async (_req, res) => {
  try {
    await ensureNewsletterTables();

    const [
      [[audienceTotals]],
      [[campaignStatusTotals]],
      [[campaignAggregateTotals]],
    ] = await Promise.all([
      db.query(
        `SELECT
          COUNT(*) AS totalSubscribers,
          COALESCE(SUM(verified = TRUE), 0) AS verifiedSubscribers
         FROM subscribers`
      ),
      db.query(
        `SELECT
          COUNT(*) AS totalCampaigns,
          COALESCE(SUM(status = 'QUEUED'), 0) AS queuedCampaigns,
          COALESCE(SUM(status = 'SENDING'), 0) AS sendingCampaigns,
          COALESCE(SUM(status = 'COMPLETED'), 0) AS completedCampaigns,
          COALESCE(SUM(status = 'PARTIAL'), 0) AS partialCampaigns,
          COALESCE(SUM(status = 'FAILED'), 0) AS failedCampaigns
         FROM newsletter_campaigns`
      ),
      db.query(
        `SELECT
          COALESCE(SUM(total_recipients), 0) AS totalRecipients,
          COALESCE(SUM(sent_count), 0) AS totalSent,
          COALESCE(SUM(delivered_count), 0) AS totalDelivered,
          COALESCE(SUM(opened_count), 0) AS totalOpened,
          COALESCE(SUM(clicked_count), 0) AS totalClicked,
          COALESCE(SUM(failed_count), 0) AS totalFailed
         FROM newsletter_campaigns`
      ),
    ]);

    const totalSubscribers = Number(audienceTotals?.totalSubscribers || 0);
    const verifiedSubscribers = Number(audienceTotals?.verifiedSubscribers || 0);
    const unverifiedSubscribers = Math.max(totalSubscribers - verifiedSubscribers, 0);
    const verificationRate =
      totalSubscribers === 0
        ? 0
        : Number(((verifiedSubscribers / totalSubscribers) * 100).toFixed(2));

    res.json({
      audience: {
        totalSubscribers,
        verifiedSubscribers,
        unverifiedSubscribers,
        verificationRate,
      },
      campaigns: {
        totalCampaigns: Number(campaignStatusTotals?.totalCampaigns || 0),
        queuedCampaigns: Number(campaignStatusTotals?.queuedCampaigns || 0),
        sendingCampaigns: Number(campaignStatusTotals?.sendingCampaigns || 0),
        completedCampaigns: Number(campaignStatusTotals?.completedCampaigns || 0),
        partialCampaigns: Number(campaignStatusTotals?.partialCampaigns || 0),
        failedCampaigns: Number(campaignStatusTotals?.failedCampaigns || 0),
        totalRecipients: Number(campaignAggregateTotals?.totalRecipients || 0),
        totalSent: Number(campaignAggregateTotals?.totalSent || 0),
        totalDelivered: Number(campaignAggregateTotals?.totalDelivered || 0),
        totalOpened: Number(campaignAggregateTotals?.totalOpened || 0),
        totalClicked: Number(campaignAggregateTotals?.totalClicked || 0),
        totalFailed: Number(campaignAggregateTotals?.totalFailed || 0),
      },
    });
  } catch (err) {
    console.error('Error loading newsletter summary:', err);
    sendError(res, 500, 'Failed to load newsletter summary');
  }
});

router.get('/campaigns', async (req, res) => {
  try {
    await ensureNewsletterTables();

    const { page, limit, offset } = getPagination(req.query);
    const status =
      typeof req.query.status === 'string' ? req.query.status.toUpperCase().trim() : '';
    const trigger =
      typeof req.query.trigger === 'string' ? req.query.trigger.toUpperCase().trim() : '';

    if (status && !VALID_CAMPAIGN_STATUS.has(status)) {
      return sendError(res, 400, 'Invalid campaign status filter');
    }

    if (trigger && !VALID_TRIGGER_TYPES.has(trigger)) {
      return sendError(res, 400, 'Invalid campaign trigger filter');
    }

    const whereParts = [];
    const whereParams = [];

    if (status) {
      whereParts.push('status = ?');
      whereParams.push(status);
    }

    if (trigger) {
      whereParts.push('trigger_type = ?');
      whereParams.push(trigger);
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

    const [campaigns] = await db.query(
      `SELECT
        id,
        trigger_type,
        status,
        subject,
        article_id,
        total_recipients,
        sent_count,
        delivered_count,
        opened_count,
        clicked_count,
        failed_count,
        created_at,
        started_at,
        completed_at,
        last_event_at
      FROM newsletter_campaigns
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM newsletter_campaigns
       ${whereClause}`,
      whereParams
    );

    res.json({
      campaigns,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCampaigns: total,
        limit,
      },
    });
  } catch (err) {
    console.error('Error loading newsletter campaigns:', err);
    sendError(res, 500, 'Failed to load newsletter campaigns');
  }
});

router.get('/campaigns/:id/deliveries', async (req, res) => {
  try {
    await ensureNewsletterTables();

    const campaignId = parsePositiveInt(req.params.id);
    if (!campaignId) {
      return sendError(res, 400, 'Invalid campaign ID');
    }

    const { page, limit, offset } = getPagination(req.query);
    const status =
      typeof req.query.status === 'string' ? req.query.status.toUpperCase().trim() : '';
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (status && !VALID_DELIVERY_STATUS.has(status)) {
      return sendError(res, 400, 'Invalid delivery status filter');
    }

    const [[campaign]] = await db.query(
      `SELECT
        id,
        trigger_type,
        status,
        subject,
        article_id,
        total_recipients,
        sent_count,
        delivered_count,
        opened_count,
        clicked_count,
        failed_count,
        created_at,
        started_at,
        completed_at,
        last_event_at
       FROM newsletter_campaigns
       WHERE id = ?`,
      [campaignId]
    );

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found');
    }

    const whereParts = ['campaign_id = ?'];
    const whereParams = [campaignId];

    if (status) {
      whereParts.push('status = ?');
      whereParams.push(status);
    }

    if (query) {
      whereParts.push('email LIKE ?');
      whereParams.push(`%${query}%`);
    }

    const whereClause = `WHERE ${whereParts.join(' AND ')}`;

    const [deliveries] = await db.query(
      `SELECT
        id,
        email,
        status,
        provider_message_id,
        provider_response_code,
        provider_response_message,
        sent_at,
        delivered_at,
        opened_at,
        clicked_at,
        failed_at,
        bounced_at,
        complained_at,
        created_at,
        updated_at
      FROM newsletter_deliveries
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM newsletter_deliveries
       ${whereClause}`,
      whereParams
    );

    res.json({
      campaign,
      deliveries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDeliveries: total,
        limit,
      },
    });
  } catch (err) {
    console.error('Error loading newsletter deliveries:', err);
    sendError(res, 500, 'Failed to load newsletter deliveries');
  }
});

router.post('/campaigns', async (req, res) => {
  try {
    await ensureNewsletterTables();

    const trigger =
      typeof req.body.trigger === 'string'
        ? req.body.trigger.toUpperCase().trim()
        : 'MANUAL';

    if (!VALID_TRIGGER_TYPES.has(trigger)) {
      return sendError(res, 400, 'Invalid trigger type');
    }

    if (trigger === 'MANUAL') {
      const subject = typeof req.body.subject === 'string' ? req.body.subject : '';
      const html = typeof req.body.html === 'string' ? req.body.html : '';

      if (!subject.trim()) {
        return sendError(res, 400, 'subject is required');
      }
      if (!html.trim()) {
        return sendError(res, 400, 'html is required');
      }

      const campaignId = await newsletterService.createManualCampaign({
        subject,
        html,
        createdByAdminId: req.admin?.id || null,
      });

      return res.status(201).json({
        message: 'Campaign queued successfully',
        campaignId,
      });
    }

    const articleId = parsePositiveInt(req.body.articleId);
    if (!articleId) {
      return sendError(res, 400, 'articleId is required for AUTO_ARTICLE campaigns');
    }

    const [[article]] = await db.query(
      `SELECT id, title, content
       FROM articles
       WHERE id = ?`,
      [articleId]
    );

    if (!article) {
      return sendError(res, 404, 'Article not found');
    }

    const campaignId = await newsletterService.createAutoArticleCampaign({
      article,
      createdByAdminId: req.admin?.id || null,
      subjectOverride: typeof req.body.subject === 'string' ? req.body.subject : '',
    });

    return res.status(201).json({
      message: 'Auto article campaign queued successfully',
      campaignId,
    });
  } catch (err) {
    console.error('Error creating newsletter campaign:', err);
    sendError(res, 500, 'Failed to create newsletter campaign');
  }
});

module.exports = router;
