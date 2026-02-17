// routes/interactions.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to send error response
const sendError = (res, status, message) => {
  res.status(status).json({ error: message });
};

// Helper to validate article ID
const validateArticleId = (id) => {
  const parsed = parseInt(id, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : null;
};

// Normalize IP address (handles IPv4-mapped IPv6 like ::ffff:127.0.0.1)
const getClientIp = (req) => {
  let ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

  // Handle IPv4 mapped in IPv6 (common in local dev)
  if (ip && ip.substr(0, 7) === '::ffff:') {
    ip = ip.substr(7);
  }

  // Fallback to 'unknown' if empty
  return ip || 'unknown';
};

// Increment view count
router.post('/view/:id', async (req, res) => {
  try {
    const articleId = validateArticleId(req.params.id);
    if (!articleId) {
      return sendError(res, 400, 'Invalid article ID');
    }

    const [result] = await db.query(
      'UPDATE articles SET views = views + 1 WHERE id = ?',
      [articleId]
    );

    // If no rows affected, article doesn't exist
    if (result.affectedRows === 0) {
      return sendError(res, 404, 'Article not found');
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error incrementing view:', err);
    sendError(res, 500, 'Failed to record view');
  }
});

// Like article (with duplicate prevention via UNIQUE constraint)
router.post('/like/:id', async (req, res) => {
  try {
    const articleId = validateArticleId(req.params.id);
    if (!articleId) {
      return sendError(res, 400, 'Invalid article ID');
    }

    const userIp = getClientIp(req);

    await db.query(
      'INSERT INTO likes (article_id, user_ip) VALUES (?, ?)',
      [articleId, userIp]
    );

    res.json({ message: 'Liked successfully', liked: true });
  } catch (err) {
    // ER_DUP_ENTRY is MySQL error for duplicate unique key
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Already liked', liked: false });
    }

    console.error('Error liking article:', err);
    sendError(res, 500, 'Failed to like article');
  }
});

// Get likes count for an article
router.get('/likes/:id', async (req, res) => {
  try {
    const articleId = validateArticleId(req.params.id);
    if (!articleId) {
      return sendError(res, 400, 'Invalid article ID');
    }

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM likes WHERE article_id = ?',
      [articleId]
    );

    res.json({ articleId, likes: total });
  } catch (err) {
    console.error('Error fetching likes count:', err);
    sendError(res, 500, 'Failed to fetch likes count');
  }
});

// Add comment
router.post('/comment/:id', async (req, res) => {
  try {
    const articleId = validateArticleId(req.params.id);
    if (!articleId) {
      return sendError(res, 400, 'Invalid article ID');
    }

    const { name, comment } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return sendError(res, 400, 'Name is required');
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return sendError(res, 400, 'Comment is required');
    }

    if (name.trim().length > 100) {
      return sendError(res, 400, 'Name is too long (max 100 characters)');
    }

    if (comment.trim().length > 1000) {
      return sendError(res, 400, 'Comment is too long (max 1000 characters)');
    }

    const trimmedName = name.trim();
    const trimmedComment = comment.trim();

    const [result] = await db.query(
      'INSERT INTO comments (article_id, name, comment) VALUES (?, ?, ?)',
      [articleId, trimmedName, trimmedComment]
    );

    res.status(201).json({
      message: 'Comment added successfully',
      commentId: result.insertId,
    });
  } catch (err) {
    console.error('Error adding comment:', err);

    // Check if article exists (foreign key would fail if not, but no FK defined)
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return sendError(res, 404, 'Article not found');
    }

    sendError(res, 500, 'Failed to add comment');
  }
});

// Get all comments for an article
router.get('/comments/:id', async (req, res) => {
  try {
    const articleId = validateArticleId(req.params.id);
    if (!articleId) {
      return sendError(res, 400, 'Invalid article ID');
    }

    let rows = [];
    try {
      const [joinedRows] = await db.query(
        `SELECT
          c.id,
          c.name,
          c.comment,
          c.created_at,
          r.reply AS admin_reply,
          r.updated_at AS admin_reply_updated_at
        FROM comments c
        LEFT JOIN comment_replies r ON r.comment_id = c.id
        WHERE c.article_id = ?
        ORDER BY c.created_at DESC`,
        [articleId]
      );
      rows = joinedRows;
    } catch (err) {
      if (err.code !== 'ER_NO_SUCH_TABLE') {
        throw err;
      }

      const [fallbackRows] = await db.query(
        `SELECT
          id,
          name,
          comment,
          created_at,
          NULL AS admin_reply,
          NULL AS admin_reply_updated_at
        FROM comments
        WHERE article_id = ?
        ORDER BY created_at DESC`,
        [articleId]
      );
      rows = fallbackRows;
    }

    res.json({
      articleId,
      comments: rows,
      total: rows.length,
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    sendError(res, 500, 'Failed to fetch comments');
  }
});

module.exports = router;
