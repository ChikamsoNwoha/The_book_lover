const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');
const { ensureCommentRepliesTable } = require('../utils/commentRepliesTable');

const router = express.Router();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const sendError = (res, status, message) => {
  res.status(status).json({ message });
};

const parsePositiveInt = (value) => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return null;
  return parsed;
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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password required');
    }

    const [rows] = await db.query(
      'SELECT id, password_hash FROM admins WHERE email = ? AND is_active = true',
      [email]
    );

    if (rows.length === 0) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, rows[0].password_hash);

    if (!isValid) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = jwt.sign(
      { adminId: rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token });
  } catch (err) {
    console.error('Admin login error:', err);
    sendError(res, 500, 'Failed to log in');
  }
});

const handleOverview = async (_req, res) => {
  try {
    await ensureCommentRepliesTable();

    const [
      [[{ totalArticles }]],
      [[{ totalComments }]],
      [[{ totalReplies }]],
      [[{ totalLikes }]],
      [[{ totalSubscribers }]],
      [[{ verifiedSubscribers }]],
      [[{ totalViews }]],
      [recentComments],
    ] = await Promise.all([
      db.query('SELECT COUNT(*) AS totalArticles FROM articles'),
      db.query('SELECT COUNT(*) AS totalComments FROM comments'),
      db.query('SELECT COUNT(*) AS totalReplies FROM comment_replies'),
      db.query('SELECT COUNT(*) AS totalLikes FROM likes'),
      db.query('SELECT COUNT(*) AS totalSubscribers FROM subscribers'),
      db.query(
        'SELECT COALESCE(SUM(verified = TRUE), 0) AS verifiedSubscribers FROM subscribers'
      ),
      db.query('SELECT COALESCE(SUM(views), 0) AS totalViews FROM articles'),
      db.query(
        `SELECT
          c.id,
          c.article_id,
          c.name,
          c.comment,
          c.created_at,
          COALESCE(a.title, '[Untitled/Removed Article]') AS article_title,
          IF(r.id IS NULL, 0, 1) AS has_reply
        FROM comments c
        LEFT JOIN articles a ON a.id = c.article_id
        LEFT JOIN comment_replies r ON r.comment_id = c.id
        ORDER BY c.created_at DESC
        LIMIT 5`
      ),
    ]);

    const unverifiedSubscribers = Math.max(totalSubscribers - verifiedSubscribers, 0);
    const verificationRate =
      totalSubscribers === 0
        ? 0
        : Number(((verifiedSubscribers / totalSubscribers) * 100).toFixed(2));

    res.json({
      totals: {
        articles: totalArticles,
        comments: totalComments,
        replies: totalReplies,
        likes: totalLikes,
        subscribers: totalSubscribers,
        totalSubscribers,
        verifiedSubscribers,
        unverifiedSubscribers,
        verificationRate,
        views: totalViews,
      },
      recentComments,
    });
  } catch (err) {
    console.error('Error loading admin overview:', err);
    sendError(res, 500, 'Failed to load admin overview');
  }
};

router.get('/overview', adminAuth, handleOverview);
router.get('/dashboard', adminAuth, handleOverview);

router.get('/comments', adminAuth, async (req, res) => {
  try {
    await ensureCommentRepliesTable();

    const { page, limit, offset } = getPagination(req.query);
    const articleId = req.query.articleId
      ? parsePositiveInt(req.query.articleId)
      : null;

    if (req.query.articleId && !articleId) {
      return sendError(res, 400, 'Invalid articleId filter');
    }

    let whereClause = '';
    const whereParams = [];

    if (articleId) {
      whereClause = 'WHERE c.article_id = ?';
      whereParams.push(articleId);
    }

    const [rows] = await db.query(
      `SELECT
        c.id,
        c.article_id,
        c.name,
        c.comment,
        c.created_at,
        COALESCE(a.title, '[Untitled/Removed Article]') AS article_title,
        r.reply,
        r.created_at AS reply_created_at,
        r.updated_at AS reply_updated_at,
        ad.name AS replied_by_name
      FROM comments c
      LEFT JOIN articles a ON a.id = c.article_id
      LEFT JOIN comment_replies r ON r.comment_id = c.id
      LEFT JOIN admins ad ON ad.id = r.admin_id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM comments c ${whereClause}`,
      whereParams
    );

    res.json({
      comments: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        limit,
      },
    });
  } catch (err) {
    console.error('Error loading admin comments:', err);
    sendError(res, 500, 'Failed to load comments');
  }
});

router.delete('/comments/:id', adminAuth, async (req, res) => {
  try {
    const commentId = parsePositiveInt(req.params.id);
    if (!commentId) {
      return sendError(res, 400, 'Invalid comment ID');
    }

    const [result] = await db.query('DELETE FROM comments WHERE id = ?', [
      commentId,
    ]);

    if (result.affectedRows === 0) {
      return sendError(res, 404, 'Comment not found');
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    sendError(res, 500, 'Failed to delete comment');
  }
});

router.put('/comments/:id/reply', adminAuth, async (req, res) => {
  try {
    await ensureCommentRepliesTable();

    const commentId = parsePositiveInt(req.params.id);
    if (!commentId) {
      return sendError(res, 400, 'Invalid comment ID');
    }

    const reply = typeof req.body.reply === 'string' ? req.body.reply.trim() : '';

    if (!reply) {
      return sendError(res, 400, 'Reply is required');
    }

    if (reply.length > 2000) {
      return sendError(res, 400, 'Reply is too long (max 2000 characters)');
    }

    const [[comment]] = await db.query('SELECT id FROM comments WHERE id = ?', [
      commentId,
    ]);
    if (!comment) {
      return sendError(res, 404, 'Comment not found');
    }

    await db.query(
      `INSERT INTO comment_replies (comment_id, admin_id, reply)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         admin_id = VALUES(admin_id),
         reply = VALUES(reply),
         updated_at = CURRENT_TIMESTAMP`,
      [commentId, req.admin?.id || null, reply]
    );

    const [[savedReply]] = await db.query(
      `SELECT
        r.reply,
        r.created_at AS reply_created_at,
        r.updated_at AS reply_updated_at,
        ad.name AS replied_by_name
      FROM comment_replies r
      LEFT JOIN admins ad ON ad.id = r.admin_id
      WHERE r.comment_id = ?`,
      [commentId]
    );

    res.json({
      message: 'Reply saved successfully',
      reply: savedReply || null,
    });
  } catch (err) {
    console.error('Error saving comment reply:', err);
    sendError(res, 500, 'Failed to save reply');
  }
});

router.delete('/comments/:id/reply', adminAuth, async (req, res) => {
  try {
    await ensureCommentRepliesTable();

    const commentId = parsePositiveInt(req.params.id);
    if (!commentId) {
      return sendError(res, 400, 'Invalid comment ID');
    }

    const [result] = await db.query(
      'DELETE FROM comment_replies WHERE comment_id = ?',
      [commentId]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 404, 'Reply not found');
    }

    res.json({ message: 'Reply deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment reply:', err);
    sendError(res, 500, 'Failed to delete reply');
  }
});

module.exports = router;
