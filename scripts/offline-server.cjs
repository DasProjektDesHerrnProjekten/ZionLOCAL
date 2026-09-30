// Offline Exam Platform Server
// Serves static files and saves exam results to the exam-results/ folder
const http = require('http');
const fs = require('fs');
const path = require('path');
const { saveExamResultToFile, RESULTS_DIR } = require('./save-result-helper.cjs');

const PORT = 8080;
const ROOT_DIR = path.resolve(__dirname, '..');
const STATIC_DIR = path.join(ROOT_DIR, 'dist-offline');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle saving results
  if (req.method === 'POST' && (req.url === '/api/save-results' || req.url === '/api/save-results/')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { baseFilename } = saveExamResultToFile(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Exam results saved to folder', 
          file: baseFilename 
        }));
      } catch (err) {
        console.error('❌ Error saving results:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Handle static file serving
  if (req.method === 'GET') {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(STATIC_DIR, reqPath);

    // If file doesn't exist, check if it's an SPA route
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(STATIC_DIR, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  console.log('=======================================================');
  console.log(`🚀 Offline Exam Platform Server running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`📂 Exam results folder:`);
  console.log(`   ${RESULTS_DIR}`);
  console.log('=======================================================');
});
