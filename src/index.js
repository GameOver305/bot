import { Client, GatewayIntentBits, Collection, REST, Routes, Events } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { handleButtonInteraction } from './handlers/interactionHandler.js';
import { handleModalSubmit } from './handlers/modalHandler.js';
import { ReminderSystem } from './services/reminderService.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

// Load commands
client.commands = new Collection();
const commandsPath = join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  
  if ('data' in command.default && 'execute' in command.default) {
    client.commands.set(command.default.data.name, command.default);
    commands.push(command.default.data.toJSON());
  }
}

// Initialize reminder system
let reminderSystem;

// Ready event
client.on(Events.ClientReady, async () => {
  // Register slash commands after bot is ready
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  
  try {
    // Check if GUILD_ID is set for instant registration
    if (process.env.GUILD_ID && process.env.GUILD_ID !== 'YOUR_GUILD_ID_HERE') {
      console.log('🔄 جاري تسجيل الأوامر في السيرفر (فوري)...');
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
        { body: commands },
      );
      console.log('✅ تم تسجيل الأوامر في السيرفر بنجاح! (فوري)');
    } else {
      console.log('🔄 جاري تسجيل الأوامر عالمياً...');
      // Register globally (available to all servers the bot joins)
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );
      console.log('✅ تم تسجيل الأوامر عالمياً بنجاح!');
      console.log('⏱️ ملاحظة: قد يستغرق ظهور الأوامر حتى ساعة واحدة');
      console.log('💡 لتسجيل فوري: أضف GUILD_ID في ملف .env');
    }
  } catch (error) {
    console.error('❌ خطأ في تسجيل الأوامر:', error);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Bot is ready!`);
  console.log(`📝 Logged in as: ${client.user.tag}`);
  console.log(`🆔 Bot ID: ${client.user.id}`);
  console.log(`🌐 Servers: ${client.guilds.cache.size}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Set presence
  client.user.setPresence({
    activities: [{ name: '/dang للبدء | /dang to start', type: 0 }],
    status: 'online',
  });

  // Start reminder system
  reminderSystem = new ReminderSystem(client);
  reminderSystem.start();
});

// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Error executing command:', error);
      const errorMessage = 'حدث خطأ أثناء تنفيذ هذا الأمر!';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }
  // Handle button interactions
  else if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
  }
  // Handle modal submissions
  else if (interaction.isModalSubmit()) {
    await handleModalSubmit(interaction);
  }
});

// Error handling
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (reminderSystem) {
    reminderSystem.stop();
  }
  client.destroy();
  process.exit(0);
});

// Login
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});
