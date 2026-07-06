const http = require('http');
const fs = require('fs');
const path = require('path');
const { db: pool, config: mysqlConfig } = require('./database');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 8082;
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


let mysqlConnectionError = null;

function handleDatabaseError(res, errMessage) {
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: errMessage }));
  }
}

// Initialize database table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS nabhik_state (
    \`key\` VARCHAR(255) PRIMARY KEY,
    \`value\` LONGTEXT
  )
`, (err) => {
  if (err) {
    mysqlConnectionError = (err && (err.message || err.code)) || JSON.stringify(err) || 'Unknown MySQL error';
    console.error('[DATABASE] MySQL connection failed. Error object:', err);
  } else {
    console.log('[DATABASE] MySQL database table "nabhik_state" verified/initialized.');
  }
});

// Automatically clean up NMAdmin on server startup after 3 seconds
setTimeout(() => {
  console.log('[DATABASE] Running server startup database cleanup...');
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

  // Diagnostic Endpoint to verify DB connection details on Hostinger
  if (cleanUrl === '/api/db-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      database: 'MySQL (Permanent)',
      mysqlHost: mysqlConfig.host,
      mysqlDatabase: mysqlConfig.database,
      mysqlUser: mysqlConfig.user,
      mysqlError: mysqlConnectionError
    }));
    return;
  }

  // Database API Endpoints (MySQL only)
  if (cleanUrl === '/api/state') {
    if (req.method === 'GET') {
      pool.query('SELECT `key`, `value` FROM nabhik_state', (err, rows) => {
        if (err) {
          console.error('[DATABASE] MySQL GET error object:', err);
          handleDatabaseError(res, `MySQL Query Failed: ${(err && (err.message || err.code)) || JSON.stringify(err)}`);
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
              console.error('[DATABASE] MySQL connection checkout error during POST:', connErr);
              handleDatabaseError(res, `MySQL Connection Checkout Failed: ${(connErr && (connErr.message || connErr.code)) || JSON.stringify(connErr)}`);
              return;
            }

            connection.beginTransaction(beginTransactionErr => {
              if (beginTransactionErr) {
                connection.release();
                console.warn('[DATABASE] MySQL transaction begin error:', beginTransactionErr.message);
                handleDatabaseError(res, `MySQL Transaction Begin Failed: ${beginTransactionErr.message}`);
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
                        console.warn('[DATABASE] MySQL commit error:', commitErr.message);
                        handleDatabaseError(res, `MySQL Transaction Commit Failed: ${commitErr.message}`);
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
                      console.warn('[DATABASE] MySQL write query error:', queryErr.message);
                      handleDatabaseError(res, `MySQL Write Query Failed: ${queryErr.message}`);
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
