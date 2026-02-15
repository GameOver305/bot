#!/bin/bash

# Interactive setup script for Discord Bot
# سكريبت تفاعلي لإعداد بوت Discord بشكل كامل

clear
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 مرحباً! سأساعدك في إعداد البوت خطوة بخطوة"
echo "🤖 Welcome! I'll help you setup the bot step by step"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  ملف .env موجود بالفعل!"
    echo "⚠️  .env file already exists!"
    echo ""
    read -p "هل تريد استبداله؟ (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ تم الإلغاء. سأستخدم الملف الموجود."
        exit 0
    fi
fi

echo ""
echo "📋 سأحتاج منك 3 معلومات فقط:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Discord Token
echo ""
echo "1️⃣  توكن البوت (Discord Bot Token)"
echo "────────────────────────────────────────────────"
echo "📍 كيف تحصل عليه:"
echo "   1. اذهب إلى: https://discord.com/developers/applications"
echo "   2. اختر تطبيقك (أو أنشئ واحد جديد)"
echo "   3. Bot → Reset Token → Copy"
echo ""
read -p "📝 الصق التوكن هنا: " DISCORD_TOKEN

if [ -z "$DISCORD_TOKEN" ]; then
    echo "❌ التوكن مطلوب! تم الإلغاء."
    exit 1
fi

# Step 2: Owner ID
echo ""
echo "2️⃣  معرف المالك (Your User ID)"
echo "────────────────────────────────────────────────"
echo "📍 كيف تحصل عليه:"
echo "   1. في Discord: Settings → Advanced → فعّل Developer Mode"
echo "   2. انقر بزر الماوس الأيمن على اسمك → Copy User ID"
echo ""
read -p "📝 الصق معرفك هنا: " OWNER_ID

if [ -z "$OWNER_ID" ]; then
    echo "❌ معرف المالك مطلوب! تم الإلغاء."
    exit 1
fi

# Step 3: Guild ID (Optional)
echo ""
echo "3️⃣  معرف السيرفر (Server ID) - اختياري"
echo "────────────────────────────────────────────────"
echo "📍 كيف تحصل عليه:"
echo "   1. انقر بزر الماوس الأيمن على اسم السيرفر → Copy Server ID"
echo "   2. أو اتركه فارغاً (اضغط Enter)"
echo ""
read -p "📝 الصق معرف السيرفر (أو اضغط Enter للتخطي): " GUILD_ID

# Create .env file
echo ""
echo "⏳ جاري إنشاء ملف .env..."

cat > .env << EOF
# Discord Bot Configuration
# إعدادات بوت Discord

# توكن البوت (مطلوب)
# احصل عليه من: https://discord.com/developers/applications
DISCORD_TOKEN=$DISCORD_TOKEN

# معرف المالك (مطلوب)
# معرف المستخدم في Discord
OWNER_ID=$OWNER_ID

# معرف السيرفر للاختبار (اختياري)
# لتسجيل الأوامر فوراً بدلاً من الانتظار ساعة
${GUILD_ID:+GUILD_ID=$GUILD_ID}
${GUILD_ID:-# GUILD_ID=}

# بيئة التشغيل
NODE_ENV=production
EOF

echo "✅ تم إنشاء ملف .env بنجاح!"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 تثبيت الحزم المطلوبة..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    npm install
    echo ""
fi

# Create data directory and files if they don't exist
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 إعداد قاعدة البيانات..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p data

# Initialize data files if they don't exist
if [ ! -f "data/bookings.json" ]; then
    echo '{"bookings":[]}' > data/bookings.json
    echo "✅ تم إنشاء bookings.json"
fi

if [ ! -f "data/users.json" ]; then
    echo '{"users":{}}' > data/users.json
    echo "✅ تم إنشاء users.json"
fi

if [ ! -f "data/alliance.json" ]; then
    echo '{"name":"التحالف","tag":"ALLY","description":"وصف التحالف","members":[]}' > data/alliance.json
    echo "✅ تم إنشاء alliance.json"
fi

if [ ! -f "data/reminders.json" ]; then
    echo '{"reminders":[]}' > data/reminders.json
    echo "✅ تم إنشاء reminders.json"
fi

if [ ! -f "data/permissions.json" ]; then
    echo '{"admins":[],"permissions":{}}' > data/permissions.json
    echo "✅ تم إنشاء permissions.json"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ الإعداد اكتمل بنجاح!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 الخطوات التالية:"
echo ""
echo "1️⃣  ادع البوت للسيرفر:"
echo "   🔗 اذهب إلى: https://discord.com/developers/applications"
echo "   🔗 OAuth2 → URL Generator"
echo "   🔗 اختر: bot + applications.commands"
echo "   🔗 Permissions: Send Messages, Embed Links, Use Slash Commands"
echo ""
echo "2️⃣  شغّل البوت:"
echo "   🚀 ./start.sh"
echo "   أو: npm start"
echo ""
echo "3️⃣  جرب البوت:"
echo "   💬 في Discord اكتب: /dang"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "هل تريد تشغيل البوت الآن؟ (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 جاري تشغيل البوت..."
    echo ""
    npm start
else
    echo ""
    echo "👍 حسناً! يمكنك تشغيل البوت لاحقاً بالأمر:"
    echo "   ./start.sh"
    echo ""
fi
