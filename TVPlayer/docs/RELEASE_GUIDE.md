# Release Guide (Mağaza Pano)

Bu proje için sürüm yükseltme + GitHub'a gönderme adımları.

## 1) Sürüm numarası

- `package.json` içindeki `version`
- `android/app/build.gradle` içindeki `versionCode` ve `versionName`

Örnek:
- `versionName`: `1.0.1`
- `versionCode`: 2

## 2) Changelog

`CHANGELOG.md` dosyasına yeni sürüm notlarını ekleyin.

## 3) GitHub'a gönderme (Windows / PowerShell)

> Git yolu PATH'te görünmüyorsa scriptteki varsayılan `GitExe` kullanılabilir.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\_git_actions.ps1 -RepoUrl https://github.com/unaluslusoy/magazatakipv3 -Tag v1.0.1 -Message "chore(release): v1.0.1"
```

Script aşağıdakileri yapar:
- `origin` remote'unu ayarlar
- değişiklik varsa commit atar
- tag oluşturur (yoksa)
- branch + tag pushlar

## Notlar

- Android 13+ cihazlarda boot sonrası otomatik açılma, cihazın üretici/kiosk politikalarına bağlı olabilir.
- Kiosk/Device Owner kurulumu yapılırsa en stabil sonuç alınır.

