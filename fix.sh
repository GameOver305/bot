#!/bin/bash

###############################################################################
# EMERGENCY FIX SCRIPT - For Hosting Platforms
# Use this if you encounter any issues
###############################################################################

echo "🔧 Running Emergency Fix..."

# 1. Stop all bot processes
echo "⏹️ Stopping all bot processes..."
pkill -f "node src/index.js" 2>/dev/null
pm2 delete discord-bot 2>/dev/null

# 2. Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# 3. Remove node_modules
echo "🗑️ Removing old dependencies..."
rm -rf node_modules package-lock.json

# 4. Reinstall dependencies
echo "📦 Installing fresh dependencies..."
npm install

# 5. Verify data directory
echo "📁 Checking data directory..."
mkdir -p data

# 6. Initialize database if needed
echo "🗄️ Initializing database..."
if [ ! -f "data/bookings.json" ] || [ "$(cat data/bookings.json 2>/dev/null)" = "{}" ]; then
    echo '{"building":[],"research":[],"training":[]}' > data/bookings.json
fi

if [ ! -f "data/alliance.json" ] || [ "$(cat data/alliance.json 2>/dev/null)" = "{}" ]; then
    echo '{"name":"","tag":"","leader":"","members":[],"description":""}' > data/alliance.json
fi

if [ ! -f "data/permissions.json" ] || [ "$(cat data/permissions.json 2>/dev/null)" = "{}" ]; then
    echo '{"owner":"","admins":[],"moderators":[]}' > data/permissions.json
fi

if [ ! -f "data/reminders.json" ] || [ "$(cat data/reminders.json 2>/dev/null)" = "{}" ]; then
    echo '{"enabled":true,"times":[86400000,21600000,10800000,3600000]}' > data/reminders.json
fi

if [ ! -f "data/users.json" ]; then
    echo '{}' > data/users.json
fi

# 7. Check .env file
echo "🔐 Verifying configuration..."
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Please create .env file with your DISCORD_TOKEN"
    exit 1
fi

if grep -q "YOUR_BOT_TOKEN_HERE" .env; then
    echo "❌ ERROR: DISCORD_TOKEN not configured!"
    echo "Please edit .env and add your bot token"
    exit 1
fi

echo ""
echo "✅ Emergency fix completed!"
echo ""
echo "Now run: npm start"
echo ""
