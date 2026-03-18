# PowerShell test runner script for Windows

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Running Product Tracker Test Suite" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$OverallStatus = 0

function Print-Status {
    param (
        [int]$ExitCode,
        [string]$TestName
    )
    if ($ExitCode -eq 0) {
        Write-Host "✓ $TestName" -ForegroundColor Green
    } else {
        Write-Host "✗ $TestName" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "1. Running API Unit Tests..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Push-Location api
npm test
$ApiStatus = $LASTEXITCODE
Print-Status -ExitCode $ApiStatus -TestName "API Unit Tests"
Pop-Location

if ($ApiStatus -ne 0) {
    $OverallStatus = 1
}

Write-Host ""
Write-Host "2. Running Frontend Unit Tests..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Push-Location frontend
npm test
$FrontendStatus = $LASTEXITCODE
Print-Status -ExitCode $FrontendStatus -TestName "Frontend Unit Tests"
Pop-Location

if ($FrontendStatus -ne 0) {
    $OverallStatus = 1
}

Write-Host ""
Write-Host "3. Running TypeScript Type Checking..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Push-Location api
npm run typecheck
$TypeCheckStatus = $LASTEXITCODE
Print-Status -ExitCode $TypeCheckStatus -TestName "TypeScript Type Checking"
Pop-Location

if ($TypeCheckStatus -ne 0) {
    $OverallStatus = 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test Suite Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Print-Status -ExitCode $ApiStatus -TestName "API Unit Tests"
Print-Status -ExitCode $FrontendStatus -TestName "Frontend Unit Tests"
Print-Status -ExitCode $TypeCheckStatus -TestName "TypeScript Type Checking"

Write-Host ""
if ($OverallStatus -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Please check the output above." -ForegroundColor Red
}

exit $OverallStatus
