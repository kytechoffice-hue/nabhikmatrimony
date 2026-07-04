const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');

const PORT = 8082;
const PUBLIC_DIR = __dirname;

// Initialize email configuration file
const CONFIG_FILE = path.join(PUBLIC_DIR, 'email_config.json');
if (!fs.existsSync(CONFIG_FILE)) {
  const defaultConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf8');
  console.log(`[CONFIG] SMTP config file "email_config.json" created in root directory. Please configure it for real email delivery.`);
}

function getEmailConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && parsed.user !== 'your-email@gmail.com' && parsed.pass && parsed.pass !== 'your-app-password') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('[CONFIG] Error reading email_config.json:', e);
  }
  return null;
}

// Initialize MySQL configuration
const MYSQL_CONFIG_FILE = path.join(PUBLIC_DIR, 'mysql_config.json');
function getMysqlConfig() {
  let config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'nabhik_matrimony'
  };

  try {
    if (fs.existsSync(MYSQL_CONFIG_FILE)) {
      const raw = fs.readFileSync(MYSQL_CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (parsed.host && !process.env.MYSQL_HOST) config.host = parsed.host;
        if (parsed.port && !process.env.MYSQL_PORT) config.port = parseInt(parsed.port);
        if (parsed.user && !process.env.MYSQL_USER) config.user = parsed.user;
        if (parsed.password && !process.env.MYSQL_PASSWORD) config.password = parsed.password;
        if (parsed.database && !process.env.MYSQL_DATABASE) config.database = parsed.database;
      }
    }
  } catch (e) {
    console.error('[CONFIG] Error reading mysql_config.json:', e);
  }
  return config;
}

