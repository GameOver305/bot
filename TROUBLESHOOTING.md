# استكشاف الأخطاء وإصلاحها 🔧

## جدول المحتويات
1. [مشاكل الاتصال](#مشاكل-الاتصال)
2. [مشاكل الأوامر](#مشاكل-الأوامر)
3. [مشاكل التذكيرات](#مشاكل-التذكيرات)
4. [مشاكل الحجوزات](#مشاكل-الحجوزات)
5. [أخطاء شائعة](#أخطاء-شائعة)

---

## مشاكل الاتصال

### ❌ المشكلة: البوت غير متصل (Offline)

**السبب المحتمل:**
- Token خاطئ
- Intents غير مفعلة
- مشكلة في الشبكة

**الحل:**
```bash
# 1. تحقق من Token
cat .env | grep DISCORD_TOKEN

# 2. تحقق من السجلات
npm start

# ابحث عن:
# ✅ Bot is ready!
# أو
# ❌ Failed to login: Invalid token

# 3. إذا كان Token خاطئ:
# - اذهب إلى Discord Developer Portal
# - Bot → Reset Token
# - انسخ Token الجديد إلى .env
```

### ❌ المشكلة: البوت متصل لكن لا يستجيب

**الحل:**
```bash
# 1. تحقق من Intents
# في Discord Developer Portal → Bot
# يجب تفعيل:
# ✅ Presence Intent
# ✅ Server Members Intent
# ✅ Message Content Intent (اختياري)

# 2. أعد تشغيل البوت
# Ctrl+C ثم
npm start
```

---

## مشاكل الأوامر

### ❌ المشكلة: الأوامر لا تظهر في Discord

**الحل الفوري (للاختبار):**
```bash
# 1. أضف GUILD_ID إلى .env
nano .env

# أضف:
GUILD_ID=your_server_id_here

# 2. احصل على Server ID:
# - فعّل Developer Mode في Discord
# - انقر بزر الماوس الأيمن على اسم السيرفر
# - Copy ID

# 3. أعد تشغيل البوت
npm start
```

**الحل الدائم (للإنتاج):**
```bash
# احذف GUILD_ID من .env (سيستخدم الأوامر العامة)
# انتظر حتى 1 ساعة لتسجيل الأوامر عالمياً
```

### ❌ المشكلة: "Application did not respond"

**السبب:** البوت لم يرد خلال 3 ثوانٍ

**الحل:**
```javascript
// تحقق من السجلات لوجود أخطاء JavaScript
// الأخطاء الشائعة:
// - Cannot read property 'x' of undefined
// - db is not defined
// - Invalid interaction

// للإصلاح:
// 1. تحقق من ملفات handlers/
// 2. تأكد من import الصحيح
// 3. أعد تشغيل البوت
```

---

## مشاكل التذكيرات

### ❌ المشكلة: التذكيرات لا تصل

**التحقق خطوة بخطوة:**
```bash
# 1. هل التذكيرات مفعلة في الإعدادات?
/dang → ⚙️ الإعدادات → 🔔 التذكيرات
# يجب أن تكون: مفعلة ✅

# 2. هل يمكن للبوت إرسال رسائل خاصة؟
# في Discord → إعدادات الخصوصية
# ✅ السماح بالرسائل المباشرة من أعضاء السيرفر

# 3. هل الحجز في المستقبل؟
# التذكيرات لا تُرسل للحجوزات الماضية
```

**اختبار يدوي:**
```javascript
// في src/index.js (للاختبار فقط)
client.on('ready', async () => {
  console.log('Testing DM...');
  const user = await client.users.fetch('YOUR_USER_ID');
  await user.send('🔔 اختبار الرسائل الخاصة');
});
```

### ❌ المشكلة: "Cannot send messages to this user"

**الحل:**
1. افتح إعدادات Discord
2. Privacy & Safety
3. فعّل "Allow direct messages from server members"
4. حاول مرة أخرى

---

## مشاكل الحجوزات

### ❌ المشكلة: "تعارض مع حجز آخر"

**فهم التعارض:**
```
الحجز 1: 15 فبراير → 20 فبراير
الحجز 2: 18 فبراير → 22 فبراير
❌ تعارض! (18-20 متداخل)

الحجز 1: 15 فبراير → 20 فبراير
الحجز 2: 20 فبراير → 25 فبراير
✅ لا تعارض (20 فبراير نهاية الأول وبداية الثاني)
```

**الحل:**
```bash
# 1. عرض الحجوزات الحالية
/dang → 📅 الحجوزات → نوع الحجز → 📋 عرض الحجوزات

# 2. اختر تاريخ مختلف
# أو
# 3. احذف الحجز القديم (إذا كان خطأ)
```

### ❌ المشكلة: خطأ في تنسيق التاريخ

**أمثلة:**
```
❌ خطأ:
- 15/02/2024    (استخدم - بدلاً من /)
- 2024-2-15     (استخدم 02 بدلاً من 2)
- 15-02-2024    (اليوم أولاً)
- Feb 15, 2024  (استخدم أرقام فقط)

✅ صحيح:
- 2024-02-15
- 2024-12-31
- 2025-01-01
```

**أداة تحويل:**
```javascript
// في المتصفح Console (F12)
function formatDate(day, month, year) {
  const m = month.toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${year}-${m}-${d}`;
}

console.log(formatDate(15, 2, 2024)); // "2024-02-15"
```

---

## أخطاء شائعة

### ❌ خطأ: "ENOENT: no such file or directory"

**السبب:** ملف مفقود

**الحل:**
```bash
# تحقق من هيكل المشروع
ls -R src/

# يجب أن ترى:
# src/commands/
# src/handlers/
# src/services/
# src/utils/
# src/index.js

# إذا كان أي مجلد مفقود، أعد إنشاءه:
mkdir -p src/commands src/handlers src/services src/utils
```

### ❌ خطأ: "Cannot find module"

**السبب:** حزمة npm مفقودة

**الحل:**
```bash
# أعد تثبيت الحزم
rm -rf node_modules package-lock.json
npm install
```

### ❌ خطأ: "Permission denied"

**السبب:** صلاحيات الملف

**الحل:**
```bash
# أعط صلاحيات للمجلد
chmod -R 755 /workspaces/bot

# أو للملف المحدد
chmod 644 src/index.js
```

### ❌ خطأ: "Port already in use"

**السبب:** عملية أخرى تستخدم المنفذ

**الحل:**
```bash
# ابحث عن العملية
lsof -i :3000  # غير 3000 برقم المنفذ

# اقتل العملية
kill -9 <PID>

# أو أعد تشغيل الحاسوب
```

---

## أدوات التشخيص

### أداة 1: فحص الاتصال
```bash
#!/bin/bash
# scripts/check-connection.sh

echo "🔍 فحص الاتصال..."

# 1. فحص Token
if [ -z "$DISCORD_TOKEN" ]; then
    echo "❌ DISCORD_TOKEN غير محدد"
else
    echo "✅ DISCORD_TOKEN موجود"
fi

# 2. فحص Node.js
NODE_VERSION=$(node -v)
echo "📦 Node.js: $NODE_VERSION"

# 3. فحص الحزم
if [ -d "node_modules" ]; then
    echo "✅ node_modules موجود"
else
    echo "❌ node_modules مفقود - قم بتشغيل: npm install"
fi

# 4. فحص الملفات
FILES=("src/index.js" "src/utils/database.js" "package.json")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file موجود"
    else
        echo "❌ $file مفقود"
    fi
done
```

### أداة 2: تسجيل مفصل
```javascript
// في src/index.js - أضف للتشخيص
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('📄 Reason:', reason);
  console.error('📚 Stack:', reason.stack);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('📚 Stack:', error.stack);
});

// تسجيل كل التفاعلات
client.on('interactionCreate', interaction => {
  console.log('🔷 Interaction:', {
    type: interaction.type,
    user: interaction.user.tag,
    customId: interaction.customId || interaction.commandName,
    timestamp: new Date().toISOString()
  });
});
```

### أداة 3: فحص قاعدة البيانات
```javascript
// scripts/check-database.js
import db from '../src/utils/database.js';

console.log('🔍 فحص قاعدة البيانات...\n');

// 1. الحجوزات
const bookings = db.getBookings();
console.log('📅 الحجوزات:');
console.log('  🏗️  البناء:', bookings.building.length);
console.log('  🔬 الأبحاث:', bookings.research.length);
console.log('  ⚔️  التدريب:', bookings.training.length);

// 2. التحالف
const alliance = db.getAlliance();
console.log('\n🤝 التحالف:');
console.log('  اسم:', alliance.name || 'غير محدد');
console.log('  أعضاء:', alliance.members.length);

// 3. الصلاحيات
const perms = db.getPermissions();
console.log('\n🛡️ الصلاحيات:');
console.log('  المالك:', perms.owner || 'غير محدد');
console.log('  المشرفين:', perms.admins.length);

console.log('\n✅ الفحص مكتمل');
```

**الاستخدام:**
```bash
node scripts/check-database.js
```

---

## السجلات والمراقبة

### تفعيل السجلات المفصلة
```javascript
// في src/index.js
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('🐛 DEBUG MODE ENABLED');
  
  // تسجيل جميع الأحداث
  client.on('debug', info => console.log('🔧 Debug:', info));
  client.on('warn', info => console.warn('⚠️  Warn:', info));
  client.on('error', error => console.error('❌ Error:', error));
}
```

**الاستخدام:**
```bash
DEBUG=true npm start
```

### مراقبة الأداء
```javascript
// في src/index.js
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('📊 Memory:', {
    rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB'
  });
}, 60000); // كل دقيقة
```

---

## الحصول على المساعدة

### قبل طلب المساعدة، اجمع:

1. **معلومات النظام:**
```bash
echo "OS: $(uname -a)"
echo "Node: $(node -v)"
echo "NPM: $(npm -v)"
```

2. **السجلات:**
```bash
npm start 2>&1 | tee bot.log
# سيحفظ السجلات في bot.log
```

3. **الخطوات لإعادة إنتاج الخطأ:**
- ما الأمر الذي استخدمته؟
- ما النتيجة المتوقعة؟
- ما النتيجة الفعلية؟
- رسالة الخطأ الكاملة؟

### مصادر المساعدة

- 📖 [README.md](README.md) - التوثيق الكامل
- 🚀 [QUICKSTART.md](QUICKSTART.md) - دليل البدء السريع
- 📚 [EXAMPLES.md](EXAMPLES.md) - أمثلة الاستخدام
- 💬 GitHub Issues - لطرح الأسئلة

---

**نصيحة:** احتفظ بنسخة احتياطية من ملف `.env` وملفات `data/` دائماً! 🔐
