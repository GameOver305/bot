import { SlashCommandBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addmember')
    .setDescription('Add a member to the alliance (R4, R5 only) / إضافة عضو للتحالف (R4, R5 فقط)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to add / المستخدم المراد إضافته')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('rank')
        .setDescription('Member rank / رتبة العضو')
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
    
    // Check permissions
    if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
      await interaction.reply({ 
        content: '❌ ليس لديك صلاحية لتنفيذ هذا الأمر (R4, R5 فقط)', 
        ephemeral: true 
      });
      return;
    }

    const targetUser = interaction.options.getUser('user');
    const rank = interaction.options.getString('rank');

    // Check if member already exists
    const alliance = db.getAlliance();
    if (alliance.members.some(m => m.id === targetUser.id)) {
      await interaction.reply({ 
        content: `❌ <@${targetUser.id}> عضو بالفعل في التحالف`, 
        ephemeral: true 
      });
      return;
    }

    // Add member
    db.addMember({
      userId: targetUser.id,
      name: targetUser.username,
      rank
    });

    await interaction.reply({ 
      content: `✅ تم إضافة <@${targetUser.id}> للتحالف برتبة **${rank}**`, 
      ephemeral: false 
    });
  },
};
