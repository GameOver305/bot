import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setowner')
    .setDescription('Set the bot owner (can only be used once) / تعيين مالك البوت (مرة واحدة فقط)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const perms = db.getPermissions();
    
    // Check if owner is already set
    if (perms.owner) {
      await interaction.reply({ 
        content: '❌ المالك محدد بالفعل. لا يمكن تغييره.', 
        ephemeral: true 
      });
      return;
    }

    // Set the owner
    db.setOwner(interaction.user.id);
    
    await interaction.reply({ 
      content: `✅ تم تعيينك كمالك للبوت بنجاح!\n**المالك:** <@${interaction.user.id}>`, 
      ephemeral: false 
    });
  },
};
