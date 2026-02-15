import { SlashCommandBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setleader')
    .setDescription('Set alliance leader (Admin only) / تعيين قائد التحالف (المشرفين فقط)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to set as leader / المستخدم المراد تعيينه كقائد')
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const user = db.getUser(userId);
    const lang = user.language || 'en';
    
    // Check permissions - Only admins can set leader
    if (!db.isAdmin(userId)) {
      await interaction.reply({ 
        content: lang === 'ar'
          ? '❌ ليس لديك صلاحية لتنفيذ هذا الأمر (المشرفين فقط)'
          : '❌ You don\'t have permission to execute this command (Admins only)', 
        ephemeral: true 
      });
      return;
    }

    const targetUser = interaction.options.getUser('user');
    const alliance = db.getAlliance();

    // Check if user is a member
    const member = alliance.members.find(m => m.id === targetUser.id);
    
    if (!member) {
      await interaction.reply({ 
        content: lang === 'ar'
          ? `❌ <@${targetUser.id}> ليس عضواً في التحالف. أضفه أولاً باستخدام /addmember`
          : `❌ <@${targetUser.id}> is not a member of the alliance. Add them first using /addmember`, 
        ephemeral: true 
      });
      return;
    }

    // Update leader
    db.updateAlliance({ leader: targetUser.id });
    
    // Automatically set rank to R5
    db.updateMemberRank(targetUser.id, 'R5');

    await interaction.reply({ 
      content: lang === 'ar'
        ? `✅ تم تعيين <@${targetUser.id}> كقائد للتحالف برتبة **R5**`
        : `✅ <@${targetUser.id}> has been set as alliance leader with rank **R5**`, 
      ephemeral: false 
    });
  },
};
