// db.js
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config()

const parsePort = (value) => {
  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port > 0 ? port : undefined;
};

const poolConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const resolvedPort = parsePort(process.env.DB_PORT || process.env.MYSQLPORT);
if (resolvedPort) {
  poolConfig.port = resolvedPort;
}

const pool = mysql.createPool(poolConfig);

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
