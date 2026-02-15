# أمثلة الاستخدام 📚

## مثال 1: إعداد أول بوت

### الخطوة 1: إنشاء البوت
```javascript
// في Discord Developer Portal
1. New Application → "MyGameBot"
2. Bot → Add Bot
3. Copy Token
```

### الخطوة 2: التكوين
```bash
# في Terminal
cd /workspaces/bot
npm install
cp .env.example .env
nano .env
```

```env
# محتوى .env
DISCORD_TOKEN=MTA5ODc2NTQzMjEwOTg3NjU0My5HNnRKY0ku...
OWNER_ID=123456789012345678
CLIENT_ID=1098765432109876543
GUILD_ID=987654321098765432
```

### الخطوة 3: التشغيل
```bash
npm start
```

---

## مثال 2: سيناريو حجز كامل

### السيناريو
مجموعة من 5 لاعبين يريدون تنسيق مواعيد البناء

### الخطوات

**اللاعب 1 (المالك):**
```
1. /setowner
2. /dang → إعدادات → اللغة: العربية
3. /dang → الحجوزات → البناء → إضافة حجز
   - التاريخ: 2024-02-15
   - المدة: 3
   - ملاحظات: بناء القلعة
```

**اللاعب 2:**
```
1. /dang → الحجوزات → البناء → إضافة حجز
   - التاريخ: 2024-02-18
   - المدة: 2
   - ملاحظات: تطوير المزرعة
```

**النتيجة:**
```
✅ الحجز الأول: 15-17 فبراير (اللاعب 1)
✅ الحجز الثاني: 18-19 فبراير (اللاعب 2)
❌ لو حاول أحد الحجز في 16 فبراير → تعارض!
```

---

## مثال 3: إدارة التحالف

### إعداد معلومات التحالف

```javascript
// في data/alliance.json
{
  "name": "Warriors United",
  "tag": "[WU]",
  "leader": "123456789012345678",
  "members": [
    {
      "id": "123456789012345678",
      "name": "Leader123",
      "rank": "R5",
      "joinedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "234567890123456789",
      "name": "Officer456",
      "rank": "R4",
      "joinedAt": "2024-01-15T00:00:00.000Z"
    },
    {
      "id": "345678901234567890",
      "name": "Member789",
      "rank": "R1",
      "joinedAt": "2024-02-01T00:00:00.000Z"
    }
  ],
  "description": "نحن تحالف قوي يهدف للسيطرة على الخريطة!"
}
```

### الصلاحيات
- ✅ R5 (القائد): كل الصلاحيات
- ✅ R4 (الضابط): إدارة الأعضاء
- ❌ R1-R3: مشاهدة فقط

---

## مثال 4: التذكيرات المتقدمة

### السيناريو
لاعب لديه حجز في 20 فبراير الساعة 10 صباحاً

### جدول التذكيرات

| الوقت | التذكير |
|------|---------|
| 19 فبراير 10:00 | 🔔 تذكير: 24 ساعة متبقية |
| 20 فبراير 04:00 | 🔔 تذكير: 6 ساعات متبقية |
| 20 فبراير 07:00 | 🔔 تذكير: 3 ساعات متبقية |
| 20 فبراير 09:00 | 🔔 تذكير: ساعة واحدة متبقية |

### محتوى الرسالة
```
🔔 تذكير بالحجز

⏰ لديك حجز في مواعيد البناء
📅 البداية: 2024-02-20, 10:00 AM
⏳ المتبقي: 6 ساعات
📝 ملاحظات: بناء القلعة المستوى 25
```

---

## مثال 5: إدارة الصلاحيات

### الهيكل الهرمي

```
👑 المالك (Owner)
    ├── تعيين/حذف المشرفين
    ├── إدارة التحالف
    └── جميع الصلاحيات

👮 المشرفين (Admins)
    ├── إدارة التحالف
    ├── حذف حجوزات المستخدمين
    └── تعديل الإعدادات

👤 المستخدمين (Users)
    ├── إضافة حجوزاتهم الخاصة
    ├── عرض الحجوزات
    └── تغيير إعداداتهم
```

### أوامر الصلاحيات

```bash
# المالك يضيف مشرف
/addadmin @User1

# المالك يحذف مشرف
/removeadmin @User1

# عرض قائمة المشرفين
/dang → الصلاحيات
```

---

## مثال 6: استخدام API البيانات

### قراءة البيانات مباشرة (لأغراض التطوير)

```javascript
import db from './src/utils/database.js';

// الحصول على جميع الحجوزات
const allBookings = db.getBookings();
console.log('Building bookings:', allBookings.building);
console.log('Research bookings:', allBookings.research);
console.log('Training bookings:', allBookings.training);

// التحقق من التعارض
const hasConflict = db.checkConflict(
  'building',
  '2024-02-15',
  '2024-02-20'
);
console.log('Has conflict:', hasConflict);

// الحصول على معلومات مستخدم
const user = db.getUser('123456789012345678');
console.log('User language:', user.language);
console.log('Notifications enabled:', user.notifications);
```

---

## مثال 7: تكامل مع أنظمة خارجية

### إرسال إحصائيات إلى Webhook

