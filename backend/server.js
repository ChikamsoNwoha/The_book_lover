require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const adminRoutes = require('./admin/admin.routes');
const articleRoutes = require('./routes/articles');
const interactionRoutes = require('./routes/interactions');
const newsletterRoutes = require('./routes/newsletter');
const searchRoutes = require('./routes/search');

const app = express();
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/articles', articleRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);


app.listen(5000, () => {
  console.log('Server running on port 5000');
});
