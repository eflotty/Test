// Simple config server - stores config in memory and serves it to the bot
// Run this alongside the bot for automatic config sync

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
let currentConfig = null;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/config') {
    // Save config
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        currentConfig = JSON.parse(body);
        // Also save to file as backup
        fs.writeFileSync(
          path.join(__dirname, 'booking-config.json'),
          JSON.stringify(currentConfig, null, 2)
        );
        console.log('✅ Config saved:', currentConfig);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/config') {
    // Get config
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(currentConfig || {}));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Load existing config on startup
const configFile = path.join(__dirname, 'booking-config.json');
if (fs.existsSync(configFile)) {
  try {
    currentConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    console.log('📋 Loaded existing config');
  } catch (e) {
    console.log('⚠️  Could not load existing config');
  }
}

// Get local IP address
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`📡 Config server running!`);
  console.log(`   Local:  http://localhost:${PORT}`);
  console.log(`   Network: http://${localIP}:${PORT}`);
  console.log(`   POST /config - Save config`);
  console.log(`   GET /config - Get config`);
  console.log(`\n💡 Share this URL with your phone: http://${localIP}:${PORT}`);
});

