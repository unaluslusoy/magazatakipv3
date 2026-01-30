@echo off
cd /d C:\Users\unal\AppData\Local\Android\Sdk\platform-tools
echo === ADB Cihaz Listesi ===
adb devices -l
echo.
echo === APK Yukleniyor ===
adb install -r "C:\uygulamalar\MagazaPanel\TVPlayer\android\app\build\outputs\apk\release\app-release.apk"
echo.
echo === Islem Tamamlandi ===
pause