const mysqlConfig = getMysqlConfig();
const pool = mysql.createPool({
  host: mysqlConfig.host,
  port: mysqlConfig.port,
  user: mysqlConfig.user,
  password: mysqlConfig.password,
  database: mysqlConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS nabhik_state (
    \`key\` VARCHAR(255) PRIMARY KEY,
    \`value\` LONGTEXT
  )
`, (err) => {
  if (err) {
    console.error('[DATABASE] Error initializing MySQL database table:', err);
  } else {
    console.log('[DATABASE] MySQL database table "nabhik_state" verified/initialized.');
  }
});

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const host = req.headers.host;
  // HTTP 301 Canonical redirect: www to apex domain
  if (host && host.toLowerCase() === 'www.nabhikmatrimony.com') {
    res.writeHead(301, { 'Location': `https://nabhikmatrimony.com${req.url}` });
    res.end();
    return;
  }

  // Clean query strings and hashes
  const cleanUrl = req.url.split('?')[0].split('#')[0];

  // MySQL API Endpoints
  if (cleanUrl === '/api/state') {
    if (req.method === 'GET') {
      pool.query('SELECT `key`, `value` FROM nabhik_state', (err, rows) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
          return;
        }
        const stateObj = {};
        rows.forEach(row => {
          try {
            stateObj[row.key] = JSON.parse(row.value);
          } catch (e) {
            stateObj[row.key] = row.value;
          }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stateObj));
      });
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const stateObj = JSON.parse(body);
          pool.getConnection((connErr, connection) => {
            if (connErr) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: connErr.message }));
              return;
            }
            
            connection.beginTransaction(beginTransactionErr => {
              if (beginTransactionErr) {
                connection.release();
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: beginTransactionErr.message }));
                return;
              }
              
              const entries = Object.entries(stateObj);
              let index = 0;
              
              function executeNext() {
                if (index >= entries.length) {
                  connection.commit(commitErr => {
                    if (commitErr) {
                      return connection.rollback(() => {
                        connection.release();
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: commitErr.message }));
                      });
                    }
                    connection.release();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                  });
                  return;
                }
                
                const [key, value] = entries[index];
                const valStr = JSON.stringify(value);
                
                connection.query('REPLACE INTO nabhik_state (`key`, `value`) VALUES (?, ?)', [key, valStr], (queryErr) => {
                  if (queryErr) {
                    return connection.rollback(() => {
                      connection.release();
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: queryErr.message }));
                    });
                  }
                  index++;
                  executeNext();
                });
              }
              
              executeNext();
            });
          });
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      });
      return;
    }
  }

  // Email Send OTP Endpoint
  if (cleanUrl === '/api/send-otp') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const email = payload.email;
          const code = payload.code;
          
          if (!email || !code) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Email and OTP code are required' }));
            return;
          }

          const config = getEmailConfig();
          if (config) {
            // Create nodemailer transporter
            const transporter = nodemailer.createTransport({
              host: config.host || 'smtp.gmail.com',
              port: config.port || 587,
              secure: config.port === 465,
              auth: {
                user: config.user,
                pass: config.pass
              }
            });

            const mailOptions = {
              from: `"Nabhik Matrimonial" <${config.user}>`,
              to: `${email}, verifyme@nabhikmatrimony.com`,
              replyTo: email,
              subject: `Nabhik Matrimonial Verification Code - ${email}`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 500px;">
                  <h2 style="color: #8b002c; border-bottom: 2px solid #d4af37; padding-bottom: 8px;">Nabhik Matrimonial</h2>
                  <p>Namaskar,</p>
                  <p>Your security OTP verification code for Nabhik Matrimonial registration is:</p>
                  <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 1.8rem; font-weight: bold; letter-spacing: 4px; margin: 20px 0; border-radius: 4px; border: 1px dashed #d4af37; color: #8b002c;">
                    ${code}
                  </div>
                  <p style="font-size: 0.88rem; color: #666;">Customer Email: <strong>${email}</strong></p>
                  <p style="font-size: 0.88rem; color: #666;">Do not share this code with anyone. If you did not request this code, please ignore this email.</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                  <p style="font-size: 0.8rem; color: #999;">Best Regards,<br>Nabhik Matrimonial Team</p>
                </div>
              `
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error('[EMAIL SENDER] Error sending SMTP email:', error);
                // Fallback to console print so the registration won't block even if SMTP fails
                console.log(`\x1b[33m%s\x1b[0m`, `[EMAIL OTP SENDER FALLBACK] Sending OTP code ${code} from ${email} to verifyme@nabhikmatrimony.com (SMTP failed: ${error.message})`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, fallback: true, error: error.message }));
              } else {
                console.log(`[EMAIL SENDER] Real email sent from ${email} to verifyme@nabhikmatrimony.com successfully. Message ID: ${info.messageId}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              }
            });
          } else {
            // Fallback to printing directly to the terminal stdout/console
            console.log(`\x1b[36m%s\x1b[0m`, `[EMAIL OTP SENDER] Sending OTP code ${code} from ${email} to verifyme@nabhikmatrimony.com. (Please configure email_config.json for real SMTP sending).`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, fallback: true }));
          }
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      });
      return;
    }
  }

  let filePath = path.join(PUBLIC_DIR, cleanUrl === '/' ? 'index.html' : cleanUrl);

  // Prevent directory traversal
  const relative = path.relative(PUBLIC_DIR, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    res.statusCode = 403;
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for HTML5 History API virtual routing
      filePath = path.join(PUBLIC_DIR, 'index.html');
      fs.stat(filePath, (errIndex, statsIndex) => {
        if (errIndex || !statsIndex.isFile()) {
          res.statusCode = 404;
          res.end(`404 Not Found: ${cleanUrl}`);
          return;
        }
        serveFile(filePath);
      });
      return;
    }

    serveFile(filePath);

    function serveFile(fileToServe) {
      const ext = path.extname(fileToServe).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'text/plain');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0'); // Disable caching
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const stream = fs.createReadStream(fileToServe);
      stream.pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Nabhik Matrimonial Local Node Server`);
  console.log(` Listening on http://localhost:${PORT}/`);
  console.log(` Caching disabled for hot reloading`);
  console.log(`=========================================`);
});
