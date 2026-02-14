import { SlashCommandBuilder } from 'discord.js';
import { ButtonManager } from '../handlers/buttonManager.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setNameLocalizations({
      'ar': 'لوحة'
    })
    .setDescription('Open the main control panel')
    .setDescriptionLocalizations({
      'ar': 'فتح لوحة التحكم الرئيسية'
    }),

  async execute(interaction) {
    const userId = interaction.user.id;
    const user = db.getUser(userId);
    const lang = user.language || 'ar';

    try {
      const panel = ButtonManager.createMainMenu(lang);
      await interaction.reply(panel);
    } catch (error) {
      console.error('Error executing panel command:', error);
      await interaction.reply({ 
        content: 'حدث خطأ أثناء فتح لوحة التحكم', 
        ephemeral: true 
      });
    }
  },
};
