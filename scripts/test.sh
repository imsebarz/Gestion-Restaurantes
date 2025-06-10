#!/bin/bash

# Test script - runs linting and tests for both frontend and backend

set -e

echo "🧪 Running tests and linting..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track test results
BACKEND_LINT_PASSED=0
FRONTEND_LINT_PASSED=0
TESTS_PASSED=0

# Function to handle test results
handle_test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 passed${NC}"
        return 0
    else
        echo -e "${RED}❌ $2 failed${NC}"
        return 1
    fi
}

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend-nextjs/node_modules" ]; then
    echo -e "${YELLOW}Dependencies not found. Installing...${NC}"
    make install
fi

# Test backend
echo -e "${BLUE}Running backend linting...${NC}"
cd backend
if npm run lint; then
    BACKEND_LINT_PASSED=1
    handle_test_result 0 "Backend linting"
else
    handle_test_result 1 "Backend linting"
fi
cd ..

# Test frontend
echo -e "${GREEN}Running frontend linting...${NC}"
cd frontend-nextjs
if npm run lint; then
    FRONTEND_LINT_PASSED=1
    handle_test_result 0 "Frontend linting"
else
    handle_test_result 1 "Frontend linting"
fi
cd ..

# Summary
echo -e "\n${BLUE}Test Summary:${NC}"
if [ $BACKEND_LINT_PASSED -eq 1 ] && [ $FRONTEND_LINT_PASSED -eq 1 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi