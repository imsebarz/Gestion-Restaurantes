# Proyecto Restaurantes - Local CI/CD Pipeline
# Simple Makefile for local development and deployment

.PHONY: help install dev build test deploy clean status logs

# Default target
help:
	@echo "🍽️  Proyecto Restaurantes - Local CI/CD Pipeline"
	@echo ""
	@echo "Available commands:"
	@echo "  install     - Install dependencies for both frontend and backend"
	@echo "  dev         - Start development servers (frontend & backend)"
	@echo "  build       - Build both applications"
	@echo "  test        - Run tests and linting"
	@echo "  deploy      - Deploy both applications locally"
	@echo "  status      - Check status of running services"
	@echo "  logs        - Show logs from running services"
	@echo "  clean       - Clean build artifacts and node_modules"
	@echo "  db-setup    - Setup database and run migrations"
	@echo "  db-reset    - Reset database"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@cd backend && npm install
	@cd frontend-nextjs && npm install
	@echo "✅ Dependencies installed successfully"

# Database setup
db-setup:
	@echo "🗄️  Setting up database..."
	@cd backend && npm run generate
	@cd backend && npm run migrate
	@echo "✅ Database setup completed"

# Database reset
db-reset:
	@echo "🔄 Resetting database..."
	@cd backend && npx prisma migrate reset --force --schema=./infrastructure/prisma/schema.prisma
	@echo "✅ Database reset completed"

# Development mode
dev:
	@echo "🚀 Starting development servers..."
	@./scripts/dev.sh

# Build applications
build:
	@echo "🔨 Building applications..."
	@./scripts/build.sh

# Run tests and linting
test:
	@echo "🧪 Running tests and linting..."
	@./scripts/test.sh

# Deploy locally
deploy:
	@echo "🚀 Deploying applications locally..."
	@./scripts/deploy.sh

# Check status
status:
	@echo "📊 Checking service status..."
	@./scripts/status.sh

# Show logs
logs:
	@echo "📋 Showing application logs..."
	@./scripts/logs.sh

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf backend/node_modules backend/dist
	@rm -rf frontend-nextjs/node_modules frontend-nextjs/.next frontend-nextjs/out
	@echo "✅ Clean completed"

# Full pipeline
pipeline: clean install db-setup test build deploy
	@echo "🎉 Full pipeline completed successfully!"