#!/bin/bash

echo "=========================================="
echo "Running Docker Compose Tests"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# Clean up any existing containers
echo ""
echo "Cleaning up existing containers..."
docker-compose -f docker-compose.test.yml down -v 2>/dev/null

# Run unit tests in containers
echo ""
echo "1. Running API Tests in Docker..."
echo "=========================================="
docker-compose -f docker-compose.test.yml run --rm api-test
API_STATUS=$?
print_status $API_STATUS "API Tests (Docker)"

echo ""
echo "2. Running Frontend Tests in Docker..."
echo "=========================================="
docker-compose -f docker-compose.test.yml run --rm frontend-test
FRONTEND_STATUS=$?
print_status $FRONTEND_STATUS "Frontend Tests (Docker)"

# Start services for integration tests
echo ""
echo "3. Starting services for integration tests..."
echo "=========================================="
docker-compose -f docker-compose.test.yml up -d api frontend
UP_STATUS=$?

if [ $UP_STATUS -ne 0 ]; then
    echo -e "${RED}Failed to start services${NC}"
    docker-compose -f docker-compose.test.yml down -v
    exit 1
fi

# Wait for services to be ready with polling
echo "Waiting for services to be ready..."
TIMEOUT=60
ELAPSED=0
INTERVAL=2

while [ $ELAPSED -lt $TIMEOUT ]; do
    API_HEALTH=$(docker-compose -f docker-compose.test.yml ps api 2>/dev/null | grep -c "healthy")
    FRONTEND_HEALTH=$(docker-compose -f docker-compose.test.yml ps frontend 2>/dev/null | grep -c "healthy")
    
    if [ $API_HEALTH -gt 0 ] && [ $FRONTEND_HEALTH -gt 0 ]; then
        echo -e "${GREEN}Services are healthy!${NC}"
        break
    fi
    
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
    echo "Waiting... ($ELAPSED/$TIMEOUT seconds)"
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    echo -e "${RED}Timeout waiting for services to be healthy${NC}"
    docker-compose -f docker-compose.test.yml logs api
    docker-compose -f docker-compose.test.yml logs frontend
    docker-compose -f docker-compose.test.yml down -v
    exit 1
fi

# Run integration tests
echo ""
echo "4. Running Integration Tests..."
echo "=========================================="
docker-compose -f docker-compose.test.yml run --rm integration-test
INTEGRATION_STATUS=$?
print_status $INTEGRATION_STATUS "Integration Tests (Docker)"

# Clean up
echo ""
echo "Cleaning up..."
docker-compose -f docker-compose.test.yml down -v

# Summary
echo ""
echo "=========================================="
echo "Docker Test Suite Summary"
echo "=========================================="
print_status $API_STATUS "API Tests (Docker)"
print_status $FRONTEND_STATUS "Frontend Tests (Docker)"
print_status $INTEGRATION_STATUS "Integration Tests (Docker)"

echo ""
if [ $API_STATUS -eq 0 ] && [ $FRONTEND_STATUS -eq 0 ] && [ $INTEGRATION_STATUS -eq 0 ]; then
    echo -e "${GREEN}All Docker tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some Docker tests failed. Please check the output above.${NC}"
    exit 1
fi
