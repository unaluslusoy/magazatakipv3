# 📱 TV Player Test Kurulum Kılavuzu

## Hızlı Kurulum (Tablet Test)

### Yöntem 1: Direct APK Yükleme (Önerilen - En Kolay)

1. **Build Klasörünü Hazırlayın**
   ```
   TVPlayer/
   └── build/
       └── MagazaPanel-TV.apk  (manuel oluşturulacak)
   ```

2. **APK'yı USB'ye Kopyalayın**
   - APK dosyasını USB belleğe kopyalayın
   - USB'yi tablete takın

3. **Tablette Yükleme**
   - Dosya Yöneticisi açın
   - USB içindeki APK'yı bulun
   - "Bilinmeyen Kaynaklar" iznini verin
   - Yükleyin

### Yöntem 2: React Native ile Doğrudan Yükleme

**Gereksinimler:**
- Android Studio
- USB Debugging aktif tablet
- USB kablo

**Adımlar:**

1. **USB Debugging Aktif Edin** (Tablet)
   - Ayarlar → Hakkında → Yapı Numarası (7 kez tıklayın)
   - Ayarlar → Geliştirici Seçenekleri → USB Debugging (Açın)

2. **Tableti Bağlayın**
   ```powershell
   # ADB kurulumu gerekiyor
   adb devices
   ```

3. **Debug APK Yükleyin**
   ```powershell
   cd C:\uygulamalar\MagazaPanel\TVPlayer
   npx react-native run-android
   ```

### Yöntem 3: Manuel APK Build (Şu An İçin)

Android Studio olmadan, metro bundler ile:

1. **Metro Bundler Başlatın** (Terminal 1)
   ```powershell
   cd C:\uygulamalar\MagazaPanel\TVPlayer
   npm start
   ```

2. **Bundle Oluşturun** (Terminal 2)
   ```powershell
   cd C:\uygulamalar\MagazaPanel\TVPlayer\android
   mkdir app\src\main\assets
   npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
   ```

## 🔧 Şu Anki Durum

### Tamamlananlar
✅ Package.json hazır
✅ Dependencies yüklendi (979 paket)
✅ TypeScript yapılandırması
✅ Tüm kaynak kodlar hazır
✅ Android manifest hazır
✅ Gradle yapılandırması mevcut

### Eksikler (Build İçin)
- [ ] gradlew executable dosyaları
- [ ] Android SDK yolu
- [ ] Debug keystore

## ⚡ Hızlı Test (Geliştirme Modu)

### Expo Go ile Test (Alternatif - Hızlı)

Eğer React Native tam build karmaşık geliyorsa:

1. **Expo'ya Çevir**
   ```powershell
   npx expo init --template bare-minimum
   ```

2. **Expo Go App İndir** (Tablet)
   - Play Store'dan "Expo Go" indir

3. **QR Code ile Başlat**
   ```powershell
   npm start
   ```

## 📋 Test Senaryoları

### 1. İlk Giriş
- [ ] Cihaz kodu girişi çalışıyor mu?
- [ ] Backend bağlantısı başarılı mı?
- [ ] Token kaydediliyor mu?

### 2. Sync Testi
- [ ] İlk senkronizasyon çalışıyor mu?
- [ ] Playlist indiriliyor mu?
- [ ] Medya dosyaları önbelleğe alınıyor mu?

### 3. Player Testi
- [ ] Video oynatma çalışıyor mu?
- [ ] Görsel gösterimi doğru mu?
- [ ] Otomatik ilerleme yapıyor mu?
- [ ] Zamanlama çalışıyor mu?

### 4. Offline Testi
- [ ] İnternetsiz çalışıyor mu?
- [ ] Önbellekten oynuyor mu?
- [ ] İnternet gelince sync yapıyor mu?

## 🚨 Sorun Giderme

### "Command not found" Hataları
```powershell
# Node modules path ekle
$env:Path += ";.\node_modules\.bin"
```

### "ENOENT package.json" Hatası
```powershell
# Doğru dizinde olduğunuzdan emin olun
cd C:\uygulamalar\MagazaPanel\TVPlayer
Get-Location  # Kontrol et
```

### Build Hataları
```powershell
# Cache temizle
npm start -- --reset-cache

# Node modules sil ve tekrar yükle
Remove-Item node_modules -Recurse -Force
npm install --legacy-peer-deps
```

## 🎯 Sonraki Adımlar

1. **Android Studio Kur** (Uzun vadeli)
   - JDK 17+
   - Android SDK
   - ADB tools

2. **Release APK Build**
   ```powershell
   cd android
   ./gradlew assembleRelease
   ```

3. **APK İmzalama**
   - Keystore oluştur
   - Release APK imzala
   - Play Store'a hazır hale getir

## 📞 Hızlı Destek Komutları

```powershell
# Proje durumu
npm run android -- --info

# Log izleme (cihaz bağlıysa)
npx react-native log-android

# Port kontrolü
netstat -ano | findstr :8081
```

---

**Not:** En hızlı test yöntemi şimdilik USB üzerinden APK yüklemektir. Android Studio kurulumu zaman alacaktır.
