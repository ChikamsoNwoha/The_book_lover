// routes/search.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Search articles
router.get('/', async (req, res) => {
  try {
    let { q, offset = 0 } = req.query;

    // Trim and validate query
    if (!q || (q = q.trim()).length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long'
      });
    }

    const limit = 10;
    const safeOffset = parseInt(offset, 10) || 0;

    // Use FULLTEXT search with relevance scoring
    const [rows] = await db.query(
      `
      SELECT 
        id, 
        title,
        MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE) AS relevance
      FROM articles
      WHERE MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC, created_at DESC
      LIMIT ? OFFSET ?
      `,
      [q, q, limit, safeOffset]
    );

    // Optional: fallback to LIKE if no fulltext results (rare, but helps for very short/common words)
    if (rows.length === 0) {
      const [fallbackRows] = await db.query(
        `
        SELECT id, title, 0 AS relevance
        FROM articles
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `,
        [`%${q}%`, `%${q}%`, limit, safeOffset]
      );
      rows.push(...fallbackRows);
    }

    res.json({
      results: rows.map(row => ({
        id: row.id,
        title: row.title
        
      })),
      query: q,
      count: rows.length,
      hasMore: rows.length === limit
    });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;