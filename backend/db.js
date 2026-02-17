// db.js
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection immediately
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('[db] MySQL connected successfully');
    connection.release();
  } catch (err) {
    console.error('[db] MySQL connection failed:', err.message);
  }
})();

module.exports = pool;
