const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const configPath = path.join(__dirname, 'mysql_config.json');
let fileConfig = {};

try {
  const raw = fs.readFileSync(configPath, 'utf8');
  fileConfig = JSON.parse(raw) || {};
} catch (err) {
  console.warn('[DB CONFIG] Could not read mysql_config.json, using environment/default values.', err.message);
}

const config = {
  host: process.env.DB_HOST || fileConfig.host || '127.0.0.1',
  port: Number(process.env.DB_PORT || fileConfig.port) || 3306,
  user: process.env.DB_USER || fileConfig.user || 'u589795535_NMMmaster',
  password: process.env.DB_PASSWORD || fileConfig.password || 'u589795535_KY_NMuser_2026',
  database: process.env.DB_NAME || fileConfig.database || 'u589795535_NBMetrDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const db = mysql.createPool(config);

module.exports = { db, config };
