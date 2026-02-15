/**
 * اختبار شامل لجميع الأنظمة الجديدة
 * Comprehensive test for all new systems
 */

import { ButtonManager } from './src/handlers/buttonManager.js';
import db from './src/utils/database.js';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 بدء الاختبار الشامل | Starting Comprehensive Testing');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let passed = 0;
let failed = 0;
const errors = [];

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    errors.push({ name, error: error.message });
    failed++;
  }
}

// ==================== القسم 1: اختبار ButtonManager ====================
console.log('\n═══ 1️⃣  اختبار ButtonManager (Button Menus) ═══\n');

test('Main Menu Creation', () => {
  const menu = ButtonManager.createMainMenu('ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 4) throw new Error('Expected 4 rows of buttons');
  // التحقق من وجود جميع الأزرار
  const allButtons = menu.components.flatMap(row => row.components);
  if (allButtons.length < 10) throw new Error('Missing buttons');
});

test('Members Menu Creation', () => {
  const menu = ButtonManager.createMembersMenu('1234567890', 'ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 2) throw new Error('Expected 2 rows');
  const buttons = menu.components.flatMap(row => row.components);
  const expectedButtons = ['member_add', 'member_remove', 'member_change_rank', 'member_list_all', 'member_search', 'back_main'];
  const buttonIds = buttons.map(b => b.data.custom_id);
  for (const expected of expectedButtons) {
    if (!buttonIds.includes(expected)) throw new Error(`Missing button: ${expected}`);
  }
});

test('Ministries Menu Creation', () => {
  const menu = ButtonManager.createMinistriesMenu('1234567890', 'ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 2) throw new Error('Expected 2 rows');
  const buttons = menu.components.flatMap(row => row.components);
  const expectedButtons = ['ministry_add', 'ministry_view', 'ministry_assign', 'ministry_schedule', 'ministry_delete', 'back_main'];
  const buttonIds = buttons.map(b => b.data.custom_id);
  for (const expected of expectedButtons) {
    if (!buttonIds.includes(expected)) throw new Error(`Missing button: ${expected}`);
  }
});

test('Logs Menu Creation', () => {
  const menu = ButtonManager.createLogsMenu('1234567890', 'ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 2) throw new Error('Expected 2 rows');
  const buttons = menu.components.flatMap(row => row.components);
  const expectedButtons = ['logs_set_channel', 'logs_view_all', 'logs_clear_channel', 'back_main'];
  const buttonIds = buttons.map(b => b.data.custom_id);
  for (const expected of expectedButtons) {
    if (!buttonIds.includes(expected)) throw new Error(`Missing button: ${expected}`);
  }
});

test('Schedule Menu Creation', () => {
  const menu = ButtonManager.createScheduleMenu('1234567890', 'ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 2) throw new Error('Expected 2 rows');
  const buttons = menu.components.flatMap(row => row.components);
  const expectedButtons = ['schedule_create', 'schedule_view_all', 'schedule_alert', 'schedule_delete', 'back_main'];
  const buttonIds = buttons.map(b => b.data.custom_id);
  for (const expected of expectedButtons) {
    if (!buttonIds.includes(expected)) throw new Error(`Missing button: ${expected}`);
  }
});

test('Alliance Menu Creation', () => {
  const menu = ButtonManager.createAllianceMenu('ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 2) throw new Error('Expected 2 rows');
});

test('Bookings Menu Creation', () => {
  const menu = ButtonManager.createBookingsMenu('ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 2) throw new Error('Expected 2 rows');
});

test('Settings Menu Creation', () => {
  const menu = ButtonManager.createSettingsMenu('1234567890', 'ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 2) throw new Error('Expected 2 rows');
});

test('Permissions Menu Creation', () => {
  const menu = ButtonManager.createPermissionsMenu('ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 2) throw new Error('Expected 2 rows');
});

test('Stats Menu Creation', () => {
  const menu = ButtonManager.createStatsMenu('ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 1) throw new Error('Expected 1 row');
});

test('Help Menu Creation', () => {
  const menu = ButtonManager.createHelpMenu('ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 1) throw new Error('Expected 1 row');
});

test('Reminders Menu Creation', () => {
  const menu = ButtonManager.createRemindersMenu('1234567890', 'ar');
  if (!menu.embeds || menu.embeds.length === 0) throw new Error('No embeds');
  if (!menu.components || menu.components.length !== 2) throw new Error('Expected 2 rows');
});

// ==================== القسم 2: اختبار قاعدة البيانات ====================
console.log('\n═══ 2️⃣  اختبار قاعدة البيانات (Database Functions) ═══\n');

test('Database - Get Alliance', () => {
  const alliance = db.getAlliance();
  if (!alliance) throw new Error('Alliance not found');
  if (!Array.isArray(alliance.members)) throw new Error('Members should be array');
});

test('Database - Get User', () => {
  const user = db.getUser('1234567890');
  if (!user) throw new Error('User not found');
  if (!user.language) throw new Error('User language not set');
});

test('Database - Get Permissions', () => {
  const perms = db.getPermissions();
  if (!perms) throw new Error('Permissions not found');
  if (!Array.isArray(perms.admins)) throw new Error('Admins should be array');
});

test('Database - Get Bookings', () => {
  const bookings = db.getBookings();
  if (!bookings) throw new Error('Bookings not found');
  if (!bookings.building || !bookings.research || !bookings.training) {
    throw new Error('Missing booking types');
  }
});

test('Database - Check Admin Permission', () => {
  // Test with actual owner from permissions.json
  const perms = db.getPermissions();
  const isAdmin = db.isAdmin(perms.owner);
  if (!isAdmin) throw new Error('Owner should be admin');
});

test('Database - Has Alliance Permission', () => {
  // Test permission check function exists
  const hasFunc = typeof db.hasAlliancePermission === 'function';
  if (!hasFunc) throw new Error('hasAlliancePermission function not found');
});

test('Database - Get Ministries', () => {
  const ministries = db.getMinistries();
  if (ministries === undefined) throw new Error('getMinistries returned undefined');
  if (!Array.isArray(ministries)) throw new Error('Ministries should be array');
});

test('Database - Get Recent Logs', () => {
  const logs = db.getRecentLogs(5);
  if (logs === undefined) throw new Error('getRecentLogs returned undefined');
  if (!Array.isArray(logs)) throw new Error('Logs should be array');
});

test('Database - Get Scheduled Bookings', () => {
  const schedules = db.getScheduledBookings();
  if (schedules === undefined) throw new Error('getScheduledBookings returned undefined');
  if (!Array.isArray(schedules)) throw new Error('Schedules should be array');
});

// ==================== القسم 3: اختبار المكونات الأخرى ====================
console.log('\n═══ 3️⃣  اختبار المكونات الإضافية (Additional Components) ═══\n');

test('Database - Add Member Function', () => {
  const hasFunc = typeof db.addMember === 'function';
  if (!hasFunc) throw new Error('addMember function not found');
});

test('Database - Remove Member Function', () => {
  const hasFunc = typeof db.removeMember === 'function';
  if (!hasFunc) throw new Error('removeMember function not found');
});

test('Database - Change Member Rank Function', () => {
  const hasFunc = typeof db.updateMemberRank === 'function';
  if (!hasFunc) throw new Error('updateMemberRank function not found');
});

test('Database - Add Ministry Function', () => {
  const hasFunc = typeof db.addMinistry === 'function';
  if (!hasFunc) throw new Error('addMinistry function not found');
});

test('Database - Delete Ministry Function', () => {
  const hasFunc = typeof db.removeMinistry === 'function';
  if (!hasFunc) throw new Error('removeMinistry function not found');
});

test('Database - Assign Minister Function', () => {
  const hasFunc = typeof db.assignMinister === 'function';
  if (!hasFunc) throw new Error('assignMinister function not found');
});

test('Database - Set Log Channel Function', () => {
  const hasFunc = typeof db.setLogChannel === 'function';
  if (!hasFunc) throw new Error('setLogChannel function not found');
});

test('Database - Get Log Channel Function', () => {
  const hasFunc = typeof db.getLogChannel === 'function';
  if (!hasFunc) throw new Error('getLogChannel function not found');
});

test('Database - Add Alliance Log Function', () => {
  const hasFunc = typeof db.addAllianceLog === 'function';
  if (!hasFunc) throw new Error('addAllianceLog function not found');
});

test('Database - Add Advanced Activity Function', () => {
  const hasFunc = typeof db.addAdvancedActivity === 'function';
  if (!hasFunc) throw new Error('addAdvancedActivity function not found');
});

test('Database - Add Scheduled Booking Function', () => {
  const hasFunc = typeof db.addScheduledBooking === 'function';
  if (!hasFunc) throw new Error('addScheduledBooking function not found');
});

// ==================== القسم 4: اختبار الملفات ====================
console.log('\n═══ 4️⃣  اختبار وجود الملفات (File Existence) ═══\n');

import { existsSync } from 'fs';

test('Command File - dang.js exists', () => {
  if (!existsSync('./src/commands/dang.js')) throw new Error('dang.js not found');
});

test('Command File - panel.js removed', () => {
  if (existsSync('./src/commands/panel.js')) throw new Error('panel.js still exists (should be removed)');
});

test('Handler File - buttonManager.js exists', () => {
  if (!existsSync('./src/handlers/buttonManager.js')) throw new Error('buttonManager.js not found');
});

test('Handler File - interactionHandler.js exists', () => {
  if (!existsSync('./src/handlers/interactionHandler.js')) throw new Error('interactionHandler.js not found');
});

test('Handler File - modalHandler.js exists', () => {
  if (!existsSync('./src/handlers/modalHandler.js')) throw new Error('modalHandler.js not found');
});

// ==================== النتائج النهائية ====================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 نتائج الاختبار | Test Results');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`✅ نجح (Passed): ${passed}`);
console.log(`❌ فشل (Failed): ${failed}`);
console.log(`📈 المجموع (Total): ${passed + failed}`);
console.log(`🎯 نسبة النجاح (Success Rate): ${((passed / (passed + failed)) * 100).toFixed(2)}%\n`);

if (errors.length > 0) {
  console.log('❌ الأخطاء المكتشفة | Detected Errors:\n');
  errors.forEach((err, i) => {
    console.log(`${i + 1}. ${err.name}`);
    console.log(`   ${err.error}\n`);
  });
}

if (failed === 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 جميع الاختبارات نجحت! | All Tests Passed!');
  console.log('✅ البوت جاهز للاستخدام | Bot Ready to Use');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
} else {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  بعض الاختبارات فشلت | Some Tests Failed');
  console.log('🔧 يرجى مراجعة الأخطاء أعلاه | Please Review Errors Above');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(1);
}
