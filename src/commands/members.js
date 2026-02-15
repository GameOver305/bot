import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('members')
    .setDescription('View all alliance members / عرض جميع أعضاء التحالف')
    .addStringOption(option =>
      option.setName('rank')
        .setDescription('Filter by rank / تصفية حسب الرتبة')
        .setRequired(false)
        .addChoices(
          { name: 'R5', value: 'R5' },
          { name: 'R4', value: 'R4' },
          { name: 'R3', value: 'R3' },
          { name: 'R2', value: 'R2' },
          { name: 'R1', value: 'R1' }
        )),

  async execute(interaction) {
    const user = db.getUser(interaction.user.id);
    const lang = user.language || 'en';
    const alliance = db.getAlliance();
    const filterRank = interaction.options.getString('rank');

    if (alliance.members.length === 0) {
      await interaction.reply({ 
        content: lang === 'ar' 
          ? '📭 لا يوجد أعضاء في التحالف حالياً' 
          : '📭 No members in the alliance currently', 
        ephemeral: true 
      });
      return;
    }

    // Filter members if rank is specified
    let members = alliance.members;
    if (filterRank) {
      members = members.filter(m => m.rank === filterRank);
      
      if (members.length === 0) {
        await interaction.reply({ 
          content: lang === 'ar' 
            ? `📭 لا يوجد أعضاء برتبة ${filterRank}` 
            : `📭 No members with rank ${filterRank}`, 
          ephemeral: true 
        });
        return;
      }
    }

    // Sort by rank (R5 first) then by join date
    const rankOrder = { R5: 5, R4: 4, R3: 3, R2: 2, R1: 1 };
    members.sort((a, b) => {
      const rankDiff = (rankOrder[b.rank] || 0) - (rankOrder[a.rank] || 0);
      if (rankDiff !== 0) return rankDiff;
      return new Date(b.joinedAt) - new Date(a.joinedAt);
    });

    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(filterRank 
        ? (lang === 'ar' ? `👥 أعضاء ${filterRank}` : `👥 ${filterRank} Members`)
        : (lang === 'ar' ? '👥 جميع أعضاء التحالف' : '👥 All Alliance Members'))
      .setDescription(lang === 'ar' 
        ? `إجمالي الأعضاء: **${members.length}**` 
        : `Total Members: **${members.length}**`)
      .setTimestamp();

    // Split members into fields (max 25 fields per embed)
    const chunkedMembers = [];
    const chunkSize = 10; // 10 members per field
    
    for (let i = 0; i < members.length; i += chunkSize) {
      chunkedMembers.push(members.slice(i, i + chunkSize));
    }

    chunkedMembers.forEach((chunk, index) => {
      const memberList = chunk.map((member, idx) => {
        const num = (index * chunkSize) + idx + 1;
        const joinDate = new Date(member.joinedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        return `**${num}.** <@${member.id}> - **${member.rank}**\n    ${lang === 'ar' ? 'انضم' : 'Joined'}: ${joinDate}`;
      }).join('\n\n');

      embed.addFields({
        name: index === 0 ? (lang === 'ar' ? '📋 القائمة' : '📋 List') : '\u200b',
        value: memberList,
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
