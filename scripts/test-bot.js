#!/usr/bin/env node
/**
 * نظام اختبار شامل للبوت
 * يختبر جميع المزايا الأساسية
 */

import db from '../src/utils/database.js';
import { translations, t } from '../src/utils/translations.js';

console.log('🧪 بدء اختبار البوت...\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passedTests++;
    return true;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.error(`   خطأ: ${error.message}`);
    failedTests++;
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// اختبارات قاعدة البيانات
console.log('📦 اختبار قاعدة البيانات:\n');

test('تهيئة قاعدة البيانات', () => {
  assert(db !== null, 'قاعدة البيانات غير متوفرة');
});

test('قراءة بيانات المستخدم', () => {
  const user = db.getUser('test_user_123');
  assert(user !== null, 'فشل في قراءة بيانات المستخدم');
  assert(user.language === 'ar', 'اللغة الافتراضية غير صحيحة');
});

test('حفظ بيانات المستخدم', () => {
  const result = db.setUser('test_user_123', { language: 'en', notifications: true });
  assert(result === true, 'فشل في حفظ بيانات المستخدم');
  const user = db.getUser('test_user_123');
  assert(user.language === 'en', 'فشل في تحديث اللغة');
});

test('إضافة حجز', () => {
  const startDate = new Date('2024-03-01');
  const endDate = new Date('2024-03-05');
  
  const booking = db.addBooking('building', {
    userId: 'test_user_123',
    userName: 'TestUser',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    duration: 4,
    notes: 'اختبار',
    status: 'active'
  });
  
  assert(booking.id !== undefined, 'فشل في إنشاء معرف الحجز');
  assert(booking.userId === 'test_user_123', 'معرف المستخدم غير صحيح');
});

test('التحقق من التعارض', () => {
  const hasConflict = db.checkConflict(
    'building',
    '2024-03-02',
    '2024-03-04'
  );
  assert(hasConflict === true, 'فشل في اكتشاف التعارض');
});

test('عدم وجود تعارض', () => {
  const hasConflict = db.checkConflict(
    'building',
    '2024-03-06',
    '2024-03-08'
  );
  assert(hasConflict === false, 'اكتشاف تعارض خاطئ');
});

test('عرض الحجوزات', () => {
  const bookings = db.getBookings('building');
  assert(bookings.length > 0, 'لا توجد حجوزات');
  assert(Array.isArray(bookings), 'نوع البيانات غير صحيح');
});

test('حذف حجز', () => {
  const bookings = db.getBookings('building');
  if (bookings.length > 0) {
    const bookingId = bookings[0].id;
    const result = db.removeBooking('building', bookingId);
    assert(result === true, 'فشل في حذف الحجز');
  }
});

// اختبارات التحالف
console.log('\n🤝 اختبار نظام التحالف:\n');

test('قراءة بيانات التحالف', () => {
  const alliance = db.getAlliance();
  assert(alliance !== null, 'فشل في قراءة بيانات التحالف');
  assert(alliance.members !== undefined, 'قائمة الأعضاء غير موجودة');
});

test('إضافة عضو للتحالف', () => {
  const result = db.addMember({
    userId: 'test_member_456',
    name: 'TestMember',
    rank: 'R3'
  });
  assert(result === true, 'فشل في إضافة عضو');
  
  const alliance = db.getAlliance();
  const member = alliance.members.find(m => m.id === 'test_member_456');
  assert(member !== undefined, 'العضو غير موجود');
  assert(member.rank === 'R3', 'الرتبة غير صحيحة');
});

test('تغيير رتبة عضو', () => {
  const result = db.updateMemberRank('test_member_456', 'R4');
  assert(result === true, 'فشل في تغيير الرتبة');
  
  const alliance = db.getAlliance();
  const member = alliance.members.find(m => m.id === 'test_member_456');
  assert(member.rank === 'R4', 'الرتبة لم يتم تحديثها');
});

test('حذف عضو من التحالف', () => {
  const result = db.removeMember('test_member_456');
  assert(result === true, 'فشل في حذف العضو');
  
  const alliance = db.getAlliance();
  const member = alliance.members.find(m => m.id === 'test_member_456');
  assert(member === undefined, 'العضو لا يزال موجوداً');
});

// اختبارات الصلاحيات
console.log('\n🛡️ اختبار نظام الصلاحيات:\n');

test('تعيين المالك', () => {
  const result = db.setOwner('test_owner_789');
  assert(result === true, 'فشل في تعيين المالك');
  
  const isOwner = db.isOwner('test_owner_789');
  assert(isOwner === true, 'التحقق من المالك فشل');
});

test('إضافة مشرف', () => {
  const result = db.addAdmin('test_admin_101');
  assert(result === true, 'فشل في إضافة مشرف');
  
  const isAdmin = db.isAdmin('test_admin_101');
  assert(isAdmin === true, 'التحقق من المشرف فشل');
});

test('حذف مشرف', () => {
  const result = db.removeAdmin('test_admin_101');
  assert(result === true, 'فشل في حذف مشرف');
  
  const isAdmin = db.isAdmin('test_admin_101');
  assert(isAdmin === false, 'المشرف لا يزال موجوداً');
});

// اختبارات الترجمة
console.log('\n🌐 اختبار نظام الترجمة:\n');

test('وجود الترجمات العربية', () => {
  assert(translations.ar !== undefined, 'الترجمات العربية غير موجودة');
  assert(translations.ar.mainMenu !== undefined, 'قائمة رئيسية غير موجودة');
});

test('وجود الترجمات الإنجليزية', () => {
  assert(translations.en !== undefined, 'الترجمات الإنجليزية غير موجودة');
  assert(translations.en.mainMenu !== undefined, 'قائمة رئيسية غير موجودة');
});

test('دالة الترجمة (العربية)', () => {
  const text = t('ar', 'mainMenu.title');
  assert(text !== undefined, 'فشل في الحصول على الترجمة');
  assert(text.length > 0, 'نص الترجمة فارغ');
});

test('دالة الترجمة (الإنجليزية)', () => {
  const text = t('en', 'mainMenu.title');
  assert(text !== undefined, 'فشل في الحصول على الترجمة');
  assert(text.length > 0, 'نص الترجمة فارغ');
});

test('استبدال المتغيرات في الترجمة', () => {
  const text = t('ar', 'bookings.details', {
    user: '@TestUser',
    start: '2024-03-01',
    end: '2024-03-05',
    duration: '4'
  });
  assert(text.includes('@TestUser'), 'فشل في استبدال المتغيرات');
  assert(text.includes('2024-03-01'), 'فشل في استبدال التاريخ');
});

// اختبارات التذكيرات
console.log('\n🔔 اختبار نظام التذكيرات:\n');

test('قراءة إعدادات التذكيرات', () => {
  const reminders = db.getReminders();
  assert(reminders !== null, 'فشل في قراءة إعدادات التذكيرات');
  assert(reminders.enabled !== undefined, 'حالة التفعيل غير موجودة');
  assert(Array.isArray(reminders.times), 'أوقات التذكير ليست مصفوفة');
});

test('تحديث إعدادات التذكيرات', () => {
  const result = db.updateReminders({ enabled: false });
  assert(result === true, 'فشل في تحديث إعدادات التذكيرات');
  
  const reminders = db.getReminders();
  assert(reminders.enabled === false, 'الإعدادات لم يتم تحديثها');
  
  // إعادة التفعيل
  db.updateReminders({ enabled: true });
});

// اختبار التنظيف
console.log('\n🧹 اختبار نظام التنظيف:\n');

test('تنظيف الحجوزات المنتهية', () => {
  // إضافة حجز منتهي
  const oldDate = new Date('2023-01-01');
  db.addBooking('training', {
    userId: 'test_user_old',
    userName: 'OldUser',
    startDate: oldDate.toISOString(),
    endDate: new Date('2023-01-05').toISOString(),
    duration: 4,
    notes: 'حجز قديم',
    status: 'active'
  });
  
  const cleaned = db.cleanupOldBookings();
  assert(cleaned >= 0, 'فشل في تنظيف الحجوزات');
});

// النتائج النهائية
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 نتائج الاختبار:');
console.log(`✅ نجح: ${passedTests}`);
console.log(`❌ فشل: ${failedTests}`);
console.log(`📈 النسبة: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (failedTests === 0) {
  console.log('🎉 جميع الاختبارات نجحت! البوت جاهز للاستخدام.\n');
  process.exit(0);
} else {
  console.log('⚠️ بعض الاختبارات فشلت. يُرجى مراجعة الأخطاء أعلاه.\n');
  process.exit(1);
}
