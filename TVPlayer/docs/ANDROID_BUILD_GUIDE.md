# 🔧 Android Studio Kurulum ve APK Build Rehberi

## Adım 1: Android Studio Kurulumu

### 1.1 İndir
https://developer.android.com/studio

### 1.2 Kur
- Android Studio'yu çalıştır
- "Standard" kurulum seç
- Android SDK, Android SDK Platform, Android Virtual Device kur

### 1.3 SDK Manager Ayarları
1. Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
2. "SDK Platforms" sekmesi:
   - ✅ Android 13.0 (API 33)
   - ✅ Android 14.0 (API 34)
3. "SDK Tools" sekmesi:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Tools

### 1.4 Environment Variables Ayarla

```powershell
# Sistem değişkenlerine ekle
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk', 'User')
[System.Environment]::SetEnvironmentVariable('Path', $env:Path + ';C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools', 'User')
```

## Adım 2: JDK 17 Kurulumu

### 2.1 İndir
https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
veya
https://adoptium.net/temurin/releases/?version=17

### 2.2 JAVA_HOME Ayarla
```powershell
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Java\jdk-17', 'User')
```

## Adım 3: Build APK

### 3.1 Terminali Yeniden Başlat
Environment variables yüklenmesi için PowerShell'i kapat ve tekrar aç.

### 3.2 Gradle ile Build

```powershell
cd C:\uygulamalar\MagazaPanel\TVPlayer\android
.\gradlew assembleDebug
```

### 3.3 APK Konumu
```
TVPlayer\android\app\build\outputs\apk\debug\app-debug.apk
```

## ⚡ HIZLI ÇÖZÜM (Android Studio İstemiyorsanız)

### Çözüm 1: Scrcpy ile Canlı Test
```powershell
# USB ile bağlı cihazda çalışan uygulamayı PC'den göster
winget install Genymobile.scrcpy
npx react-native run-android
```

### Çözüm 2: Wireless Debugging (Android 11+)
```powershell
# Tablet ve PC aynı WiFi'de olmalı
adb tcpip 5555
adb connect TABLET_IP:5555
npx react-native run-android
```

### Çözüm 3: Online Build Service (ÜCRETSİZ)
https://www.apponline.app/
- Kaynak kodları zip'le
- Upload et
- APK indir

## 🚀 TAVSİYE: Şimdilik En Basit Yöntem

1. **Android Studio İndir ve Kur** (30 dk)
   - https://developer.android.com/studio
   - Varsayılan ayarlarla ilerle

2. **PowerShell'i Yönetici Olarak Aç**

3. **Environment Kontrol**
   ```powershell
   $env:ANDROID_HOME
   $env:JAVA_HOME
   adb version
   ```

4. **USB Debugging Aç** (Tablet)
   - Ayarlar → Telefon Hakkında → Yapı Numarası (7 kez tıkla)
   - Ayarlar → Geliştirici Seçenekleri → USB Debugging (Aç)

5. **Tableti USB ile Bağla**
   ```powershell
   adb devices
   # Tablet listede görünmeli
   ```

6. **Uygulamayı Çalıştır**
   ```powershell
   cd C:\uygulamalar\MagazaPanel\TVPlayer
   npx react-native run-android
   ```

## 📱 Manuel APK Yükleme (Build Sonrası)

1. APK'yı USB belleğe kopyala
2. Tablette Dosya Yöneticisi aç
3. USB'deki APK'yı aç
4. "Bilinmeyen Kaynaklar" iznini ver
5. Kur

## ⏱️ Tahmini Süreler

- Android Studio Kurulumu: 30 dakika
- İlk Build: 15-20 dakika
- Sonraki Build'ler: 2-3 dakika
- APK Manuel Yükleme: 2 dakika

## 🐛 Sık Karşılaşılan Sorunlar

### "SDK location not found"
```powershell
# local.properties oluştur
cd android
echo "sdk.dir=C:\\Users\\USERNAME\\AppData\\Local\\Android\\Sdk" > local.properties
```

### "Command not found: gradlew"
```powershell
# Gradle wrapper yeniden oluştur
cd android
gradle wrapper
```

### "Unable to load script"
```powershell
# Metro bundler başlat
npm start
# Yeni terminalde
npx react-native run-android
```

---

**ŞU AN YAPMANIZ GEREKEN:**

1. Android Studio'yu indir: https://developer.android.com/studio
2. Kur (varsayılan ayarlar)
3. Bana "kurdum" de, devam edelim! 🚀
