param(
  [string]$RepoName = "",
  [string]$Description = "",
  [switch]$Private
)

# git yüklü mü kontrol et
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git bulunamadı. Lütfen git'i yükleyin."
  exit 1
}

# RepoName verilmediyse mevcut klasör adını kullan (boşlukları tire ile değiştir)
if ([string]::IsNullOrWhiteSpace($RepoName)) {
  $RepoName = Split-Path -Leaf (Get-Location)
  $RepoName = $RepoName -replace '\s+','-'
}

$root = "C:\uygulamalar\MagazaPanel\TVPlayer"
Push-Location -LiteralPath $root

# Başlat (varsa atla)
if (-not (Test-Path ".git")) {
  git init
}

# Tüm dosyaları ekle
git add -A

# Değişiklik varsa commit et
$porcelain = git status --porcelain
if (-not [string]::IsNullOrEmpty($porcelain)) {
  git commit -m "Initial commit"
}

# Ana dalı main olarak ayarla
git branch -M main

# gh CLI varsa kullan
if (Get-Command gh -ErrorAction SilentlyContinue) {
  $vis = if ($Private) { "--private" } else { "--public" }
  gh repo create $RepoName $vis --source=. --remote=origin --push --description $Description --confirm
  Write-Output "Pushed via gh CLI."
  Pop-Location; exit 0
}

# gh yoksa GITHUB_TOKEN ile GitHub API kullan
if (-not $env:GITHUB_TOKEN) {
  Write-Error "gh CLI yok ve GITHUB_TOKEN ortam değişkeni bulunamadı. Lütfen gh yükleyin veya GITHUB_TOKEN ayarlayın."
  Pop-Location; exit 1
}

$body = @{ name = $RepoName; description = $Description; private = [bool]$Private } | ConvertTo-Json
try {
  $resp = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method POST -Headers @{ Authorization = "token $env:GITHUB_TOKEN"; "User-Agent" = "PowerShell" } -Body $body -ContentType "application/json"
} catch {
  Write-Error "GitHub API isteği başarısız: $($_.Exception.Message)"
  Pop-Location; exit 1
}

$remoteUrl = $resp.clone_url
# Geçici tokenli remote ile push et, sonra tokeni temizle
$remoteWithToken = $remoteUrl -replace '^https://', "https://$($env:GITHUB_TOKEN)@"

# Eğer origin varsa tokenli URL ile güncelle, yoksa ekle
$existing = git remote get-url origin 2>$null
if ($existing) {
  git remote set-url origin $remoteWithToken
} else {
  git remote add origin $remoteWithToken
}

try {
  git push -u origin main
} catch {
  Write-Error "Push başarısız: $($_.Exception.Message)"
  Pop-Location; exit 1
}

# remote URL'den tokeni kaldır
git remote set-url origin $remoteUrl

Write-Output "Repo oluşturuldu ve itildi: $remoteUrl"
Pop-Location
