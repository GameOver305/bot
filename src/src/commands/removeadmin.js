import { SlashCommandBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removeadmin')
    .setDescription('Remove an admin (Owner only) / حذف مشرف (للمالك فقط)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove from admins / المستخدم المراد حذفه من المشرفين')
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.user.id;
    
    // Check if user is owner
    if (!db.isOwner(userId)) {
      await interaction.reply({ 
        content: '❌ هذا الأمر متاح للمالك فقط', 
        ephemeral: true 
      });
      return;
    }

    const targetUser = interaction.options.getUser('user');
    
    // Remove admin
    const success = db.removeAdmin(targetUser.id);
    
    if (success) {
      await interaction.reply({ 
        content: `✅ تم حذف <@${targetUser.id}> من المشرفين`, 
        ephemeral: false 
      });
    } else {
      await interaction.reply({ 
        content: `❌ <@${targetUser.id}> ليس مشرفاً`, 
        ephemeral: true 
      });
    }
  },
};
