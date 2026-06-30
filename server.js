const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const PORT = 8082;
const PUBLIC_DIR = __dirname;

// Initialize SQLite database
const db = new sqlite3.Database(path.join(PUBLIC_DIR, 'matrimony.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS nabhik_state (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
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

  // SQLite API Endpoints
  if (cleanUrl === '/api/state') {
    if (req.method === 'GET') {
      db.all('SELECT key, value FROM nabhik_state', [], (err, rows) => {
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
          db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            const stmt = db.prepare('INSERT OR REPLACE INTO nabhik_state (key, value) VALUES (?, ?)');
            Object.entries(stateObj).forEach(([key, value]) => {
              stmt.run(key, JSON.stringify(value));
            });
            stmt.finalize();
            db.run('COMMIT', (err) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                return;
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
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
