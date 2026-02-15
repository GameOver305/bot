import { SlashCommandBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('changerank')
    .setDescription('Change a member\'s rank (R4, R5 only) / تغيير رتبة عضو (R4, R5 فقط)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to change rank / المستخدم المراد تغيير رتبته')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('rank')
        .setDescription('New rank / الرتبة الجديدة')
        .setRequired(true)
        .addChoices(
          { name: 'R1', value: 'R1' },
          { name: 'R2', value: 'R2' },
          { name: 'R3', value: 'R3' },
          { name: 'R4', value: 'R4' },
          { name: 'R5 (القائد)', value: 'R5' }
        )),

  async execute(interaction) {
    const userId = interaction.user.id;
    const user = db.getUser(userId);
    const lang = user.language || 'en';
    
    // Check permissions
    if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
      await interaction.reply({ 
        content: lang === 'ar'
          ? '❌ ليس لديك صلاحية لتنفيذ هذا الأمر (R4, R5 فقط)'
          : '❌ You don\'t have permission to execute this command (R4, R5 only)', 
        ephemeral: true 
      });
      return;
    }

    const targetUser = interaction.options.getUser('user');
    const newRank = interaction.options.getString('rank');

    // Check if member exists
    const alliance = db.getAlliance();
    const member = alliance.members.find(m => m.id === targetUser.id);
    
    if (!member) {
      await interaction.reply({ 
        content: lang === 'ar'
          ? `❌ <@${targetUser.id}> ليس عضواً في التحالف`
          : `❌ <@${targetUser.id}> is not a member of the alliance`, 
        ephemeral: true 
      });
      return;
    }

    const oldRank = member.rank;

    // Change rank
    db.updateMemberRank(targetUser.id, newRank);

    await interaction.reply({ 
      content: lang === 'ar'
        ? `✅ تم تغيير رتبة <@${targetUser.id}> من **${oldRank}** إلى **${newRank}**`
        : `✅ <@${targetUser.id}>\'s rank has been changed from **${oldRank}** to **${newRank}**`, 
      ephemeral: false 
    });
  },
};
