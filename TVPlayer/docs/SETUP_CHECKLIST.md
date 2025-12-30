# 🚀 Android Studio Kurulum Kontrol Listesi

## ✅ Kurulum Adımları

### 1. Android Studio İndirme
- [ ] https://developer.android.com/studio adresine git
- [ ] "Download Android Studio" butonuna tıkla
- [ ] Lisans sözleşmesini kabul et
- [ ] İndirmeyi başlat (~1.1 GB)

### 2. Kurulum
- [ ] İndirilen .exe dosyasını çalıştır
- [ ] "Next" ile devam et
- [ ] Kurulum türü: **Standard** seç
- [ ] Tema seç (Light/Dark - önemli değil)
- [ ] Bileşenleri kontrol et:
  - [x] Android SDK
  - [x] Android SDK Platform
  - [x] Android Virtual Device (AVD)
- [ ] Disk alanını kontrol et (~10 GB gerekli)
- [ ] "Finish" ile bitir
- [ ] İlk açılışta component download'ları bekle

### 3. İlk Açılış SDK Ayarları
- [ ] Android Studio açıldı
- [ ] Configure → SDK Manager
- [ ] SDK Platforms sekmesi:
  - [x] Android 14.0 (API 34) ✓
  - [x] Android 13.0 (API 33) ✓
- [ ] SDK Tools sekmesi:
  - [x] Android SDK Build-Tools 34
  - [x] Android SDK Platform-Tools
  - [x] Android Emulator
- [ ] "Apply" → "OK"

### 4. Environment Variables (Kurulum Sonrası)

Kurulum tamamlandıktan sonra çalıştıracağız:

```powershell
# SDK yolunu ayarla (USERNAME'i kendi kullanıcı adınızla değiştirin)
[System.Environment]::SetEnvironmentVariable(
    'ANDROID_HOME',
    'C:\Users\USERNAME\AppData\Local\Android\Sdk',
    'User'
)

# Path'e platform-tools ekle
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$newPath = $currentPath + ';C:\Users\USERNAME\AppData\Local\Android\Sdk\platform-tools'
[System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
```

## 📝 Kurulum Sonrası Test

```powershell
# PowerShell'i KAPAT ve YENİDEN AÇ
# Sonra şunları test et:

$env:ANDROID_HOME  # SDK yolunu göstermeli
adb version        # ADB versiyonunu göstermeli
```

## ⚠️ Sık Sorunlar

### "SDK location not found"
→ `local.properties` dosyasını oluştur (otomatik yapacağız)

### "adb command not found"
→ PowerShell'i kapat ve tekrar aç (environment variables yenilenmeli)

### "Java version issue"
→ JDK 17 gerekiyor, Android Studio ile gelir

---

## 🎯 Sonraki Adım

Kurulum bittiğinde bana **"kurdum"** yaz!

Ardından:
1. Environment variables ayarlayacağız
2. Tableti bağlayacağız
3. APK build edeceğiz
4. Test edeceğiz! 🚀
