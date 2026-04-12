#!/bin/bash
# PharmaSys Development Environment Setup Script

set -e  # Exit on any error

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   PharmaSys - Development Environment Setup             ║"
echo "║   Frontend + Backend Integration with Offline Support   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "${BLUE}1. Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Install it or use Docker"
fi

echo "✅ Prerequisites check passed"
echo ""

# Setup Backend
echo "${BLUE}2. Setting up Backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

echo "✅ Backend setup complete"
echo ""

# Setup Frontend
echo "${BLUE}3. Setting up Frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Frontend Environment Variables
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=PharmaSys
EOF
    echo "✅ .env created for frontend"
fi

echo "✅ Frontend setup complete"
echo ""

# Final Instructions
echo "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo "${GREEN}║   ✅ Setup Complete!                                     ║${NC}"
echo "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "${YELLOW}Next Steps:${NC}"
echo ""

echo "1️⃣  ${BLUE}Start Backend:${NC}"
echo "   cd backend"
echo "   npm run db:generate"
echo "   npm run db:push"
echo "   npm run db:seed      # Optional: add sample data"
echo "   npm run dev"
echo ""

echo "2️⃣  ${BLUE}Start Frontend (in new terminal):${NC}"
echo "   cd frontend"
echo "   npm run dev"
echo ""

echo "3️⃣  ${BLUE}Test Connection:${NC}"
echo "   Backend:  http://localhost:4000/api/health"
echo "   Frontend: http://localhost:5173"
echo ""

echo "4️⃣  ${BLUE}Test Offline Mode:${NC}"
echo "   - Open DevTools (F12)"
echo "   - Go to Network tab"
echo "   - Set Throttling to 'Offline'"
echo "   - Try adding/editing data"
echo "   - Switch back to Online"
echo "   - Watch data sync automatically! 🔄"
echo ""

echo "${YELLOW}Documentation:${NC}"
echo "   📖 Backend:     backend/README.md"
echo "   📖 Frontend:    FRONTEND_INTEGRATION.md"
echo "   📖 Quick Start: QUICK_START.md"
echo "   📖 API Guide:   API_GUIDE.md"
echo ""

echo "${GREEN}Happy coding! 🎉${NC}"
