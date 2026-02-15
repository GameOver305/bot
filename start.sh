#!/bin/bash

# Script to start the Discord bot
# يستخدم هذا السكريبت لتشغيل بوت Discord

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Discord Bot Launcher"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ ملف .env غير موجود!"
    echo "❌ .env file not found!"
    echo ""
    echo "📋 يرجى نسخ .env.example إلى .env وملء البيانات المطلوبة"
    echo "📋 Please copy .env.example to .env and fill in the required data"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 جاري تثبيت الحزم..."
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the bot
echo "🚀 جاري تشغيل البوت..."
echo "🚀 Starting the bot..."
echo ""
npm start
