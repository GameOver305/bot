import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import db from '../utils/database.js';
import { t } from '../utils/translations.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ministries')
    .setDescription('إدارة نظام الوزارات والأنشطة')
    .setDescriptionLocalizations({
      'en-US': 'Manage ministries and activities system'
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
        .setTitle('🏛️ نظام الوزارات / Ministries System')
        .setDescription(
          '**إدارة الوزارات والأنشطة:**\n\n' +
          '➕ **إضافة وزارة** - إنشاء وزارة جديدة\n' +
          '📋 **عرض الوزارات** - قائمة جميع الوزارات\n' +
          '✏️ **تعديل وزارة** - تحديث معلومات وزارة\n' +
          '🗑️ **حذف وزارة** - إزالة وزارة\n' +
          '📅 **جدولة نشاط** - إضافة نشاط مجدول لوزارة\n' +
          '👥 **تعيين وزير** - تعيين عضو كوزير'
        )
        .setColor('#9B59B6')
        .setTimestamp();

      const row1 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('add_ministry')
            .setLabel('إضافة وزارة')
            .setEmoji('➕')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('view_ministries')
            .setLabel('عرض الوزارات')
            .setEmoji('📋')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('edit_ministry')
            .setLabel('تعديل وزارة')
            .setEmoji('✏️')
            .setStyle(ButtonStyle.Secondary)
        );

      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('delete_ministry')
            .setLabel('حذف وزارة')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('schedule_activity')
            .setLabel('جدولة نشاط')
            .setEmoji('📅')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('assign_minister')
            .setLabel('تعيين وزير')
            .setEmoji('👥')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.reply({ 
        embeds: [embed],
        components: [row1, row2],
        ephemeral: true
      });

    } catch (error) {
      console.error('Error in ministries command:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ خطأ / Error')
        .setDescription(t(lang, 'errors.generic'))
        .setColor('#FF0000');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
