#!/bin/bash
# ╔════════════════════════════════════════════════════════════╗
# ║  سكربت التحديث والتشغيل التلقائي - Wispbyte Start Command  ║
# ╚════════════════════════════════════════════════════════════╝
# 
# ضع هذا الأمر في Start Command:
# bash auto-start.sh
# أو:
# chmod +x auto-start.sh && ./auto-start.sh

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🤖 Discord Alliance Bot - Auto Update & Start          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# الانتقال لمسار البوت
cd "$(dirname "$0")" || cd /home/container || cd /app || true

# ============ تحديث الكود من GitHub ============
echo "📥 جاري تحديث الكود من GitHub..."

# تحقق إذا كان مجلد git موجود
if [ -d ".git" ]; then
    # إعادة تعيين أي تغييرات محلية وسحب آخر التحديثات
    git fetch --all 2>/dev/null
    git reset --hard origin/main 2>/dev/null
    git pull origin main 2>/dev/null
    echo "✅ تم تحديث الكود من GitHub"
else
    echo "⚠️ ليس مستودع Git - تخطي التحديث"
fi

# ============ تثبيت/تحديث المتطلبات ============
echo ""
echo "📦 جاري تثبيت/تحديث المتطلبات..."

# تثبيت المتطلبات (مع تجاهل الأخطاء الثانوية)
npm install --production 2>/dev/null || npm install 2>/dev/null
echo "✅ تم تثبيت المتطلبات"

# ============ تشغيل البوت ============
echo ""
echo "🚀 جاري تشغيل البوت..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# تشغيل البوت
node src/index.js
