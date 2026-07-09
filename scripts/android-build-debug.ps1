param(
    [string] $SdkRoot = "",
    [string] $JavaHome = "",
    [switch] $AcceptAndroidSdkLicenses,
    [switch] $SkipPnpmInstall,
    [string] $CommandLineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-14742923_latest.zip"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$RepoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$ClientRoot = Join-Path $RepoRoot "apps/client"
$AndroidRoot = Join-Path $ClientRoot "android"

function Get-Sha256Hash {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    $Stream = [System.IO.File]::OpenRead($Path)
    try {
        $Sha256 = [System.Security.Cryptography.SHA256]::Create()
        try {
            $Bytes = $Sha256.ComputeHash($Stream)
            return [System.BitConverter]::ToString($Bytes).Replace("-", "")
        } finally {
            $Sha256.Dispose()
        }
    } finally {
        $Stream.Dispose()
    }
}

function Assert-LastExitCode {
    param(
        [Parameter(Mandatory = $true)]
        [string] $CommandName
    )

    if ($LASTEXITCODE -ne 0) {
        throw "$CommandName failed with exit code $LASTEXITCODE."
    }
}

if ($SdkRoot -eq "") {
    $SdkRoot = if ($env:ANDROID_HOME) {
        $env:ANDROID_HOME
    } elseif ($env:ANDROID_SDK_ROOT) {
        $env:ANDROID_SDK_ROOT
    } else {
        Join-Path $RepoRoot ".android-sdk"
    }
}

if ($JavaHome -ne "") {
    $env:JAVA_HOME = $JavaHome
} elseif ($env:JAVA_HOME -and -not (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME "bin/java.exe"))) {
    $javaCommand = Get-Command java -ErrorAction SilentlyContinue
    if ($javaCommand) {
        $env:JAVA_HOME = Split-Path -Parent (Split-Path -Parent $javaCommand.Source)
    }
}

if (-not $env:JAVA_HOME -or -not (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME "bin/java.exe"))) {
    throw "Java 17+ is required. Install a JDK and set JAVA_HOME, or pass -JavaHome C:\path\to\jdk."
}

$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot
$env:GRADLE_USER_HOME = Join-Path $RepoRoot ".gradle-cache"
$env:PNPM_HOME = if ($env:PNPM_HOME) { $env:PNPM_HOME } else { Join-Path $RepoRoot ".pnpm-home" }
$env:COREPACK_HOME = if ($env:COREPACK_HOME) { $env:COREPACK_HOME } else { Join-Path $RepoRoot ".corepack" }
$env:npm_config_cache = if ($env:npm_config_cache) { $env:npm_config_cache } else { Join-Path $RepoRoot ".npm-cache" }
$env:TMP = if ($env:TMP) { $env:TMP } else { Join-Path $RepoRoot ".tmp" }
$env:TEMP = if ($env:TEMP) { $env:TEMP } else { Join-Path $RepoRoot ".tmp" }
$PnpmStoreDir = Join-Path $RepoRoot ".pnpm-store"

New-Item -ItemType Directory -Force $env:PNPM_HOME, $env:COREPACK_HOME, $env:npm_config_cache, $env:TMP, $PnpmStoreDir | Out-Null

$SdkManager = Join-Path $SdkRoot "cmdline-tools/latest/bin/sdkmanager.bat"

if (-not (Test-Path -LiteralPath $SdkManager)) {
    if (-not $AcceptAndroidSdkLicenses) {
        throw "Android SDK was not found. Re-run with -AcceptAndroidSdkLicenses to download command-line tools and install the required SDK packages."
    }

    New-Item -ItemType Directory -Force $SdkRoot | Out-Null
    $ToolsZip = Join-Path $SdkRoot "commandlinetools-win.zip"
    $ToolsTemp = Join-Path $SdkRoot "cmdline-tools-tmp"

    Remove-Item -LiteralPath $ToolsZip -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $ToolsTemp -Recurse -Force -ErrorAction SilentlyContinue
    Invoke-WebRequest -Uri $CommandLineToolsUrl -OutFile $ToolsZip
    Expand-Archive -Path $ToolsZip -DestinationPath $ToolsTemp -Force
    New-Item -ItemType Directory -Force (Join-Path $SdkRoot "cmdline-tools") | Out-Null
    Move-Item -LiteralPath (Join-Path $ToolsTemp "cmdline-tools") -Destination (Join-Path $SdkRoot "cmdline-tools/latest")
    Remove-Item -LiteralPath $ToolsZip -Force
    Remove-Item -LiteralPath $ToolsTemp -Recurse -Force
}

if ($AcceptAndroidSdkLicenses) {
    $answers = (1..30 | ForEach-Object { "y" }) -join "`n"
    $answers | & $SdkManager --licenses
    Assert-LastExitCode -CommandName "sdkmanager --licenses"
}

& $SdkManager --install "platform-tools" "platforms;android-36" "build-tools;36.0.0" "build-tools;35.0.0"
Assert-LastExitCode -CommandName "sdkmanager --install"

Push-Location $RepoRoot
try {
    $ModulesFile = Join-Path $RepoRoot "node_modules/.modules.yaml"
    if (-not $SkipPnpmInstall -and -not (Test-Path -LiteralPath $ModulesFile)) {
        pnpm install --frozen-lockfile --store-dir $PnpmStoreDir
        Assert-LastExitCode -CommandName "pnpm install"
    }

    pnpm --filter "@packwise/client" build
    Assert-LastExitCode -CommandName "pnpm client build"
} finally {
    Pop-Location
}

Push-Location $ClientRoot
try {
    pnpm exec cap sync android
    Assert-LastExitCode -CommandName "Capacitor Android sync"
} finally {
    Pop-Location
}

Push-Location $AndroidRoot
try {
    & ".\gradlew.bat" assembleDebug --no-daemon
    Assert-LastExitCode -CommandName "Gradle debug APK build"
} finally {
    Pop-Location
}

$ApkPath = Join-Path $AndroidRoot "app/build/outputs/apk/debug/app-debug.apk"
$Apk = Get-Item -LiteralPath $ApkPath
$Hash = Get-Sha256Hash -Path $ApkPath

Write-Host ""
Write-Host "APK generated:"
Write-Host $Apk.FullName
Write-Host "Size: $($Apk.Length) bytes"
Write-Host "SHA256: $Hash"
