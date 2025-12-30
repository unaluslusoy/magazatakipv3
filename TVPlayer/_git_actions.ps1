param(
  [Parameter(Mandatory = $true)]
  [string]$RepoUrl,

  [string]$Tag = "v1.0.1",

  [string]$Message = "chore(release): v1.0.1",

  [string]$GitExe = "C:\Program Files\Git\cmd\git.exe",

  [string]$WorkDir = "C:\uygulamalar\MagazaPanel\TVPlayer"
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Set-Location $WorkDir

# Ensure git exists
if (-not (Test-Path $GitExe)) {
  throw "Git bulunamadı: $GitExe"
}

# Ensure repo
& $GitExe rev-parse --is-inside-work-tree | Out-Null

# Normalize repo url
if ($RepoUrl.EndsWith('.git') -eq $false) {
  $RepoUrl = "$RepoUrl.git"
}

# Configure remote
$hasOrigin = $false
try {
  $rem = & $GitExe remote
  if ($rem -match "(?m)^origin$") { $hasOrigin = $true }
} catch {
  # ignore
}

if ($hasOrigin) {
  & $GitExe remote set-url origin $RepoUrl
} else {
  & $GitExe remote add origin $RepoUrl
}

# Stage and commit
& $GitExe add -A

$status = & $GitExe status --porcelain
if (-not [string]::IsNullOrWhiteSpace($status)) {
  & $GitExe commit -m $Message
}

# Tag
$tagExists = $false
try {
  $tags = & $GitExe tag --list $Tag
  if ($tags -match [regex]::Escape($Tag)) { $tagExists = $true }
} catch {
  # ignore
}

if (-not $tagExists) {
  & $GitExe tag -a $Tag -m $Tag
}

# Push
& $GitExe push -u origin HEAD
& $GitExe push origin --tags

# Write summary (UTF-8)
$summary = @(
  "OK: pushed to $RepoUrl",
  ("branch: " + (& $GitExe branch --show-current)),
  ("head: " + (& $GitExe rev-parse --short HEAD)),
  "tag: $Tag"
)
$summary | Out-File -Encoding utf8 .\_git_push_result.txt
