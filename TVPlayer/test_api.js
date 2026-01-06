const https = require('https');

// Önce login yap, sonra contents çek
function login(callback) {
  const data = JSON.stringify({ device_code: 'MALTEPE-001' });

  const options = {
    hostname: 'mtapi.magazatakip.com.tr',
    path: '/api/auth/device-login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(body);
        if (json.success && json.data?.token) {
          console.log('Login başarılı!');
          callback(json.data.token);
        } else {
          console.log('Login hatası:', json.message || body);
          callback(null);
        }
      } catch (e) {
        console.log('Login parse hatası:', e.message);
        console.log('Raw:', body);
        callback(null);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Login request error:', e.message);
    callback(null);
  });

  req.write(data);
  req.end();
}

function getContents(token) {
  if (!token) {
    console.log('Token yok, çıkılıyor');
    return;
  }

  const options = {
    hostname: 'mtapi.magazatakip.com.tr',
    path: '/api/contents',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const contents = json.data?.items?.data || json.data || [];

        console.log('\n=== API YANITI ===');
        console.log('Toplam içerik:', contents.length);

        // Ticker tipindeki içerikleri bul
        const tickers = contents.filter(c => c.type === 'ticker');
        console.log('\n=== TICKER İÇERİKLERİ ===');
        tickers.forEach(t => {
          console.log('\n--- ID:', t.id, '---');
          console.log('Name:', t.name);
          console.log('Title:', t.title);
          console.log('Type:', t.type);
          console.log('ticker_text:', t.ticker_text);
          console.log('Description:', t.description?.substring(0, 200));
        });

        // Tüm içerikleri göster
        console.log('\n=== TÜM İÇERİKLER ===');
        contents.forEach(c => {
          console.log(`\nID: ${c.id}, Type: ${c.type}, Name: ${c.name}`);
          if (c.ticker_text) {
            console.log('  ticker_text:', c.ticker_text.substring(0, 100));
          }
        });
      } catch (e) {
        console.error('Parse error:', e.message);
        console.log('Raw data:', data.substring(0, 500));
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.end();
}

// Çalıştır
console.log('API Test Başlıyor...\n');
login(getContents);
