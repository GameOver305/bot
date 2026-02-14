import { SlashCommandBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addadmin')
    .setNameLocalizations({
      'ar': 'اضافة_مشرف'
    })
    .setDescription('Add an admin (Owner only)')
    .setDescriptionLocalizations({
      'ar': 'إضافة مشرف (للمالك فقط)'
    })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ 'ar': 'المستخدم' })
        .setDescription('The user to add as admin')
        .setDescriptionLocalizations({ 'ar': 'المستخدم المراد إضافته كمشرف' })
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
    
    // Check if already admin
    if (db.isAdmin(targetUser.id)) {
      await interaction.reply({ 
        content: `❌ <@${targetUser.id}> مشرف بالفعل`, 
        ephemeral: true 
      });
      return;
    }

    // Add admin
    db.addAdmin(targetUser.id);
    
    await interaction.reply({ 
      content: `✅ تم إضافة <@${targetUser.id}> كمشرف بنجاح!`, 
      ephemeral: false 
    });
  },
};
