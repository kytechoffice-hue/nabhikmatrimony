const mysql = require('mysql2');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'u589795535_MasterUser',
  password: process.env.DB_PASSWORD || 'u589795535_KY@Prasad1989',
  database: process.env.DB_NAME || 'u589795535_NBMetrDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const db = mysql.createPool(config);

module.exports = { db, config };
