import { SlashCommandBuilder, PermissionFlagsBits, REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('refresh')
    .setDescription('تحديث جميع الأوامر في لوحة الاستضافة / Refresh all slash commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('scope')
        .setDescription('نطاق التحديث / Update scope')
        .setRequired(false)
        .addChoices(
          { name: '🌍 عالمي (جميع السيرفرات)', value: 'global' },
          { name: '🏠 هذا السيرفر فقط', value: 'guild' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const scope = interaction.options.getString('scope') || 'global';

    try {
      // إعادة تحميل الأوامر من الملفات
      const commandsPath = join(__dirname);
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

      const commands = [];
      for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        // استخدام timestamp لتجنب cache
        const command = await import(`file://${filePath}?update=${Date.now()}`);
        
        if ('data' in command.default && 'execute' in command.default) {
          commands.push(command.default.data.toJSON());
        }
      }

      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

      if (scope === 'global') {
        // مسح الأوامر القديمة
        await rest.put(Routes.applicationCommands(interaction.client.user.id), { body: [] });
        
        // تسجيل الأوامر الجديدة عالمياً
        await rest.put(
          Routes.applicationCommands(interaction.client.user.id),
          { body: commands }
        );

        await interaction.editReply({
          content: `✅ **تم تحديث الأوامر بنجاح!**\n\n` +
            `📊 **عدد الأوامر:** ${commands.length}\n` +
            `🌍 **النطاق:** عالمي (جميع السيرفرات)\n\n` +
            `⚠️ **ملاحظة:** قد يستغرق ظهور التغييرات حتى ساعة واحدة للأوامر العالمية.`
        });
      } else {
        // تحديث السيرفر الحالي فقط
        await rest.put(
          Routes.applicationGuildCommands(interaction.client.user.id, interaction.guildId),
          { body: [] }
        );
        
        await rest.put(
          Routes.applicationGuildCommands(interaction.client.user.id, interaction.guildId),
          { body: commands }
        );

        await interaction.editReply({
          content: `✅ **تم تحديث الأوامر بنجاح!**\n\n` +
            `📊 **عدد الأوامر:** ${commands.length}\n` +
            `🏠 **النطاق:** هذا السيرفر فقط\n\n` +
            `⚡ **ملاحظة:** التغييرات ستظهر فوراً في هذا السيرفر.`
        });
      }

      // تحديث قائمة الأوامر في الذاكرة
      interaction.client.commands.clear();
      for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = await import(`file://${filePath}?refresh=${Date.now()}`);
        
        if ('data' in command.default && 'execute' in command.default) {
          interaction.client.commands.set(command.default.data.name, command.default);
        }
      }

    } catch (error) {
      console.error('❌ خطأ في تحديث الأوامر:', error);
      await interaction.editReply({
        content: `❌ **حدث خطأ أثناء تحديث الأوامر!**\n\n\`\`\`${error.message}\`\`\``
      });
    }
  },
};
