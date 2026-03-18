#!/bin/bash

echo "=========================================="
echo "Running Product Tracker Test Suite"
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

# Track overall status
OVERALL_STATUS=0

echo ""
echo "1. Running API Unit Tests..."
echo "=========================================="
cd api
npm test
API_STATUS=$?
print_status $API_STATUS "API Unit Tests"
cd ..

if [ $API_STATUS -ne 0 ]; then
    OVERALL_STATUS=1
fi

echo ""
echo "2. Running Frontend Unit Tests..."
echo "=========================================="
cd frontend
npm test
FRONTEND_STATUS=$?
print_status $FRONTEND_STATUS "Frontend Unit Tests"
cd ..

if [ $FRONTEND_STATUS -ne 0 ]; then
    OVERALL_STATUS=1
fi

echo ""
echo "3. Running TypeScript Type Checking..."
echo "=========================================="
cd api
npm run typecheck
TYPECHECK_STATUS=$?
print_status $TYPECHECK_STATUS "TypeScript Type Checking"
cd ..

if [ $TYPECHECK_STATUS -ne 0 ]; then
    OVERALL_STATUS=1
fi

echo ""
echo "=========================================="
echo "Test Suite Summary"
echo "=========================================="
print_status $API_STATUS "API Unit Tests"
print_status $FRONTEND_STATUS "Frontend Unit Tests"
print_status $TYPECHECK_STATUS "TypeScript Type Checking"

echo ""
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo -e "${RED}Some tests failed. Please check the output above.${NC}"
fi

exit $OVERALL_STATUS
