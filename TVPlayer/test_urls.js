const https = require('https');

const urls = [
  'https://pano.magazatakip.com.tr/images/media_697a24ff5180d_1769612543.jpg',
  'https://pano.magazatakip.com.tr/videos/media_697a2e030ecc4_1769614851.mp4'
];

console.log('=== URL ACCESSIBILITY TEST ===\n');

urls.forEach(url => {
  https.get(url, (res) => {
    const filename = url.split('/').pop();
    console.log(`${filename}:`);
    console.log(`  Status: ${res.statusCode}`);
    console.log(`  Content-Type: ${res.headers['content-type']}`);
    console.log(`  Content-Length: ${res.headers['content-length']} bytes`);
    console.log('');
  }).on('error', (e) => {
    console.log(`${url}: ERROR - ${e.message}`);
  });
});

