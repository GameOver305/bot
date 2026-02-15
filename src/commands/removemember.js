import { SlashCommandBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removemember')
    .setDescription('Remove a member from the alliance (R4, R5 only) / حذف عضو من التحالف (R4, R5 فقط)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove / المستخدم المراد حذفه')
        .setRequired(true)),

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

    // Check if member exists
    const alliance = db.getAlliance();
    if (!alliance.members.some(m => m.id === targetUser.id)) {
      await interaction.reply({ 
        content: lang === 'ar'
          ? `❌ <@${targetUser.id}> ليس عضواً في التحالف`
          : `❌ <@${targetUser.id}> is not a member of the alliance`, 
        ephemeral: true 
      });
      return;
    }

    // Remove member
    db.removeMember(targetUser.id);

    await interaction.reply({ 
      content: lang === 'ar'
        ? `✅ تم إزالة <@${targetUser.id}> من التحالف`
        : `✅ <@${targetUser.id}> has been removed from the alliance`, 
      ephemeral: false 
    });
  },
};
