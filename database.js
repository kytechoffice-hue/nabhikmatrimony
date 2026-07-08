const mysql = require('mysql2');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

// Force Node.js to prefer IPv4 over IPv6 when resolving hostnames.
// This ensures remote connection to Hostinger MySQL succeeds using whitelisted IPv4 addresses.
dns.setDefaultResultOrder('ipv4first');

function loadLocalEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) return;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

loadLocalEnv();

// Database connection. Keep real credentials in environment variables only.
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const missingConfig = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'].filter((key) => !process.env[key]);
if (missingConfig.length) {
  console.warn(`[CONFIG] Missing database environment variables: ${missingConfig.join(', ')}`);
}

const db = mysql.createPool(config);

module.exports = { db, config };


