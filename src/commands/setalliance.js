import { SlashCommandBuilder } from 'discord.js';
import db from '../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setalliance')
    .setDescription('Set alliance information (R5, Admin only) / تعيين معلومات التحالف (R5، المشرفين فقط)')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Alliance name / اسم التحالف')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('tag')
        .setDescription('Alliance tag / وسم التحالف')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Alliance description / وصف التحالف')
        .setRequired(false)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const user = db.getUser(userId);
    const lang = user.language || 'en';
    
    // Check permissions - Only R5 or Admin can modify alliance info
    const alliance = db.getAlliance();
    const member = alliance.members.find(m => m.id === userId);
    const isR5 = member && member.rank === 'R5';
    
    if (!isR5 && !db.isAdmin(userId)) {
      await interaction.reply({ 
        content: lang === 'ar' 
          ? '❌ ليس لديك صلاحية لتنفيذ هذا الأمر (R5، المشرفين فقط)' 
          : '❌ You don\'t have permission to execute this command (R5, Admins only)', 
        ephemeral: true 
      });
      return;
    }

    const name = interaction.options.getString('name');
    const tag = interaction.options.getString('tag');
    const description = interaction.options.getString('description');

    // Check if at least one option is provided
    if (!name && !tag && !description) {
      await interaction.reply({ 
        content: lang === 'ar'
          ? '❌ يجب تقديم معلومة واحدة على الأقل (name, tag, أو description)'
          : '❌ You must provide at least one option (name, tag, or description)', 
        ephemeral: true 
      });
      return;
    }

    // Update alliance info
    const updates = {};
    if (name) updates.name = name;
    if (tag) updates.tag = tag;
    if (description) updates.description = description;

    db.updateAlliance(updates);

    // Build response message
    let response = lang === 'ar' 
      ? '✅ تم تحديث معلومات التحالف:\n' 
      : '✅ Alliance information updated:\n';
    
    if (name) response += `\n**${lang === 'ar' ? 'الاسم' : 'Name'}:** ${name}`;
    if (tag) response += `\n**${lang === 'ar' ? 'الوسم' : 'Tag'}:** ${tag}`;
    if (description) response += `\n**${lang === 'ar' ? 'الوصف' : 'Description'}:** ${description}`;

    await interaction.reply({ 
      content: response, 
      ephemeral: false 
    });
  },
};
