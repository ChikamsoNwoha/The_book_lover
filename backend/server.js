const express = require('express');
const cors = require('cors');

const articleRoutes = require('./routes/articles');
const interactionRoutes = require('./routes/interactions');
const newsletterRoutes = require('./routes/newsletter');
const searchRoutes = require('./routes/search');

const app = express();
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());

app.use('/api/articles', articleRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/search', searchRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
