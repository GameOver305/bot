import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
  'src/utils/autoUpdate.js',
  'src/commands/dang.js',
  'src/commands/stats.js',
  'src/commands/addadmin.js',
  'src/commands/removeadmin.js',
  'src/commands/refresh.js',
  'src/commands/update.js',
  'src/services/reminderService.js',
  'package.json',
  'run.sh'
];

// تحميل ملف من GitHub
function downloadFile(filePath) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${filePath}`;
    
    https.get(url, (response) => {
      if (response.statusCode === 404) {
        resolve(null);
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

export default {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('تحديث البوت من GitHub / Update bot from GitHub')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('نوع التحديث / Update type')
        .setRequired(false)
        .addChoices(
          { name: '🔄 تحديث كامل (مع إعادة التشغيل)', value: 'full' },
          { name: '📥 تحميل الملفات فقط', value: 'download' },
          { name: '📊 التحقق من التحديثات', value: 'check' }
        )
    ),

  async execute(interaction) {
    const action = interaction.options.getString('action') || 'full';
    
    await interaction.deferReply({ ephemeral: true });

    try {
      if (action === 'check') {
        // التحقق فقط من وجود تحديثات
        let hasUpdates = false;
        let updatesList = [];
        
        for (const filePath of FILES_TO_UPDATE.slice(0, 5)) {
          try {
            const content = await downloadFile(filePath);
            if (content) {
              const fullPath = path.join(process.cwd(), filePath);
              let currentContent = '';
              try {
                currentContent = fs.readFileSync(fullPath, 'utf8');
              } catch (e) {}
              
              if (content !== currentContent) {
                hasUpdates = true;
                updatesList.push(filePath);
              }
            }
          } catch (e) {}
        }

        await interaction.editReply({
          content: hasUpdates
            ? `📊 **توجد تحديثات متاحة!**\n\n` +
              `📁 **ملفات تحتاج تحديث:**\n${updatesList.map(f => `• ${f}`).join('\n')}\n` +
              (updatesList.length < FILES_TO_UPDATE.length ? `• ...و${FILES_TO_UPDATE.length - updatesList.length} ملفات أخرى` : '') +
              `\n\n💡 استخدم \`/update action:تحديث كامل\` للتحديث`
            : `✅ **البوت محدث بالفعل!**\n\nلا توجد تحديثات جديدة متاحة.`
        });
        return;
      }

      // تحديث الملفات
      await interaction.editReply({ content: '🔄 **جاري تحميل التحديثات من GitHub...**' });

      let updatedCount = 0;
      let errorCount = 0;
      const updatedFiles = [];

      for (const filePath of FILES_TO_UPDATE) {
        try {
          const content = await downloadFile(filePath);
          
          if (!content) continue;
          
          const fullPath = path.join(process.cwd(), filePath);
          const dir = path.dirname(fullPath);
          
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          let currentContent = '';
          try {
            currentContent = fs.readFileSync(fullPath, 'utf8');
          } catch (e) {}
          
          if (content !== currentContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            updatedCount++;
            updatedFiles.push(filePath);
          }
        } catch (error) {
          errorCount++;
        }
      }

      if (updatedCount === 0 && errorCount === 0) {
        await interaction.editReply({
          content: `✅ **البوت محدث بالفعل!**\n\nلا توجد تحديثات جديدة.`
        });
        return;
      }

      // تثبيت المتطلبات إذا تم تحديث package.json
      if (updatedFiles.includes('package.json')) {
        await interaction.editReply({ content: '📦 **جاري تثبيت المتطلبات الجديدة...**' });
        try {
          await execAsync('npm install', { cwd: process.cwd(), timeout: 120000 });
        } catch (npmErr) {
          console.error('npm install error:', npmErr.message);
        }
      }

      if (action === 'full') {
        await interaction.editReply({
          content: `✅ **تم التحديث بنجاح!**\n\n` +
            `📁 **ملفات محدثة:** ${updatedCount}\n` +
            (errorCount > 0 ? `⚠️ **أخطاء:** ${errorCount}\n` : '') +
            `\n🔄 **جاري إعادة تشغيل البوت...**\n` +
            `⏱️ سيعود البوت خلال ثوان قليلة.`
        });

        // إعادة تشغيل البوت
        setTimeout(() => {
          process.exit(0); // PM2 أو الاستضافة ستعيد تشغيل البوت
        }, 2000);
      } else {
        await interaction.editReply({
          content: `✅ **تم تحميل التحديثات!**\n\n` +
            `📁 **ملفات محدثة:** ${updatedCount}\n` +
            (errorCount > 0 ? `⚠️ **أخطاء:** ${errorCount}\n` : '') +
            `\n💡 **ملاحظة:** أعد تشغيل البوت يدوياً لتطبيق التغييرات.`
        });
      }

    } catch (error) {
      console.error('Update error:', error);
      await interaction.editReply({
        content: `❌ **خطأ في التحديث!**\n\n\`\`\`${error.message}\`\`\``
      });
    }
  },
};
