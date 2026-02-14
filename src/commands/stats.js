import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setNameLocalizations({
      'ar': 'احصائيات'
    })
    .setDescription('View bot statistics')
    .setDescriptionLocalizations({
      'ar': 'عرض إحصائيات البوت'
    }),

  async execute(interaction) {
    const user = db.getUser(interaction.user.id);
    const lang = user.language || 'ar';

    const allBookings = db.getBookings();
    const alliance = db.getAlliance();
    const perms = db.getPermissions();
    const allUsers = db.read('users');
    
    const totalBookings = allBookings.building.length + allBookings.research.length + allBookings.training.length;
    const totalUsers = Object.keys(allUsers).length;

    const embed = new EmbedBuilder()
      .setColor('#00ffff')
      .setTitle(lang === 'ar' ? '📊 إحصائيات البوت' : '📊 Bot Statistics')
      .setDescription(lang === 'ar' ? 'إحصائيات الاستخدام الحالية' : 'Current usage statistics')
      .addFields(
        { name: '🏗️ حجوزات البناء', value: allBookings.building.length.toString(), inline: true },
        { name: '🔬 حجوزات الأبحاث', value: allBookings.research.length.toString(), inline: true },
        { name: '⚔️ حجوزات التدريب', value: allBookings.training.length.toString(), inline: true },
        { name: '📝 إجمالي الحجوزات', value: totalBookings.toString(), inline: true },
        { name: '👥 أعضاء التحالف', value: alliance.members.length.toString(), inline: true },
        { name: '👮 المشرفين', value: perms.admins.length.toString(), inline: true },
        { name: '👤 المستخدمين النشطين', value: totalUsers.toString(), inline: true },
        { name: '🤝 اسم التحالف', value: alliance.name || (lang === 'ar' ? 'غير محدد' : 'Not set'), inline: true },
        { name: '🏷️ وسم التحالف', value: alliance.tag || (lang === 'ar' ? 'غير محدد' : 'Not set'), inline: true }
      )
      .setFooter({ text: lang === 'ar' ? 'تحديث مباشر' : 'Live update' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
