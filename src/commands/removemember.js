import { SlashCommandBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removemember')
    .setNameLocalizations({
      'ar': 'حذف_عضو'
    })
    .setDescription('Remove a member from the alliance (R4, R5 only)')
    .setDescriptionLocalizations({
      'ar': 'حذف عضو من التحالف (R4, R5 فقط)'
    })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ 'ar': 'المستخدم' })
        .setDescription('The user to remove')
        .setDescriptionLocalizations({ 'ar': 'المستخدم المراد حذفه' })
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.user.id;
    
    // Check permissions
    if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
      await interaction.reply({ 
        content: '❌ ليس لديك صلاحية لتنفيذ هذا الأمر (R4, R5 فقط)', 
        ephemeral: true 
      });
      return;
    }

    const targetUser = interaction.options.getUser('user');

    // Check if member exists
    const alliance = db.getAlliance();
    if (!alliance.members.some(m => m.id === targetUser.id)) {
      await interaction.reply({ 
        content: `❌ <@${targetUser.id}> ليس عضواً في التحالف`, 
        ephemeral: true 
      });
      return;
    }

    // Remove member
    db.removeMember(targetUser.id);

    await interaction.reply({ 
      content: `✅ تم إزالة <@${targetUser.id}> من التحالف`, 
      ephemeral: false 
    });
  },
};
