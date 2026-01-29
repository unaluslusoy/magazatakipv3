// API Test Script
const https = require('https');

const endpoints = [
  { name: 'Auth Verify', url: 'https://pano.magazatakip.com.tr/api/auth/verify', method: 'GET' },
  { name: 'Device Login', url: 'https://pano.magazatakip.com.tr/api/auth/device-login', method: 'POST', body: JSON.stringify({ device_code: 'MP-001' }) },
  { name: 'Health (eski)', url: 'https://mtapi.magazatakip.com.tr/api/health', method: 'GET' },
];

console.log('=== API Baglanti Testi ===\n');

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const urlObj = new URL(endpoint.url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MagazaPanoTV-Test/1.0'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`[${endpoint.name}]`);
        console.log(`  URL: ${endpoint.url}`);
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Response: ${data.substring(0, 150)}...`);
        console.log('');
        resolve({ name: endpoint.name, status: res.statusCode, success: true });
      });
    });

    req.on('error', (e) => {
      console.log(`[${endpoint.name}]`);
      console.log(`  URL: ${endpoint.url}`);
      console.log(`  ERROR: ${e.message}`);
      console.log('');
      resolve({ name: endpoint.name, error: e.message, success: false });
    });

    req.on('timeout', () => {
      console.log(`[${endpoint.name}]`);
      console.log(`  URL: ${endpoint.url}`);
      console.log(`  ERROR: Timeout`);
      console.log('');
      req.destroy();
      resolve({ name: endpoint.name, error: 'Timeout', success: false });
    });

    if (endpoint.body) {
      req.write(endpoint.body);
    }
    req.end();
  });
}

async function runTests() {
  for (const ep of endpoints) {
    await testEndpoint(ep);
  }
  console.log('=== Test Tamamlandi ===');
}

runTests();

