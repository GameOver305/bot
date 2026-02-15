import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('allianceinfo')
    .setDescription('View detailed alliance information / عرض معلومات التحالف التفصيلية'),

  async execute(interaction) {
    const user = db.getUser(interaction.user.id);
    const lang = user.language || 'en';
    const alliance = db.getAlliance();
    const users = db.getUsers();

    // Count members by rank
    const rankCounts = {
      R5: 0,
      R4: 0,
      R3: 0,
      R2: 0,
      R1: 0
    };

    alliance.members.forEach(member => {
      if (rankCounts[member.rank] !== undefined) {
        rankCounts[member.rank]++;
      }
    });

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(lang === 'ar' ? '🤝 معلومات التحالف' : '🤝 Alliance Information')
      .setTimestamp();

    // Alliance basic info
    embed.addFields(
      { 
        name: lang === 'ar' ? '📛 اسم التحالف' : '📛 Alliance Name', 
        value: alliance.name || (lang === 'ar' ? 'غير محدد' : 'Not set'), 
        inline: true 
      },
      { 
        name: lang === 'ar' ? '🏷️ الوسم' : '🏷️ Tag', 
        value: alliance.tag || (lang === 'ar' ? 'غير محدد' : 'Not set'), 
        inline: true 
      },
      { 
        name: lang === 'ar' ? '👑 القائد' : '👑 Leader', 
        value: alliance.leader ? `<@${alliance.leader}>` : (lang === 'ar' ? 'غير محدد' : 'Not set'), 
        inline: false 
      }
    );

    // Description
    if (alliance.description) {
      embed.addFields({
        name: lang === 'ar' ? '📝 الوصف' : '📝 Description',
        value: alliance.description,
        inline: false
      });
    }

    // Member statistics
    embed.addFields(
      { 
        name: lang === 'ar' ? '👥 إجمالي الأعضاء' : '👥 Total Members', 
        value: alliance.members.length.toString(), 
        inline: true 
      },
      { 
        name: lang === 'ar' ? '⭐ توزيع الرتب' : '⭐ Rank Distribution', 
        value: `**R5:** ${rankCounts.R5}\n**R4:** ${rankCounts.R4}\n**R3:** ${rankCounts.R3}\n**R2:** ${rankCounts.R2}\n**R1:** ${rankCounts.R1}`,
        inline: true 
      }
    );

    // Recent members (last 5)
    if (alliance.members.length > 0) {
      const recentMembers = alliance.members
        .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
        .slice(0, 5)
        .map(m => `<@${m.id}> - **${m.rank}**`)
        .join('\n');

      embed.addFields({
        name: lang === 'ar' ? '🆕 أحدث الأعضاء' : '🆕 Recent Members',
        value: recentMembers,
        inline: false
      });
    }

    // حساب الأعضاء النشطين (آخر 7 أيام)
    const activeMembers = users.filter(u => {
      const lastActive = u.lastActive;
      if (!lastActive) return false;
      const daysSinceActive = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 7;
    }).length;

    embed.addFields(
      {
        name: lang === 'ar' ? '✅ الأعضاء النشطون' : '✅ Active Members',
        value: `${activeMembers} / ${alliance.members.length}` + 
               (alliance.members.length > 0 ? ` (${((activeMembers/alliance.members.length)*100).toFixed(1)}%)` : ''),
        inline: true
      }
    );

    // إنشاء الأزرار
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('view_members_detailed')
          .setLabel(lang === 'ar' ? 'قائمة الأعضاء التفصيلية' : 'Detailed Members List')
          .setEmoji('👥')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('view_alliance_activity')
          .setLabel(lang === 'ar' ? 'نشاط التحالف' : 'Alliance Activity')
          .setEmoji('📊')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('export_alliance_data')
          .setLabel(lang === 'ar' ? 'تصدير البيانات' : 'Export Data')
          .setEmoji('📥')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
