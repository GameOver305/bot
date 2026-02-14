import { SlashCommandBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addmember')
    .setNameLocalizations({
      'ar': 'اضافة_عضو'
    })
    .setDescription('Add a member to the alliance (R4, R5 only)')
    .setDescriptionLocalizations({
      'ar': 'إضافة عضو للتحالف (R4, R5 فقط)'
    })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ 'ar': 'المستخدم' })
        .setDescription('The user to add')
        .setDescriptionLocalizations({ 'ar': 'المستخدم المراد إضافته' })
        .setRequired(true))
    .addStringOption(option =>
      option.setName('rank')
        .setNameLocalizations({ 'ar': 'الرتبة' })
        .setDescription('Member rank')
        .setDescriptionLocalizations({ 'ar': 'رتبة العضو' })
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
