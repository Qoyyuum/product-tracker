# PowerShell Docker test runner script for Windows

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Running Docker Compose Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

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

# Clean up any existing containers
Write-Host ""
Write-Host "Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.test.yml down -v 2>$null

# Run unit tests in containers
Write-Host ""
Write-Host "1. Running API Tests in Docker..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
docker-compose -f docker-compose.test.yml run --rm api-test
$ApiStatus = $LASTEXITCODE
Print-Status -ExitCode $ApiStatus -TestName "API Tests (Docker)"

Write-Host ""
Write-Host "2. Running Frontend Tests in Docker..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
docker-compose -f docker-compose.test.yml run --rm frontend-test
$FrontendStatus = $LASTEXITCODE
Print-Status -ExitCode $FrontendStatus -TestName "Frontend Tests (Docker)"

# Start services for integration tests
Write-Host ""
Write-Host "3. Starting services for integration tests..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
docker-compose -f docker-compose.test.yml up -d api frontend

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run integration tests
Write-Host ""
Write-Host "4. Running Integration Tests..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
docker-compose -f docker-compose.test.yml run --rm integration-test
$IntegrationStatus = $LASTEXITCODE
Print-Status -ExitCode $IntegrationStatus -TestName "Integration Tests (Docker)"

# Clean up
Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Yellow
docker-compose -f docker-compose.test.yml down -v

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Docker Test Suite Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Print-Status -ExitCode $ApiStatus -TestName "API Tests (Docker)"
Print-Status -ExitCode $FrontendStatus -TestName "Frontend Tests (Docker)"
Print-Status -ExitCode $IntegrationStatus -TestName "Integration Tests (Docker)"

Write-Host ""
if ($ApiStatus -eq 0 -and $FrontendStatus -eq 0 -and $IntegrationStatus -eq 0) {
    Write-Host "All Docker tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some Docker tests failed. Please check the output above." -ForegroundColor Red
    exit 1
}
