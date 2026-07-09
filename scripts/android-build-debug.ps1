param(
    [string] $SdkRoot = "",
    [string] $JavaHome = "",
    [switch] $AcceptAndroidSdkLicenses,
    [string] $CommandLineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-14742923_latest.zip"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$ClientRoot = Join-Path $RepoRoot "apps/client"
$AndroidRoot = Join-Path $ClientRoot "android"

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

$SdkManager = Join-Path $SdkRoot "cmdline-tools/latest/bin/sdkmanager.bat"

if (-not (Test-Path -LiteralPath $SdkManager)) {
    if (-not $AcceptAndroidSdkLicenses) {
        throw "Android SDK was not found. Re-run with -AcceptAndroidSdkLicenses to download command-line tools and install the required SDK packages."
    }

    New-Item -ItemType Directory -Force $SdkRoot | Out-Null
    $ToolsZip = Join-Path $SdkRoot "commandlinetools-win.zip"
    $ToolsTemp = Join-Path $SdkRoot "cmdline-tools-tmp"

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
}

& $SdkManager --install "platform-tools" "platforms;android-36" "build-tools;36.0.0"

Push-Location $RepoRoot
try {
    pnpm --filter "@packwise/client" build
} finally {
    Pop-Location
}

Push-Location $ClientRoot
try {
    pnpm exec cap sync android
} finally {
    Pop-Location
}

Push-Location $AndroidRoot
try {
    & ".\gradlew.bat" assembleDebug --no-daemon
} finally {
    Pop-Location
}

$ApkPath = Join-Path $AndroidRoot "app/build/outputs/apk/debug/app-debug.apk"
$Apk = Get-Item -LiteralPath $ApkPath
$Hash = Get-FileHash -LiteralPath $ApkPath -Algorithm SHA256

Write-Host ""
Write-Host "APK generated:"
Write-Host $Apk.FullName
Write-Host "Size: $($Apk.Length) bytes"
Write-Host "SHA256: $($Hash.Hash)"
