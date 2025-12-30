$ErrorActionPreference = 'Stop'
$git = "C:\Program Files\Git\cmd\git.exe"
Set-Location "C:\uygulamalar\MagazaPanel\TVPlayer"

# Ensure repo
& $git rev-parse --is-inside-work-tree | Out-Null

# Configure remote
$remoteUrl = "https://github.com/unaluslusoy/magazatakipv3.git"
$hasOrigin = $false
try {
  $rem = & $git remote
  if ($rem -match "origin") { $hasOrigin = $true }
} catch {}

if ($hasOrigin) {
  & $git remote set-url origin $remoteUrl
} else {
  & $git remote add origin $remoteUrl
}

# Stage and commit
& $git add -A
$hasChanges = $true
try {
  $status = & $git status --porcelain
  if ([string]::IsNullOrWhiteSpace($status)) { $hasChanges = $false }
} catch {}

if ($hasChanges) {
  & $git commit -m "chore(release): v1.0.1"
}

# Tag
$tag = "v1.0.1"
$tagExists = $false
try {
  $tags = & $git tag --list $tag
  if ($tags -match $tag) { $tagExists = $true }
} catch {}

if (-not $tagExists) {
  & $git tag -a $tag -m "v1.0.1"
}

# Push
& $git push -u origin HEAD
& $git push origin --tags

# Write summary
$summary = @()
$summary += "OK: pushed to $remoteUrl"
$summary += "branch: $(& $git branch --show-current)"
$summary += "head: $(& $git rev-parse --short HEAD)"
$summary += "tag: $tag"
$summary | Out-File -Encoding utf8 .\_git_push_result.txt

