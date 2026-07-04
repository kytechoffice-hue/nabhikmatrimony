const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
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

// Initialize SQLite database (acting as persistent local backup/fallback)
const DB_DIR = process.env.DATA_DIR || PUBLIC_DIR;
if (process.env.DATA_DIR && !fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const sqliteDb = new sqlite3.Database(path.join(DB_DIR, 'matrimony.db'));
sqliteDb.serialize(() => {
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS nabhik_state (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
});

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

// Global state flag to track database fallback
let useSqliteFallback = false;

// Initialize database table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS nabhik_state (
    \`key\` VARCHAR(255) PRIMARY KEY,
    \`value\` LONGTEXT
  )
`, (err) => {
  if (err) {
    console.warn('[DATABASE] MySQL connection/initialization failed. Falling back to local SQLite database. Error:', err.message);
    useSqliteFallback = true;
  } else {
    console.log('[DATABASE] MySQL database table "nabhik_state" verified/initialized.');
  }
});

// Automatically clean up NMAdmin on server startup after 3 seconds
setTimeout(() => {
  console.log('[DATABASE] Running server startup database cleanup...');
  if (useSqliteFallback) {
    sqliteDb.get("SELECT value FROM nabhik_state WHERE key = 'profiles'", (err, row) => {
      if (err || !row) return;
      try {
        const profiles = JSON.parse(row.value);
        const filtered = profiles.filter(p => p && p.name !== 'NMAdmin' && p.username !== 'NMAdmin');
        if (profiles.length !== filtered.length) {
          sqliteDb.run("REPLACE INTO nabhik_state (`key`, `value`) VALUES ('profiles', ?)", [JSON.stringify(filtered)], (writeErr) => {
            if (!writeErr) console.log('[DATABASE] Successfully removed NMAdmin from SQLite profiles.');
          });
        }
      } catch (e) {
        console.error('[DATABASE] Error parsing SQLite profiles:', e);
      }
    });
    sqliteDb.get("SELECT value FROM nabhik_state WHERE key = 'currentUser'", (err, row) => {
      if (err || !row) return;
      try {
        const user = JSON.parse(row.value);
        if (user && (user.name === 'NMAdmin' || user.username === 'NMAdmin')) {
          sqliteDb.run("DELETE FROM nabhik_state WHERE key = 'currentUser'", (writeErr) => {
            if (!writeErr) console.log('[DATABASE] Successfully deleted NMAdmin currentUser from SQLite.');
          });
        }
      } catch (e) {}
    });
  } else {
    pool.query("SELECT `value` FROM nabhik_state WHERE `key` = 'profiles'", (err, rows) => {
      if (err || !rows || rows.length === 0) return;
      try {
        const profiles = JSON.parse(rows[0].value);
        const filtered = profiles.filter(p => p && p.name !== 'NMAdmin' && p.username !== 'NMAdmin');
        if (profiles.length !== filtered.length) {
          pool.query("REPLACE INTO nabhik_state (`key`, `value`) VALUES ('profiles', ?)", [JSON.stringify(filtered)], (writeErr) => {
            if (!writeErr) console.log('[DATABASE] Successfully removed NMAdmin from MySQL profiles.');
          });
        }
      } catch (e) {
        console.error('[DATABASE] Error parsing MySQL profiles:', e);
      }
    });
    pool.query("SELECT `value` FROM nabhik_state WHERE `key` = 'currentUser'", (err, rows) => {
      if (err || !rows || rows.length === 0) return;
      try {
        const user = JSON.parse(rows[0].value);
        if (user && (user.name === 'NMAdmin' || user.username === 'NMAdmin')) {
          pool.query("DELETE FROM nabhik_state WHERE `key` = 'currentUser'", (writeErr) => {
            if (!writeErr) console.log('[DATABASE] Successfully deleted NMAdmin currentUser from MySQL.');
          });
        }
      } catch (e) {}
    });
  }
}, 3000);

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
  console.log(`[REQUEST] ${req.method} ${cleanUrl}`);

  // Database API Endpoints (MySQL with SQLite fallback)
  if (cleanUrl === '/api/state') {
    // Helper to perform SQLite GET query
    function runSqliteGet() {
      sqliteDb.all('SELECT key, value FROM nabhik_state', [], (err, rows) => {
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
    }

    // Helper to perform SQLite POST query
    function runSqlitePost(stateObj) {
      sqliteDb.serialize(() => {
        sqliteDb.run('BEGIN TRANSACTION');
        const stmt = sqliteDb.prepare('INSERT OR REPLACE INTO nabhik_state (key, value) VALUES (?, ?)');
        Object.entries(stateObj).forEach(([key, value]) => {
          stmt.run(key, JSON.stringify(value));
        });
        stmt.finalize();
        sqliteDb.run('COMMIT', (err) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        });
      });
    }

    if (req.method === 'GET') {
      if (useSqliteFallback) {
        runSqliteGet();
        return;
      }

      pool.query('SELECT `key`, `value` FROM nabhik_state', (err, rows) => {
        if (err) {
          console.warn('[DATABASE] MySQL GET error, falling back to SQLite:', err.message);
          useSqliteFallback = true;
          runSqliteGet();
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
          if (useSqliteFallback) {
            runSqlitePost(stateObj);
            return;
          }

          pool.getConnection((connErr, connection) => {
            if (connErr) {
              console.warn('[DATABASE] MySQL connection checkout error during POST, falling back to SQLite:', connErr.message);
              useSqliteFallback = true;
              runSqlitePost(stateObj);
              return;
            }
            
            connection.beginTransaction(beginTransactionErr => {
              if (beginTransactionErr) {
                connection.release();
                console.warn('[DATABASE] MySQL transaction begin error, falling back to SQLite:', beginTransactionErr.message);
                useSqliteFallback = true;
                runSqlitePost(stateObj);
                return;
              }
              
              const entries = Object.entries(stateObj);
              let index = 0;
              
              function executeNext() {
                if (index >= entries.length) {
                   connection.commit(commitErr => {
                     if (commitErr) {
                       connection.rollback(() => {
                         connection.release();
                         console.warn('[DATABASE] MySQL commit error, falling back to SQLite:', commitErr.message);
                         useSqliteFallback = true;
                         runSqlitePost(stateObj);
                       });
                       return;
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
                      console.warn('[DATABASE] MySQL write query error, falling back to SQLite:', queryErr.message);
                      useSqliteFallback = true;
                      runSqlitePost(stateObj);
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
    }
  }

  // Google Translate Proxy Endpoint (Bypasses CORS restrictions on the client side)
  if (cleanUrl === '/api/translate') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const text = payload.text;
          if (!text) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing text parameter' }));
            return;
          }
          
          const https = require('https');
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=mr&dt=t&q=${encodeURIComponent(text)}`;
          
          https.get(url, (apiRes) => {
            let apiData = '';
            apiRes.on('data', d => {
              apiData += d;
            });
            apiRes.on('end', () => {
              try {
                 const parsed = JSON.parse(apiData);
                 if (parsed && parsed[0] && Array.isArray(parsed[0])) {
                   let fullTranslated = '';
                   parsed[0].forEach(segment => {
                     if (segment && segment[0]) {
                       fullTranslated += segment[0];
                     }
                   });
                   res.writeHead(200, { 'Content-Type': 'application/json' });
                   res.end(JSON.stringify({ translated: fullTranslated }));
                 } else {
                   res.writeHead(200, { 'Content-Type': 'application/json' });
                   res.end(JSON.stringify({ translated: text }));
                 }
               } catch (e) {
                 res.writeHead(200, { 'Content-Type': 'application/json' });
                 res.end(JSON.stringify({ translated: text }));
               }
            });
          }).on('error', (err) => {
            console.error('[TRANSLATE] Error calling Google Translate API:', err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ translated: text }));
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
