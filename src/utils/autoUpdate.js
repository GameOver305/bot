#!/usr/bin/env node
/**
 * سكربت التحديث التلقائي للبوت
 * يقوم بتحديث جميع الملفات من GitHub عند كل تشغيل
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// إعدادات GitHub
const REPO_OWNER = 'GameOver305';
const REPO_NAME = 'bot';
const BRANCH = 'main';

// الملفات المراد تحديثها
const FILES_TO_UPDATE = [
  'src/index.js',
  'src/handlers/buttonManager.js',
  'src/handlers/interactionHandler.js',
  'src/handlers/modalHandler.js',
  'src/utils/database.js',
  'src/utils/translations.js',
  'src/commands/dang.js',
  'src/commands/stats.js',
  'src/commands/addadmin.js',
  'src/commands/removeadmin.js',
  'src/commands/refresh.js',
  'src/services/reminderService.js',
  'package.json'
];

// ألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// تحميل ملف من GitHub
function downloadFile(filePath) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${filePath}`;
    
    https.get(url, (response) => {
      if (response.statusCode === 404) {
        resolve(null); // الملف غير موجود
        return;
      }
      if (response.statusCode === 301 || response.statusCode === 302) {
        // تتبع إعادة التوجيه
        https.get(response.headers.location, (res2) => {
          let data = '';
          res2.on('data', chunk => data += chunk);
          res2.on('end', () => resolve(data));
          res2.on('error', reject);
        }).on('error', reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// التحقق من وجود تحديثات
async function checkForUpdates() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║     🔄 نظام التحديث التلقائي للبوت     ║', 'cyan');
  log('╚════════════════════════════════════════╝\n', 'cyan');
  
  log('📡 جاري التحقق من التحديثات من GitHub...', 'yellow');
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const updatedFiles = [];
  
  for (const filePath of FILES_TO_UPDATE) {
    try {
      const content = await downloadFile(filePath);
      
      if (!content) {
        skippedCount++;
        continue;
      }
      
      const fullPath = path.join(rootDir, filePath);
      const dir = path.dirname(fullPath);
      
      // إنشاء المجلد إذا لم يكن موجوداً
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // قراءة الملف الحالي
      let currentContent = '';
      try {
        currentContent = fs.readFileSync(fullPath, 'utf8');
      } catch (e) {
        // الملف غير موجود
      }
      
      // مقارنة المحتوى
      if (content !== currentContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        updatedCount++;
        updatedFiles.push(filePath);
        log(`   ✅ تم تحديث: ${filePath}`, 'green');
      } else {
        skippedCount++;
      }
    } catch (error) {
      errorCount++;
      log(`   ❌ خطأ في ${filePath}: ${error.message}`, 'red');
    }
  }
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  if (updatedCount === 0) {
    log('✅ البوت محدث بالفعل! لا توجد تحديثات جديدة.', 'green');
  } else {
    log(`📊 نتائج التحديث:`, 'blue');
    log(`   ✅ ملفات محدثة: ${updatedCount}`, 'green');
    log(`   ⏭️ بدون تغيير: ${skippedCount}`, 'yellow');
    if (errorCount > 0) {
      log(`   ❌ أخطاء: ${errorCount}`, 'red');
    }
    
    // تثبيت المتطلبات إذا تم تحديث package.json
    if (updatedFiles.includes('package.json')) {
      log('\n📦 جاري تثبيت المتطلبات الجديدة...', 'yellow');
      try {
        await execAsync('npm install', { cwd: rootDir, timeout: 120000 });
        log('   ✅ تم تثبيت المتطلبات بنجاح!', 'green');
      } catch (npmError) {
        log(`   ⚠️ تحذير: ${npmError.message}`, 'yellow');
      }
    }
  }
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  
  return { updatedCount, skippedCount, errorCount };
}

// تشغيل التحديث
export async function runAutoUpdate() {
  try {
    const result = await checkForUpdates();
    return result;
  } catch (error) {
    log(`❌ خطأ في نظام التحديث: ${error.message}`, 'red');
    return { updatedCount: 0, skippedCount: 0, errorCount: 1 };
  }
}

// تشغيل مباشر إذا تم استدعاء الملف مباشرة
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAutoUpdate().then(() => {
    process.exit(0);
  });
}
