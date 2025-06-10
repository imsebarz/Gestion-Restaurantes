#!/bin/bash

# Deploy script - deploys both applications locally in production mode

set -e

echo "🚀 Deploying applications locally..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=4000
FRONTEND_PORT=3000
LOG_DIR="logs"

# Create logs directory
mkdir -p $LOG_DIR

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down deployed services...${NC}"
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

# Check if applications are built
if [ ! -d "frontend-nextjs/.next" ]; then
    echo -e "${YELLOW}Frontend not built. Building now...${NC}"
    make build
fi

# Stop any existing processes on the ports
echo -e "${BLUE}Stopping existing services...${NC}"
lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true

# Start backend in production mode
echo -e "${BLUE}Starting backend in production mode...${NC}"
cd backend
NODE_ENV=production npm run dev > ../$LOG_DIR/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend in production mode
echo -e "${GREEN}Starting frontend in production mode...${NC}"
cd frontend-nextjs
NODE_ENV=production npm start > ../$LOG_DIR/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

# Check if services are running
if kill -0 $BACKEND_PID 2>/dev/null && kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}Backend:  http://localhost:$BACKEND_PORT${NC}"
    echo -e "${GREEN}Frontend: http://localhost:$FRONTEND_PORT${NC}"
    echo -e "${BLUE}Logs available in: $LOG_DIR/${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop services${NC}"
    
    # Wait for processes
    wait
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo -e "${YELLOW}Check logs in $LOG_DIR/ for details${NC}"
    cleanup
fi