const mysql = require('mysql2');
const dns = require('dns');

// Force Node.js to prefer IPv4 over IPv6 when resolving hostnames.
// This ensures remote connection to Hostinger MySQL succeeds using whitelisted IPv4 addresses.
dns.setDefaultResultOrder('ipv4first');

// Production database credentials and host configuration
const config = {
  host: process.env.DB_HOST || 'nabhikmatrimony.com',
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


