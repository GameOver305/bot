import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import db from '../utils/database.js';
import { t } from '../utils/translations.js';

export default {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('إدارة جدولة الحجوزات والأنشطة المتقدمة')
    .setDescriptionLocalizations({
      'en-US': 'Manage advanced booking schedules and activities'
    }),

  async execute(interaction) {
    const lang = interaction.locale?.startsWith('ar') ? 'ar' : 'en';
    
    try {
      // التحقق من الصلاحيات
      const hasPermission = db.checkPermission(interaction.user.id, 'admin');
      
      if (!hasPermission) {
        const embed = new EmbedBuilder()
          .setTitle('🚫 ' + t(lang, 'errors.noPermission'))
          .setDescription(t(lang, 'errors.adminOnly'))
          .setColor('#FF6B6B');

        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('📅 نظام الجدولة المتقدم / Advanced Schedule System')
        .setDescription(
          '**إدارة الحجوزات والجداول:**\n\n' +
          '🔔 **إنشاء تنبيه مجدول** - إضافة تنبيه متكرر\n' +
          '📊 **عرض الجداول** - عرض جميع الجداول النشطة\n' +
          '✏️ **تعديل جدول** - تحديث جدول موجود\n' +
          '🗑️ **حذف جدول** - إلغاء جدول\n' +
          '⏰ **جدولة نشاط** - حجز نشاط في وقت محدد\n' +
          '🔄 **تكرار تلقائي** - تفعيل التكرار للحجوزات'
        )
        .setColor('#E67E22')
        .setTimestamp();

      const row1 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('create_scheduled_alert')
            .setLabel('إنشاء تنبيه')
            .setEmoji('🔔')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('view_schedules')
            .setLabel('عرض الجداول')
            .setEmoji('📊')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('edit_schedule')
            .setLabel('تعديل جدول')
            .setEmoji('✏️')
            .setStyle(ButtonStyle.Secondary)
        );

      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('delete_schedule')
            .setLabel('حذف جدول')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('schedule_activity_advanced')
            .setLabel('جدولة نشاط')
            .setEmoji('⏰')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('toggle_auto_repeat')
            .setLabel('تكرار تلقائي')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.reply({ 
        embeds: [embed],
        components: [row1, row2],
        ephemeral: true
      });

    } catch (error) {
      console.error('Error in schedule command:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ خطأ / Error')
        .setDescription(t(lang, 'errors.generic'))
        .setColor('#FF0000');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
