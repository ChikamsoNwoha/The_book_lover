// routes/articles.js
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const multer = require('multer');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const db = require('../db');
const newsletterService = require('../services/newsletterService');

const ALLOWED_CATEGORIES = ['ENTREPRENEURSHIP', 'FASHION'];
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'articles');
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

// Helper to send error response
const sendError = (res, status, message) => {
  res.status(status).json({ error: message });
};

const ensureUploadDir = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir()
      .then(() => cb(null, UPLOAD_DIR))
      .catch((err) => cb(err));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const fallbackExt =
      file.mimetype === 'image/png'
        ? '.png'
        : file.mimetype === 'image/webp'
          ? '.webp'
          : '.jpg';
    const safeExt = ext || fallbackExt;
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
  },
});

const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return sendError(res, 400, err.message || 'Image upload failed');
    }
    return next();
  });
};

const getDiskPathFromUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  if (!imageUrl.startsWith('/uploads/')) return null;
  const relativePath = imageUrl.replace(/^\/+/, '');
  return path.join(__dirname, '..', relativePath);
};

const removeFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err && err.code !== 'ENOENT') {
      console.error('Error removing image file:', err);
    }
  }
};

const parseIdsParam = (value) => {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id));
};

// Get all articles with pagination
router.get('/', async (req, res) => {
  try {
    let { page = 1, limit = DEFAULT_LIMIT } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      'SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    // Get total count for pagination metadata
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM articles');

    res.json({
      articles: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArticles: total,
        limit,
      },
    });
  } catch (err) {
    console.error('Error fetching articles:', err);
    sendError(res, 500, 'Failed to fetch articles');
  }
});

