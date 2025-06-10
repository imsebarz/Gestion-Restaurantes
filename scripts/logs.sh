#!/bin/bash

# Logs script - displays logs from running services

echo "📋 Application Logs"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR="logs"

# Function to display usage
show_usage() {
    echo "Usage: $0 [backend|frontend|all] [lines]"
    echo "  backend  - Show backend logs only"
    echo "  frontend - Show frontend logs only"
    echo "  all      - Show all logs (default)"
    echo "  lines    - Number of lines to show (default: 50)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Show last 50 lines of all logs"
    echo "  $0 backend           # Show last 50 lines of backend logs"
    echo "  $0 frontend 100      # Show last 100 lines of frontend logs"
}

# Parse arguments
SERVICE=${1:-all}
LINES=${2:-50}

# Validate arguments
if [[ "$SERVICE" != "backend" && "$SERVICE" != "frontend" && "$SERVICE" != "all" ]]; then
    echo -e "${RED}Invalid service: $SERVICE${NC}"
    show_usage
    exit 1
fi

# Check if logs directory exists
if [ ! -d "$LOG_DIR" ]; then
    echo -e "${YELLOW}⚠️  Log directory not found. No services have been deployed yet.${NC}"
    echo -e "${BLUE}Run 'make deploy' to start services and generate logs.${NC}"
    exit 1
fi

# Function to show log file
show_log() {
    local service=$1
    local log_file="$LOG_DIR/${service}.log"
    
    if [ -f "$log_file" ]; then
        echo -e "\n${BLUE}=== $service Logs (Last $LINES lines) ===${NC}"
        tail -n "$LINES" "$log_file"
    else
        echo -e "\n${YELLOW}⚠️  $service log file not found: $log_file${NC}"
    fi
}

# Show logs based on service selection
case $SERVICE in
    "backend")
        show_log "backend"
        ;;
    "frontend")
        show_log "frontend"
        ;;
    "all")
        show_log "backend"
        show_log "frontend"
        ;;
esac

# Show real-time logs option
echo -e "\n${BLUE}💡 Tip: For real-time logs, use:${NC}"
if [ "$SERVICE" = "backend" ] || [ "$SERVICE" = "all" ]; then
    echo -e "${GREEN}  tail -f $LOG_DIR/backend.log${NC}"
fi
if [ "$SERVICE" = "frontend" ] || [ "$SERVICE" = "all" ]; then
    echo -e "${GREEN}  tail -f $LOG_DIR/frontend.log${NC}"
fi