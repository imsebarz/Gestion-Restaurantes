#!/bin/bash

# Status script - checks the status of running services

echo "📊 Checking service status..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=4000
FRONTEND_PORT=3000

echo -e "${BLUE}Service Status Report${NC}"
echo "=========================="

# Check backend status
echo -e "\n${BLUE}Backend (Port $BACKEND_PORT):${NC}"
if lsof -i:$BACKEND_PORT > /dev/null 2>&1; then
    PID=$(lsof -ti:$BACKEND_PORT)
    echo -e "${GREEN}✅ Running (PID: $PID)${NC}"
    PROCESS_INFO=$(ps -p $PID -o pid,ppid,cmd --no-headers 2>/dev/null || echo "Process info unavailable")
    echo "   $PROCESS_INFO"
else
    echo -e "${RED}❌ Not running${NC}"
fi

# Check frontend status
echo -e "\n${BLUE}Frontend (Port $FRONTEND_PORT):${NC}"
if lsof -i:$FRONTEND_PORT > /dev/null 2>&1; then
    PID=$(lsof -ti:$FRONTEND_PORT)
    echo -e "${GREEN}✅ Running (PID: $PID)${NC}"
    PROCESS_INFO=$(ps -p $PID -o pid,ppid,cmd --no-headers 2>/dev/null || echo "Process info unavailable")
    echo "   $PROCESS_INFO"
else
    echo -e "${RED}❌ Not running${NC}"
fi

# Check database connectivity (if applicable)
echo -e "\n${BLUE}Database:${NC}"
if [ -f "backend/.env" ] && cd backend && npm run generate > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database accessible${NC}"
    cd ..
else
    echo -e "${YELLOW}⚠️  Database status unknown${NC}"
fi

# Check log files
echo -e "\n${BLUE}Log Files:${NC}"
if [ -d "logs" ]; then
    for log in logs/*.log; do
        if [ -f "$log" ]; then
            SIZE=$(du -h "$log" | cut -f1)
            MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$log" 2>/dev/null || echo "Unknown")
            echo -e "${GREEN}📄 $log${NC} (Size: $SIZE, Modified: $MODIFIED)"
        fi
    done
else
    echo -e "${YELLOW}⚠️  No log directory found${NC}"
fi

echo -e "\n${BLUE}System Resources:${NC}"
echo "CPU Usage: $(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | cut -d% -f1)%"
echo "Memory: $(top -l 1 -s 0 | grep "PhysMem" | awk '{print $2 " used, " $6 " free"}')"