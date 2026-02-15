import { Client, GatewayIntentBits, Collection, REST, Routes, Events } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { handleButtonInteraction, handleSelectMenuInteraction } from './handlers/interactionHandler.js';
import { handleModalSubmit } from './handlers/modalHandler.js';
import { ReminderSystem } from './services/reminderService.js';
import db from './utils/database.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
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

// Function to register commands to a guild
async function registerCommandsToGuild(rest, guildId) {
  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: commands },
    );
    console.log(`✅ تم تسجيل الأوامر في السيرفر: ${guildId}`);
    return true;
  } catch (error) {
    console.error(`❌ خطأ في تسجيل الأوامر للسيرفر ${guildId}:`, error.message);
    return false;
  }
}

// Ready event
client.on(Events.ClientReady, async () => {
  // Register slash commands after bot is ready
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  
  try {
    // Clear old commands first to prevent duplicates
    console.log('🗑️ جاري مسح الأوامر القديمة...');
    
    // Clear global commands
    await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
    
    // Clear guild-specific commands for all guilds the bot is in
    for (const [guildId] of client.guilds.cache) {
      try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: [] });
      } catch (e) {
        // Ignore errors for guilds we can't access
      }
    }
    
    console.log('✅ تم مسح الأوامر القديمة');
    
    // Register commands globally only (prevents duplicates)
    console.log('🔄 جاري تسجيل الأوامر عالمياً...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('✅ تم تسجيل الأوامر عالمياً بنجاح! (قد يستغرق ظهورها ساعة)');
    
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

// Auto-register commands when bot joins a new guild
client.on(Events.GuildCreate, async (guild) => {
  console.log(`🎉 تمت إضافة البوت إلى سيرفر جديد: ${guild.name} (${guild.id})`);
  
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  await registerCommandsToGuild(rest, guild.id);
  
  // Auto-add to registered guilds
  db.addGuild(guild.id, guild.name);
  console.log(`✅ تم تسجيل السيرفر تلقائياً: ${guild.name}`);
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
  // Handle select menu interactions (String, User, Channel)
  else if (interaction.isStringSelectMenu() || interaction.isUserSelectMenu() || interaction.isChannelSelectMenu()) {
    await handleSelectMenuInteraction(interaction);
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
