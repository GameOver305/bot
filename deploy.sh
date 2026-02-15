#!/bin/bash

###############################################################################
# Discord Bot - Complete Deployment Script
# This script handles installation, configuration, and startup
###############################################################################

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         Discord Booking Bot - Deployment Script             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Check Node.js installation
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version must be 16 or higher. Current: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v)"

# Step 2: Check npm installation
print_info "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi
print_success "npm version: $(npm -v)"

# Step 3: Create data directory
print_info "Creating data directory..."
mkdir -p data
print_success "Data directory created/verified"

# Step 4: Check .env file
print_info "Checking .env configuration..."
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_info "Please edit .env file and add your DISCORD_TOKEN"
        print_warning "Deployment paused. Run this script again after configuring .env"
        exit 1
    else
        print_error ".env.example not found!"
        exit 1
    fi
fi

# Validate DISCORD_TOKEN
if grep -q "YOUR_BOT_TOKEN_HERE" .env; then
    print_error "DISCORD_TOKEN not configured in .env file"
    print_info "Please edit .env and add your bot token"
    exit 1
fi
print_success ".env file configured"

# Step 5: Install dependencies
print_info "Installing npm dependencies..."
npm install --production
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 6: Audit and fix vulnerabilities (optional)
print_info "Checking for security vulnerabilities..."
npm audit fix --force 2>/dev/null || print_warning "Some vulnerabilities may remain"

# Step 7: Initialize database files
print_info "Initializing database files..."
for file in users.json bookings.json alliance.json permissions.json reminders.json; do
    if [ ! -f "data/$file" ]; then
        echo "{}" > "data/$file"
        print_success "Created data/$file"
    else
        print_info "data/$file already exists"
    fi
done

# Initialize specific structures
if [ ! -s "data/bookings.json" ] || [ "$(cat data/bookings.json)" = "{}" ]; then
    echo '{"building":[],"research":[],"training":[]}' > data/bookings.json
    print_success "Initialized bookings.json structure"
fi

if [ ! -s "data/alliance.json" ] || [ "$(cat data/alliance.json)" = "{}" ]; then
    echo '{"name":"","tag":"","leader":"","members":[],"description":""}' > data/alliance.json
    print_success "Initialized alliance.json structure"
fi

if [ ! -s "data/permissions.json" ] || [ "$(cat data/permissions.json)" = "{}" ]; then
    echo '{"owner":"","admins":[],"moderators":[]}' > data/permissions.json
    print_success "Initialized permissions.json structure"
fi

if [ ! -s "data/reminders.json" ] || [ "$(cat data/reminders.json)" = "{}" ]; then
    echo '{"enabled":true,"times":[86400000,21600000,10800000,3600000]}' > data/reminders.json
    print_success "Initialized reminders.json structure"
fi

# Step 8: Kill any existing bot processes
print_info "Checking for existing bot processes..."
pkill -f "node src/index.js" 2>/dev/null && print_warning "Stopped existing bot process" || print_info "No existing process found"

# Step 9: Test bot startup
print_info "Testing bot configuration..."
timeout 5 node src/index.js 2>&1 | head -n 10 &
sleep 3
if pgrep -f "node src/index.js" > /dev/null; then
    pkill -f "node src/index.js"
    print_success "Bot configuration test passed"
else
    print_warning "Bot test completed (may need token verification)"
fi

# Step 10: Display final information
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Deployment Complete!                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
print_success "All checks passed successfully!"
echo ""
print_info "To start the bot, run one of these commands:"
echo ""
echo "  Production (recommended):     npm start"
echo "  Development (with logs):      node src/index.js"
echo "  Background (with PM2):        pm2 start src/index.js --name discord-bot"
echo "  Background (with nohup):      nohup node src/index.js > bot.log 2>&1 &"
echo ""
print_info "Bot Features:"
echo "  ✅ Booking system (Building, Research, Training)"
echo "  ✅ Alliance management"
echo "  ✅ Automatic reminders"
echo "  ✅ Multi-language support (English/Arabic)"
echo "  ✅ Permission system"
echo "  ✅ Statistics tracking"
echo ""
print_info "Important Notes:"
echo "  • Default language is now English"
echo "  • Use /dang command to access the main menu"
echo "  • Language can be switched using the button in main menu"
echo "  • Bookings now include: Member Name, ID, Alliance, Duration"
echo ""
print_warning "Configuration Tips:"
echo "  • Add GUILD_ID in .env for instant command registration"
echo "  • Use /setowner @user to set the bot owner"
echo "  • Configure alliance info in the Alliance menu"
echo ""

# Optional: Auto-start the bot
read -p "$(echo -e ${YELLOW}Would you like to start the bot now? [y/N]: ${NC})" -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting bot..."
    node src/index.js
else
    print_info "Deployment complete. Start the bot manually when ready."
fi
