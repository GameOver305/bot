#!/bin/bash

# Script to prepare bot for WispByte deployment
# سكريبت لتحضير البوت للرفع على WispByte

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 تحضير البوت لـ WispByte"
echo "🚀 Preparing bot for WispByte"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Remove unnecessary files
echo "🧹 تنظيف الملفات..."
rm -rf node_modules
rm -f discord-bot.zip

# Create zip file for upload
echo "📦 إنشاء ملف ZIP..."
zip -r discord-bot.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".env" \
  -x "*.zip" \
  -x ".gitignore"

echo ""
echo "✅ تم! ملف discord-bot.zip جاهز للرفع"
echo "✅ Done! discord-bot.zip is ready for upload"
echo ""
echo "📋 الخطوات التالية:"
echo "1. اذهب إلى wispbyte.com"
echo "2. أنشئ بوت جديد"
echo "3. ارفع ملف discord-bot.zip"
echo "4. أضف المتغيرات البيئية"
echo "5. شغّل البوت!"
echo ""
echo "📖 راجع WISPBYTE_GUIDE.md للتفاصيل الكاملة"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
