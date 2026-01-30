// API Test Script v2
const https = require('https');

// Login'den alınan token
let authToken = '';

const BASE_URL = 'https://pano.magazatakip.com.tr';

console.log('=== Magaza Pano API Baglanti Testi ===\n');
console.log('Base URL:', BASE_URL);
console.log('Tarih:', new Date().toISOString());
console.log('\n');

function makeRequest(name, path, method, body, useAuth) {
  return new Promise((resolve) => {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'MagazaPanoTV-Test/1.0.9'
    };

    if (useAuth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
      hostname: 'pano.magazatakip.com.tr',
      port: 443,
      path: path,
      method: method,
      headers: headers,
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        const statusText = status === 200 ? 'OK' : status === 401 ? 'UNAUTHORIZED' : status === 404 ? 'NOT FOUND' : 'ERROR';

        console.log(`[${name}]`);
        console.log(`  Endpoint: ${method} ${path}`);
        console.log(`  Status: ${status} (${statusText})`);

        try {
          const json = JSON.parse(data);
          console.log(`  Success: ${json.success}`);
          console.log(`  Message: ${json.message || '-'}`);
          if (json.data && json.data.token) {
            authToken = json.data.token;
            console.log(`  Token: ${authToken.substring(0, 20)}...`);
          }
          if (json.data && json.data.device) {
            console.log(`  Device: ${json.data.device.device_name || json.data.device.name} (ID: ${json.data.device.id})`);
          }
          if (json.data && json.data.playlist) {
            console.log(`  Playlist: ${json.data.playlist.name} (ID: ${json.data.playlist.id})`);
          }
          if (json.data && json.data.contents) {
            console.log(`  Contents: ${json.data.contents.length} adet`);
          }
        } catch (e) {
          console.log(`  Response: ${data.substring(0, 100)}`);
        }
        console.log('');
        resolve({ name, status, success: status >= 200 && status < 300 });
      });
    });

    req.on('error', (e) => {
      console.log(`[${name}]`);
      console.log(`  Endpoint: ${method} ${path}`);
      console.log(`  ERROR: ${e.message}`);
      console.log('');
      resolve({ name, error: e.message, success: false });
    });

    req.on('timeout', () => {
      console.log(`[${name}]`);
      console.log(`  Endpoint: ${method} ${path}`);
      console.log(`  ERROR: Timeout (15sn)`);
      console.log('');
      req.destroy();
      resolve({ name, error: 'Timeout', success: false });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  const results = [];

  // 1. Device Login
  results.push(await makeRequest(
    '1. Device Login',
    '/api/auth/device-login',
    'POST',
    { device_code: 'MP-001' },
    false
  ));

  // 2. Auth Verify
  results.push(await makeRequest(
    '2. Auth Verify',
    '/api/auth/verify',
    'GET',
    null,
    true
  ));

  // 3. Device Info
  results.push(await makeRequest(
    '3. Device Info',
    '/api/devices/info',
    'GET',
    null,
    true
  ));

  // 4. Current Playlist
  results.push(await makeRequest(
    '4. Current Playlist',
    '/api/playlists/current',
    'GET',
    null,
    true
  ));

  // 5. Sync Status
  results.push(await makeRequest(
    '5. Sync Status',
    '/api/sync/status',
    'GET',
    null,
    true
  ));

  // 6. Sync Playlist
  results.push(await makeRequest(
    '6. Sync Playlist',
    '/api/sync/playlist',
    'GET',
    null,
    true
  ));

  // 7. Heartbeat
  results.push(await makeRequest(
    '7. Heartbeat',
    '/api/devices/heartbeat',
    'POST',
    {
      app_version: '1.0.9',
      os_version: 'Android 11',
      screen_resolution: '1920x1080',
      free_storage_mb: 2048
    },
    true
  ));

  // Summary
  console.log('=== OZET ===');
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`Basarili: ${passed}/${results.length}`);
  console.log(`Basarisiz: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\nBasarisiz Testler:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.error || 'Status ' + r.status}`);
    });
  }

  console.log('\n=== Test Tamamlandi ===');
}

runTests();

