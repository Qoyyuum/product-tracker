# PowerShell Docker test runner script for Windows

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Running Docker Compose Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

function Write-TestStatus {
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
Write-TestStatus -ExitCode $ApiStatus -TestName "API Tests (Docker)"

Write-Host ""
Write-Host "2. Running Frontend Tests in Docker..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
docker-compose -f docker-compose.test.yml run --rm frontend-test
$FrontendStatus = $LASTEXITCODE
Write-TestStatus -ExitCode $FrontendStatus -TestName "Frontend Tests (Docker)"

# Start services for integration tests
Write-Host ""
Write-Host "3. Starting services for integration tests..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
docker-compose -f docker-compose.test.yml up -d api frontend
$UpStatus = $LASTEXITCODE

if ($UpStatus -ne 0) {
    Write-Host "Failed to start services" -ForegroundColor Red
    docker-compose -f docker-compose.test.yml down -v
    exit 1
}

# Wait for services to be ready with polling
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
$timeout = 60
$elapsed = 0
$interval = 2

while ($elapsed -lt $timeout) {
    $apiHealth = docker inspect --format='{{.State.Health.Status}}' product-tracker-api-integration 2>$null
    $frontendHealth = docker inspect --format='{{.State.Health.Status}}' product-tracker-frontend-integration 2>$null
    
    if ($apiHealth -eq "healthy" -and $frontendHealth -eq "healthy") {
        Write-Host "Services are healthy!" -ForegroundColor Green
        break
    }
    
    Start-Sleep -Seconds $interval
    $elapsed += $interval
    Write-Host "Waiting... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
}

if ($elapsed -ge $timeout) {
    Write-Host "Timeout waiting for services to be healthy" -ForegroundColor Red
    docker-compose -f docker-compose.test.yml logs api
    docker-compose -f docker-compose.test.yml logs frontend
    docker-compose -f docker-compose.test.yml down -v
    exit 1
}

# Run integration tests
Write-Host ""
Write-Host "4. Running Integration Tests..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
docker-compose -f docker-compose.test.yml run --rm integration-test
$IntegrationStatus = $LASTEXITCODE
Write-TestStatus -ExitCode $IntegrationStatus -TestName "Integration Tests (Docker)"

# Clean up
Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Yellow
docker-compose -f docker-compose.test.yml down -v

# Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Docker Test Suite Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-TestStatus -ExitCode $ApiStatus -TestName "API Tests (Docker)"
Write-TestStatus -ExitCode $FrontendStatus -TestName "Frontend Tests (Docker)"
Write-TestStatus -ExitCode $IntegrationStatus -TestName "Integration Tests (Docker)"

Write-Host ""
if ($ApiStatus -eq 0 -and $FrontendStatus -eq 0 -and $IntegrationStatus -eq 0) {
    Write-Host "All Docker tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some Docker tests failed. Please check the output above." -ForegroundColor Red
    exit 1
}
