const https = require('https');

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
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('=== PLAYLIST INFO ===');
      console.log('Name:', json.data.playlist.name);
      console.log('ID:', json.data.playlist.id);
      console.log('');
      console.log('=== CONTENTS ===');
      json.data.contents.forEach((c, i) => {
        console.log(`${i+1}. ${c.name}`);
        console.log(`   Type: ${c.type}`);
        console.log(`   file_url: ${c.file_url}`);
        console.log(`   Duration: ${c.duration_seconds}s`);

        // Test URL
        const baseUrl = 'https://pano.magazatakip.com.tr';
        let fullUrl = c.file_url;
        if (fullUrl && !fullUrl.startsWith('http')) {
          fullUrl = `${baseUrl}/${c.file_url}`;
        }
        console.log(`   FULL URL: ${fullUrl}`);
        console.log('');
      });
    } catch (e) {
      console.log('Parse error:', e.message);
      console.log('Raw response:', data.substring(0, 1000));
    }
  });
});

req.on('error', (e) => console.log('Request error:', e.message));
req.end();

