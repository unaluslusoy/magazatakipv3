@echo off
echo === ADB Install Script ===
echo.

set ADB=C:\Users\unal\AppData\Local\Android\Sdk\platform-tools\adb.exe
set APK=C:\uygulamalar\MagazaPanel\TVPlayer\android\app\build\outputs\apk\release\app-release.apk

echo Checking ADB...
%ADB% version

echo.
echo Listing devices...
%ADB% devices -l

echo.
echo Installing APK...
%ADB% install -r "%APK%"

echo.
echo === Done ===

