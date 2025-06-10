# 🍽️ Proyecto Restaurantes - Local CI/CD Pipeline

A simple and effective local CI/CD pipeline for developing and deploying the restaurant management system.

## 📁 Project Structure

```
proyecto-restaurantes/
├── backend/                 # GraphQL API with Prisma
├── frontend-nextjs/         # Next.js React frontend
├── scripts/                 # CI/CD pipeline scripts
├── logs/                   # Application logs (created on deploy)
└── Makefile                # Main pipeline commands
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm
- Make (comes with macOS)

### Initial Setup
```bash
# Clone and enter the project
cd proyecto-restaurantes

# Install dependencies and setup database
make install
make db-setup

# Start development environment
make dev
```

## 📋 Available Commands

### Main Pipeline Commands
```bash
make help       # Show all available commands
make install    # Install dependencies for both apps
make dev        # Start development servers
make build      # Build both applications
make test       # Run linting and tests
make deploy     # Deploy locally in production mode
make status     # Check service status
make logs       # Show application logs
make clean      # Clean build artifacts
make pipeline   # Run full CI/CD pipeline
```

### Database Commands
```bash
make db-setup   # Setup database and run migrations
make db-reset   # Reset database (development only)
```

## 🔧 Development Workflow

### 1. Start Development
```bash
make dev
```
- Backend: http://localhost:4000
- Frontend: http://localhost:3000
- Both servers restart automatically on code changes

### 2. Run Tests
```bash
make test
```
- Runs ESLint on both frontend and backend
- Checks for code quality issues

### 3. Build for Production
```bash
make build
```
- Compiles TypeScript
- Generates Prisma client
- Builds Next.js application

### 4. Deploy Locally
```bash
make deploy
```
- Runs applications in production mode
- Logs output to `logs/` directory
- Services run in background

## 📊 Monitoring

### Check Service Status
```bash
make status
```
Shows:
- Running processes and PIDs
- Port usage
- Database connectivity
- Log file information
- System resources

### View Logs
```bash
make logs                    # Show all logs (last 50 lines)
./scripts/logs.sh backend    # Backend logs only
./scripts/logs.sh frontend 100  # Frontend logs (last 100 lines)
```

### Real-time Log Monitoring
```bash
tail -f logs/backend.log     # Follow backend logs
tail -f logs/frontend.log    # Follow frontend logs
```

## 🛠️ CI/CD Pipeline Scripts

### Individual Scripts
```bash
./scripts/dev.sh       # Development server startup
./scripts/build.sh     # Production build
./scripts/test.sh      # Testing and linting
./scripts/deploy.sh    # Local deployment
./scripts/status.sh    # Service status check
./scripts/logs.sh      # Log viewing
```

## 🔄 Full Pipeline Example

```bash
# Complete CI/CD pipeline
make pipeline

# This runs:
# 1. make clean      - Clean previous builds
# 2. make install    - Install dependencies
# 3. make db-setup   - Setup database
# 4. make test       - Run tests and linting
# 5. make build      - Build applications
# 6. make deploy     - Deploy locally
```

## 📁 Generated Files and Directories

### Logs Directory
```
logs/
├── backend.log      # Backend application logs
└── frontend.log     # Frontend application logs
```

### Build Artifacts
```
backend/
└── dist/           # Compiled TypeScript (if configured)

frontend-nextjs/
├── .next/          # Next.js build output
└── out/            # Static export (if configured)
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Check what's using the ports
lsof -i:3000  # Frontend port
lsof -i:4000  # Backend port

# Kill processes if needed
make status   # Check current status first
```

### Database Issues
```bash
# Reset database completely
make db-reset

# Regenerate Prisma client
cd backend && npm run generate
```

### Build Failures
```bash
# Clean and rebuild
make clean
make install
make build
```

### View Detailed Logs
```bash
# Check specific service logs
./scripts/logs.sh backend 200   # Last 200 lines of backend
./scripts/logs.sh frontend 100  # Last 100 lines of frontend
```

## 🎯 Best Practices

### Development
1. Always run `make test` before committing
2. Use `make dev` for development work
3. Check `make status` if services seem unresponsive

### Deployment
1. Run `make build` to verify builds work
2. Use `make deploy` for local production testing
3. Monitor logs with `make logs` after deployment

### Debugging
1. Check service status first: `make status`
2. Review logs: `make logs`
3. For real-time debugging: `tail -f logs/backend.log`

## 🔧 Configuration

### Environment Variables
- Backend: Create `backend/.env` for database and API configuration
- Frontend: Create `frontend-nextjs/.env.local` for client configuration

### Ports
- Backend: 4000 (configurable in scripts)
- Frontend: 3000 (configurable in scripts)

## 📝 Notes

- This pipeline is designed for local development and testing
- For production deployment, consider using Docker or cloud platforms
- Logs are rotated manually - clean them periodically
- All scripts include error handling and colored output for better UX

## 🤝 Contributing

1. Make changes to your code
2. Run `make test` to ensure quality
3. Use `make pipeline` to test the full flow
4. Commit your changes

---

**Happy coding! 🚀**