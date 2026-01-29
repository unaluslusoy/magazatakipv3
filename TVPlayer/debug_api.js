const https = require('https');

console.log('API Playlist Check - Starting...\n');

const options = {
  hostname: 'pano.magazatakip.com.tr',
  path: '/api/sync/playlist',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer 67d9a9931260963adf8de13e520a575880dc6d2295f377d0b728c6a06d2c2a3b',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response length:', data.length);
    console.log('\n--- RAW DATA (first 2000 chars) ---');
    console.log(data.substring(0, 2000));
  });
});

req.on('error', (e) => {
  console.log('Request error:', e.message);
});

req.end();
console.log('Request sent...');

