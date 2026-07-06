const mysql = require('mysql2');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'u589795535_NMMmaster',
  password: process.env.DB_PASSWORD || 'u589795535_KY_NMuser_2026',
  database: process.env.DB_NAME || 'u589795535_NBMetrDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const db = mysql.createPool(config);

module.exports = { db, config };