```javascript
// في src/services/statsService.js
import db from '../utils/database.js';
import fetch from 'node-fetch';

export async function sendDailyStats(webhookUrl) {
  const bookings = db.getBookings();
  const alliance = db.getAlliance();
  
  const stats = {
    totalBookings: {
      building: bookings.building.length,
      research: bookings.research.length,
      training: bookings.training.length
    },
    allianceMembers: alliance.members.length,
    timestamp: new Date().toISOString()
  };
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: '📊 إحصائيات يومية',
        color: 0x00ff00,
        fields: [
          {
            name: '🏗️ حجوزات البناء',
            value: stats.totalBookings.building.toString(),
            inline: true
          },
          {
            name: '🔬 حجوزات الأبحاث',
            value: stats.totalBookings.research.toString(),
            inline: true
          },
          {
            name: '⚔️ حجوزات التدريب',
            value: stats.totalBookings.training.toString(),
            inline: true
          },
          {
            name: '👥 أعضاء التحالف',
            value: stats.allianceMembers.toString(),
            inline: true
          }
        ],
        timestamp: stats.timestamp
      }]
    })
  });
}
```

---

## مثال 8: نسخ احتياطي تلقائي

### سكريبت للنسخ الاحتياطي

```javascript
// scripts/backup.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createBackup() {
  const dataDir = path.join(__dirname, '../data');
  const backupDir = path.join(__dirname, '../backups');
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupPath = path.join(backupDir, `backup_${timestamp}`);
  
  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  
  // Copy all JSON files
  const files = fs.readdirSync(dataDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      fs.copyFileSync(
        path.join(dataDir, file),
        path.join(backupPath, file)
      );
    }
  });
  
  console.log(`✅ Backup created: ${backupPath}`);
}

createBackup();
```

### إضافة إلى package.json

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "backup": "node scripts/backup.js"
  }
}
```

### استخدام

```bash
# نسخ احتياطي يدوي
npm run backup

# جدولة نسخ احتياطي يومي (Linux/Mac)
crontab -e
# أضف: 0 2 * * * cd /path/to/bot && npm run backup
```

---

## مثال 9: تخصيص الرسائل

### إنشاء رسائل مخصصة

```javascript
// في src/utils/translations.js
export const translations = {
  ar: {
    // رسائل مخصصة للعبة معينة
    game: {
      castleUpgrade: '🏰 ترقية القلعة',
      researchComplete: '🔬 اكتمال البحث',
      troopsTrained: '⚔️ تدريب الجنود',
      farmFull: '🌾 المزرعة ممتلئة',
    },
    // رسائل تحفيزية
    motivational: [
      '💪 استمر! أنت تقوم بعمل رائع!',
      '🎯 هدفك قريب جداً!',
      '⭐ أداء ممتاز!',
      '🔥 لا تتوقف الآن!'
    ]
  }
};

// استخدام
import { t } from '../utils/translations.js';

const message = t('ar', 'game.castleUpgrade');
const randomMotivation = translations.ar.motivational[
  Math.floor(Math.random() * translations.ar.motivational.length)
];
```

---

## مثال 10: اختبار البوت

### اختبار يدوي

```bash
# 1. ابدأ البوت
npm start

# 2. في Discord
/setowner               # تعيين المالك
/dang                  # فتح اللوحة
# → اضغط جميع الأزرار
# → أضف حجز
# → غير اللغة
# → تحقق من التذكيرات

# 3. تحقق من السجلات
# يجب أن ترى:
# - ✅ Bot is ready!
# - ✅ Reminder system started
# - ✅ Successfully registered commands
```

### اختبار التعارض

```javascript
// Test case 1: إضافة حجزين متتاليين
// Booking 1: 2024-02-15 to 2024-02-18 (3 days) ✅
// Booking 2: 2024-02-18 to 2024-02-20 (2 days) ✅ (يبدأ عند انتهاء الأول)

// Test case 2: إضافة حجز متداخل
// Booking 1: 2024-02-15 to 2024-02-20 (5 days) ✅
// Booking 2: 2024-02-17 to 2024-02-19 (2 days) ❌ (تعارض!)
```

---

## نصائح للاستخدام الأمثل 💡

### 1. التنظيم
- استخدم الملاحظات بشكل وصفي
- حدد المواعيد مسبقاً
- راجع الحجوزات بانتظام

### 2. التواصل
- شارك جدول الحجوزات مع الفريق
- استخدم قنوات Discord للتنسيق
- فعّل التذكيرات للجميع

### 3. الصيانة
- راجع السجلات أسبوعياً
- احذف البيانات القديمة عند الحاجة
- احتفظ بنسخ احتياطية

---

## الأسئلة الشائعة ❓

**س: هل يمكن استخدام البوت في عدة سيرفرات؟**
ج: نعم، البيانات مشتركة بين جميع السيرفرات.

**س: ما حجم البيانات المدعوم؟**
ج: حتى 10,000 حجز بدون مشاكل. لأكثر من ذلك، استخدم قاعدة بيانات حقيقية.

**س: هل يمكن تخصيص الأوقات للتذكيرات؟**
ج: نعم، عدّل `src/utils/database.js` → `reminders.times`

**س: كيف أحذف جميع البيانات؟**
ج: احذف مجلد `data/` وأعد تشغيل البوت.

---

**للمزيد من الأمثلة، راجع [README.md](README.md)**
