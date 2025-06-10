#!/bin/bash

# Build script - builds both frontend and backend for production

set -e

echo "🔨 Building applications for production..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ Build failed at: $1${NC}"
    exit 1
}

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend-nextjs/node_modules" ]; then
    echo -e "${YELLOW}Dependencies not found. Installing...${NC}"
    make install || handle_error "dependency installation"
fi

# Build backend
echo -e "${BLUE}Building backend...${NC}"
cd backend
npm run generate || handle_error "backend prisma generate"
# Add TypeScript compilation if needed
if [ -f "tsconfig.json" ]; then
    npx tsc || handle_error "backend TypeScript compilation"
fi
cd ..

# Build frontend
echo -e "${GREEN}Building frontend...${NC}"
cd frontend-nextjs
npm run build || handle_error "frontend build"
cd ..

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${GREEN}Backend: Ready for deployment${NC}"
echo -e "${GREEN}Frontend: Built to .next directory${NC}"