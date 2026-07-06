const http = require('http');
const req = http.request({ hostname: 'localhost', port: 8082, path: '/api/db-status', method: 'GET' }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('STATUS_CODE:' + res.statusCode);
    console.log('RESPONSE_BODY:' + data);
  });
});
req.on('error', (err) => {
  console.error('REQUEST_ERR:' + err.message);
});
req.end();