// Get articles by category with pagination and validation
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const normalizedCategory = category.toUpperCase();

    let { page = 1, limit = DEFAULT_LIMIT } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const offset = (page - 1) * limit;

    // 👉 ALL means no filter
    if (normalizedCategory === 'ALL') {
      const [rows] = await db.query(
        'SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      const [[{ total }]] = await db.query(
        'SELECT COUNT(*) AS total FROM articles'
      );

      return res.json({
        articles: rows,
        category: 'ALL',
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalArticles: total,
          limit,
        },
      });
    }

    // Validate real categories
    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      return sendError(
        res,
        400,
        `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
      );
    }

    const [rows] = await db.query(
      'SELECT * FROM articles WHERE category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [normalizedCategory, limit, offset]
    );

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM articles WHERE category = ?',
      [normalizedCategory]
    );

    res.json({
      articles: rows,
      category: normalizedCategory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArticles: total,
        limit,
      },
    });
  } catch (err) {
    console.error('Error fetching articles by category:', err);
    sendError(res, 500, 'Failed to fetch articles by category');
  }
});

// Get likes/comments counts for articles (optional ids=1,2,3)
router.get('/stats', async (req, res) => {
  try {
    const ids = parseIdsParam(req.query.ids);

    let sql = `
      SELECT 
        a.id,
        COUNT(DISTINCT l.id) AS likes,
        COUNT(DISTINCT c.id) AS comments
      FROM articles a
      LEFT JOIN likes l ON l.article_id = a.id
      LEFT JOIN comments c ON c.article_id = a.id
    `;
    const params = [];

    if (ids.length > 0) {
      sql += ` WHERE a.id IN (${ids.map(() => '?').join(',')})`;
      params.push(...ids);
    }

    sql += ' GROUP BY a.id';

    const [rows] = await db.query(sql, params);
    res.json({ stats: rows });
  } catch (err) {
    console.error('Error fetching article stats:', err);
    sendError(res, 500, 'Failed to fetch article stats');
  }
});

// Get single article by ID + increment views
router.get('/:id', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id, 10);

    if (isNaN(articleId)) {
      return sendError(res, 400, 'Invalid article ID');
    }

    // Increment views first
    const [updateResult] = await db.query(
      'UPDATE articles SET views = views + 1 WHERE id = ?',
      [articleId]
    );

    // If no rows were updated, article doesn't exist
    if (updateResult.affectedRows === 0) {
      return sendError(res, 404, 'Article not found');
    }

    // Fetch the article
    const [[article]] = await db.query(
      'SELECT * FROM articles WHERE id = ?',
      [articleId]
    );

    res.json(article);
  } catch (err) {
    console.error('Error fetching article:', err);
    sendError(res, 500, 'Failed to fetch article');
  }
});

// Admin: Post new article with validation
router.post('/', adminAuth, handleUpload, async (req, res) => {
  const uploadedPath = req.file
    ? path.join(UPLOAD_DIR, req.file.filename)
    : null;

  try {
    const { title, content, category, quote, sendNewsletter, newsletterSubject } = req.body;

    // Basic validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(res, 400, 'Title is required and must be a non-empty string');
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(res, 400, 'Content is required and must be a non-empty string');
    }

    if (!category || typeof category !== 'string') {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(res, 400, 'Category is required');
    }

    const normalizedCategory = category.toUpperCase().trim();
    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(
        res,
        400,
        `Invalid category. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`
      );
    }

    const imageUrl = req.file ? `/uploads/articles/${req.file.filename}` : null;
    const normalizedQuote =
      typeof quote === 'string' && quote.trim().length > 0
        ? quote.trim()
        : null;

    const [result] = await db.query(
      'INSERT INTO articles (title, content, category, quote, image_url) VALUES (?, ?, ?, ?, ?)',
      [
        title.trim(),
        content.trim(),
        normalizedCategory,
        normalizedQuote,
        imageUrl,
      ]
    );

    const shouldSendNewsletter = newsletterService.parseBoolean(sendNewsletter, false);
    const normalizedNewsletterSubject =
      typeof newsletterSubject === 'string' && newsletterSubject.trim().length > 0
        ? newsletterSubject.trim()
        : '';

    if (shouldSendNewsletter) {
      setImmediate(async () => {
        try {
          await newsletterService.createAutoArticleCampaign({
            article: {
              id: result.insertId,
              title: title.trim(),
              content: content.trim(),
            },
            createdByAdminId: req.admin?.id || null,
            subjectOverride: normalizedNewsletterSubject,
          });
        } catch (newsletterErr) {
          console.error('Failed to queue auto newsletter campaign:', newsletterErr);
        }
      });
    }

    res.status(201).json({
      message: 'Article posted successfully',
      articleId: result.insertId,
      newsletterQueued: shouldSendNewsletter,
    });
  } catch (err) {
    if (uploadedPath) {
      await removeFile(uploadedPath);
    }
    console.error('Error posting article:', err);

    // Handle duplicate or constraint errors if needed
    if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      return sendError(res, 400, 'Invalid category value');
    }

    sendError(res, 500, 'Failed to post article');
  }
});

// Admin: Update article with validation
router.put('/:id', adminAuth, handleUpload, async (req, res) => {
  const uploadedPath = req.file
    ? path.join(UPLOAD_DIR, req.file.filename)
    : null;

  try {
    const articleId = parseInt(req.params.id, 10);
    if (isNaN(articleId)) {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(res, 400, 'Invalid article ID');
    }

    const { title, content, category, quote, removeImage } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(res, 400, 'Title is required and must be a non-empty string');
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(res, 400, 'Content is required and must be a non-empty string');
    }

    if (!category || typeof category !== 'string') {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(res, 400, 'Category is required');
    }

    const normalizedCategory = category.toUpperCase().trim();
    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(
        res,
        400,
        `Invalid category. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`
      );
    }

    const [[existing]] = await db.query(
      'SELECT id, image_url FROM articles WHERE id = ?',
      [articleId]
    );

    if (!existing) {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(res, 404, 'Article not found');
    }

    const shouldRemoveImage =
      removeImage === true || removeImage === 'true' || removeImage === '1';

    let nextImageUrl = existing.image_url || null;

    if (req.file) {
      nextImageUrl = `/uploads/articles/${req.file.filename}`;
    } else if (shouldRemoveImage) {
      nextImageUrl = null;
    }

    const normalizedQuote =
      typeof quote === 'string' && quote.trim().length > 0
        ? quote.trim()
        : null;

    const [result] = await db.query(
      'UPDATE articles SET title = ?, content = ?, category = ?, quote = ?, image_url = ? WHERE id = ?',
      [
        title.trim(),
        content.trim(),
        normalizedCategory,
        normalizedQuote,
        nextImageUrl,
        articleId,
      ]
    );

    if (result.affectedRows === 0) {
      if (uploadedPath) {
        await removeFile(uploadedPath);
      }
      return sendError(res, 404, 'Article not found');
    }

    if (
      existing.image_url &&
      existing.image_url !== nextImageUrl &&
      (shouldRemoveImage || req.file)
    ) {
      await removeFile(getDiskPathFromUrl(existing.image_url));
    }

    res.json({ message: 'Article updated successfully' });
  } catch (err) {
    if (uploadedPath) {
      await removeFile(uploadedPath);
    }
    console.error('Error updating article:', err);
    sendError(res, 500, 'Failed to update article');
  }
});

// Admin: Delete article
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const articleId = parseInt(req.params.id, 10);
    if (isNaN(articleId)) {
      return sendError(res, 400, 'Invalid article ID');
    }

    const [[existing]] = await db.query(
      'SELECT image_url FROM articles WHERE id = ?',
      [articleId]
    );

    if (!existing) {
      return sendError(res, 404, 'Article not found');
    }

    const [result] = await db.query('DELETE FROM articles WHERE id = ?', [
      articleId,
    ]);

    if (result.affectedRows === 0) {
      return sendError(res, 404, 'Article not found');
    }

    if (existing.image_url) {
      await removeFile(getDiskPathFromUrl(existing.image_url));
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err);
    sendError(res, 500, 'Failed to delete article');
  }
});

module.exports = router;
