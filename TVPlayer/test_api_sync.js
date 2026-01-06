const https = require('https');

console.log('API Test Başlıyor...');

// Senkron wait
function doRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data, error: e.message });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    // 1. Login
    console.log('\n1. Login yapılıyor...');
    const loginData = JSON.stringify({ device_code: 'MALTEPE-001' });
    const loginResult = await doRequest({
      hostname: 'mtapi.magazatakip.com.tr',
      path: '/api/auth/device-login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, loginData);

    console.log('Login sonucu:', loginResult.success ? 'Başarılı' : 'Başarısız');

    if (!loginResult.success || !loginResult.data?.token) {
      console.log('Login hatası:', loginResult.message || JSON.stringify(loginResult));
      return;
    }

    const token = loginResult.data.token;
    console.log('Token alındı:', token.substring(0, 30) + '...');

    // 2. Contents çek
    console.log('\n2. İçerikler çekiliyor...');
    const contentsResult = await doRequest({
      hostname: 'mtapi.magazatakip.com.tr',
      path: '/api/contents',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });

    if (!contentsResult.success) {
      console.log('Contents hatası:', contentsResult.message || JSON.stringify(contentsResult));
      return;
    }

    const contents = contentsResult.data?.items?.data || contentsResult.data || [];
    console.log('Toplam içerik:', contents.length);

    // Ticker içerikleri
    console.log('\n=== TICKER İÇERİKLERİ ===');
    contents.filter(c => c.type === 'ticker').forEach(t => {
      console.log('\n--- ID:', t.id, '---');
      console.log('Name:', t.name);
      console.log('Type:', t.type);
      console.log('ticker_text:', t.ticker_text || '(BOŞ)');
      console.log('Description:', t.description ? t.description.substring(0, 100) : '(BOŞ)');
    });

    // Tüm içerikleri özetle
    console.log('\n=== TÜM İÇERİKLER ===');
    contents.forEach(c => {
      console.log(`ID: ${c.id}, Type: ${c.type}, Name: ${c.name}`);
    });

  } catch (err) {
    console.error('Hata:', err.message);
  }
}

main().then(() => console.log('\nTest tamamlandı.'));

