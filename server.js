console.log("RUNNING SERVER VERSION: 2026-07-08 12:45");
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

function maskValue(value) {
  if (!value) return null;
  const text = String(value);
  if (text.length <= 4) return '****';
  return `${text.slice(0, 2)}***${text.slice(-2)}`;
}

function readJsonBody(req, res, callback) {
  let body = '';
  const maxBytes = 25 * 1024 * 1024;

  req.on('data', (chunk) => {
    body += chunk.toString();
    if (Buffer.byteLength(body) > maxBytes) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request body too large' }));
      req.destroy();
    }
  });

  req.on('end', () => {
    try {
      callback(JSON.parse(body || '{}'));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
    }
  });
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
  console.log("URL:", cleanUrl);
  console.log(`[REQUEST] ${req.method} ${cleanUrl}`);
 
  console.log('>>> Entering static file handler for:', cleanUrl);
  // Diagnostic Endpoint to verify DB connection details on Hostinger
  if (cleanUrl === '/api/db-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      database: 'MySQL (Permanent)',
      mysqlHost: mysqlConfig.host,
      mysqlDatabase: mysqlConfig.database,
      mysqlUser: maskValue(mysqlConfig.user),
      mysqlError: mysqlConnectionError
    }));
    return;
  }

  // Database API Endpoints (MySQL only)
  if (cleanUrl === '/api/state') {
  console.log(">>> ENTERED /api/state");

  if (req.method === 'GET') {
    console.log(">>> GET /api/state");

    pool.query('SELECT `key`, `value` FROM nabhik_state', (err, rows) => {

      if (err) {
        console.error('[DATABASE] MySQL GET error object:', err);
        handleDatabaseError(
          res,
          `MySQL Query Failed: ${(err && (err.message || err.code)) || JSON.stringify(err)}`
        );
        return;
      }

      console.log(`[DATABASE] Rows returned: ${rows.length}`);

      const stateObj = {};

      for (const row of rows) {
        try {
          stateObj[row.key] = JSON.parse(row.value);
        } catch (e) {
          console.error("==================================");
          console.error("[JSON PARSE ERROR]");
          console.error("Key   :", row.key);
          console.error("Value :", row.value);
          console.error("Error :", e.message);
          console.error("==================================");

          // Keep original value so one bad row doesn't break everything
          stateObj[row.key] = row.value;
        }
      }

      try {
        const json = JSON.stringify(stateObj);

        console.log(`[DATABASE] Successfully built JSON`);
        console.log(`[DATABASE] Keys: ${Object.keys(stateObj).length}`);
        console.log(`[DATABASE] JSON Size: ${json.length} bytes`);

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });

        res.end(json);

      } catch (e) {

        console.error("==================================");
        console.error("[JSON STRINGIFY ERROR]");
        console.error(e);
        console.error("==================================");

        res.writeHead(500, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          error: 'JSON stringify failed',
          details: e.message
        }));
      }

    });

    return;
  }

  if (req.method === 'POST') {
    console.log(">>> POST /api/state");

    readJsonBody(req, res, (payload) => {
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'State payload must be an object' }));
        return;
      }

      const entries = Object.entries(payload);
      if (!entries.length) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, savedKeys: 0 }));
        return;
      }

      let completed = 0;
      let failed = false;

      entries.forEach(([key, value]) => {
        let jsonValue;
        try {
          jsonValue = JSON.stringify(value);
        } catch (e) {
          if (!failed) {
            failed = true;
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Could not serialize state key "${key}"` }));
          }
          return;
        }

        pool.query(
          'REPLACE INTO nabhik_state (`key`, `value`) VALUES (?, ?)',
          [key, jsonValue],
          (err) => {
            if (failed) return;
            if (err) {
              failed = true;
              console.error('[DATABASE] MySQL POST error object:', err);
              handleDatabaseError(
                res,
                `MySQL Save Failed: ${(err && (err.message || err.code)) || JSON.stringify(err)}`
              );
              return;
            }

            completed += 1;
            if (completed === entries.length) {
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              });
              res.end(JSON.stringify({ success: true, savedKeys: completed }));
            }
          }
        );
      });
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET, POST' });
  res.end(JSON.stringify({ error: 'Method not allowed' }));
  return;
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
  console.log(">>> STATIC HANDLER:", cleanUrl);
  
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
