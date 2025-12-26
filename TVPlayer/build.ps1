# TV Player Build Script (PowerShell)

Write-Host "🚀 Building Mağaza Panel TV Player..." -ForegroundColor Green

# Check Node version
$nodeVersion = node -v
Write-Host "Node version: $nodeVersion" -ForegroundColor Cyan

# Clean
Write-Host "🧹 Cleaning..." -ForegroundColor Yellow
Set-Location android
if (Test-Path ".\gradlew.bat") {
    .\gradlew.bat clean
} else {
    Write-Host "❌ gradlew.bat not found!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build Release APK
Write-Host "🔨 Building Release APK..." -ForegroundColor Yellow
Set-Location android
.\gradlew.bat assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    Write-Host "📱 APK location: android\$apkPath" -ForegroundColor Cyan
    
    # Copy to root for easy access
    $date = Get-Date -Format "yyyyMMdd"
    $targetApk = "..\MagazaPanel-TV-$date.apk"
    Copy-Item $apkPath $targetApk -Force
    Write-Host "📦 APK copied to: MagazaPanel-TV-$date.apk" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host "✨ Done!" -ForegroundColor Green
