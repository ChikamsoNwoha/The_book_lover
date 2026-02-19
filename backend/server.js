const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config(); 


const adminRoutes = require('./admin/admin.routes');
const adminNewsletterRoutes = require('./routes/adminNewsletter');
const articleRoutes = require('./routes/articles');
const interactionRoutes = require('./routes/interactions');
const newsletterRoutes = require('./routes/newsletter');
const searchRoutes = require('./routes/search');
const newsletterService = require('./services/newsletterService');

const app = express();
const port = parseInt(process.env.PORT, 10) || 5000;
app.set('trust proxy', true);

app.use(
  cors({
    origin: process.env.SITE_URL || "http://localhost:5173",
  })
);

app.use(
  express.json({
    verify: (req, _res, buffer) => {
      req.rawBody = buffer?.length ? buffer.toString('utf8') : '';
    },
  })
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/articles', articleRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin/newsletter', adminNewsletterRoutes);
app.use('/api/admin', adminRoutes);

const db = require("./db");

app.get("/api/db-check", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message,
      code: err.code,
    });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  newsletterService.resumePendingCampaigns().catch((err) => {
    console.error('Failed to resume pending newsletter campaigns:', err);
  });
});
// 