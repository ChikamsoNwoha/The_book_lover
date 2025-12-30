// routes/articles.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const db = require('../db');

const ALLOWED_CATEGORIES = ['ENTREPRENEURSHIP', 'FASHION'];
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Helper to send error response
const sendError = (res, status, message) => {
  res.status(status).json({ error: message });
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
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, content, category } = req.body;

    // Basic validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return sendError(res, 400, 'Title is required and must be a non-empty string');
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return sendError(res, 400, 'Content is required and must be a non-empty string');
    }

    if (!category || typeof category !== 'string') {
      return sendError(res, 400, 'Category is required');
    }

    const normalizedCategory = category.toUpperCase().trim();
    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      return sendError(
        res,
        400,
        `Invalid category. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`
      );
    }

    const [result] = await db.query(
      'INSERT INTO articles (title, content, category) VALUES (?, ?, ?)',
      [title.trim(), content.trim(), normalizedCategory]
    );

    res.status(201).json({
      message: 'Article posted successfully',
      articleId: result.insertId,
    });
  } catch (err) {
    console.error('Error posting article:', err);

    // Handle duplicate or constraint errors if needed
    if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      return sendError(res, 400, 'Invalid category value');
    }

    sendError(res, 500, 'Failed to post article');
  }
});

module.exports = router;