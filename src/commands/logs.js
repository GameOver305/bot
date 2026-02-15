import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import db from '../utils/database.js';
import { t } from '../utils/translations.js';

export default {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('إدارة نظام سجلات التحالف')
    .setDescriptionLocalizations({
      'en-US': 'Manage alliance log system'
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

      // إنشاء قائمة الخيارات
      const embed = new EmbedBuilder()
        .setTitle('📜 نظام سجلات التحالف / Alliance Log System')
        .setDescription(
          '**اختر إجراء من القائمة:**\n\n' +
          '🔧 **تعيين قناة السجلات** - تحديد قناة لإرسال سجلات التحالف\n' +
          '📊 **عرض قناة السجلات** - عرض القناة المحددة حالياً\n' +
          '🗑️ **إزالة قناة السجلات** - إلغاء تفعيل نظام السجلات\n' +
          '📖 **عرض السجلات** - استعراض آخر 10 أحداث'
        )
        .setColor('#4A90E2')
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('set_log_channel')
            .setLabel('تعيين قناة السجلات')
            .setEmoji('🔧')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('view_log_channel')
            .setLabel('عرض القناة')
            .setEmoji('📊')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('remove_log_channel')
            .setLabel('إزالة القناة')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Danger)
        );

      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('view_recent_logs')
            .setLabel('عرض آخر السجلات')
            .setEmoji('📖')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.reply({ 
        embeds: [embed],
        components: [row, row2],
        ephemeral: true
      });

    } catch (error) {
      console.error('Error in logs command:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ خطأ / Error')
        .setDescription(t(lang, 'errors.generic'))
        .setColor('#FF0000');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
