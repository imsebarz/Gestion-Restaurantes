#!/bin/bash

# Development script - starts both frontend and backend in development mode

set -e

echo "🚀 Starting development environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down development servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend-nextjs/node_modules" ]; then
    echo -e "${YELLOW}Dependencies not found. Installing...${NC}"
    make install
fi

# Start backend in background
echo -e "${BLUE}Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo -e "${GREEN}Starting frontend server...${NC}"
cd frontend-nextjs
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✅ Development servers started!${NC}"
echo -e "${GREEN}Backend:  http://localhost:4000${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Wait for processes
wait