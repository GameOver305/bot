# 🎮 Discord Booking Bot - v2.0

A comprehensive Discord bot for managing alliance bookings, member information, and automated reminders with full multi-language support.

## ✨ What's New in v2.0

### 🔧 Major Improvements:
- ✅ **Enhanced Booking System**: Now includes Member Name, User ID, Alliance Name, and Duration
- ✅ **Default Language Changed**: English is now the default language (previously Arabic)
- ✅ **Quick Language Switcher**: Added language toggle button directly on main menu
- ✅ **Better Data Display**: Improved booking information layout
- ✅ **One-Command Deployment**: New `deploy.sh` script handles everything automatically
- ✅ **Fixed All Button Interactions**: All buttons now work properly
- ✅ **Enhanced Error Handling**: Better validation and user feedback

## 📋 Features

### 🎯 Core Features:
- 📅 **Booking System**: Manage Building, Research, and Training schedules
- 🤝 **Alliance Management**: Track alliance members, ranks, and information
- 🔔 **Smart Reminders**: Automatic notifications (24h, 6h, 3h, 1h before events)
- 🌐 **Multi-Language**: Full support for English and Arabic (easy switching)
- 🛡️ **Permission System**: Owner, Admin, and Moderator roles
- 📊 **Statistics Dashboard**: Track all bookings and alliance metrics
- ❓ **Interactive Help**: Comprehensive in-bot help system

### 📝 Booking Information Includes:
- 👤 **Member Name**: Custom name for each booking
- 🆔 **User ID**: Discord user mention
- 🤝 **Alliance Name**: Alliance affiliation
- 📅 **Start Date**: Booking start date
- 📅 **End Date**: Calculated end date
- ⏱️ **Duration**: Number of days (auto-calculated)
- 📝 **Notes**: Optional additional information

## 🚀 Quick Start (One Command!)

### Prerequisites:
- Node.js 16+ installed
- Discord Bot Token ([Get one here](https://discord.com/developers/applications))

### Installation:

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd bot
```

2. **Configure your bot token:**
```bash
# Edit .env file and add your DISCORD_TOKEN
nano .env
# or
vim .env
```

3. **Run the deployment script:**
```bash
./deploy.sh
```

That's it! The script will:
- ✅ Check Node.js and npm versions
- ✅ Install all dependencies
- ✅ Fix security vulnerabilities
- ✅ Initialize database files
- ✅ Validate configuration
- ✅ Test bot startup
- ✅ Offer to start the bot automatically

## 📦 Manual Installation (Alternative)

If you prefer manual setup:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and add your DISCORD_TOKEN

# 3. Create data directory
mkdir -p data

# 4. Start the bot
npm start
```

## 🔐 Configuration

### Required Settings (.env):
```env
DISCORD_TOKEN=your_bot_token_here
```

### Optional Settings:
```env
# For instant command registration (recommended for development)
GUILD_ID=your_server_id_here

# Owner ID (can also be set via /setowner command)
OWNER_ID=your_user_id_here
```

### Getting Your Bot Token:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing
3. Go to "Bot" section
4. Click "Reset Token" and copy the token
5. **Important**: Enable these Privileged Gateway Intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### Getting Server/Guild ID:
1. Enable Developer Mode in Discord: Settings → Advanced → Developer Mode
2. Right-click on your server name
3. Click "Copy Server ID"

## 🎮 Usage

### Main Commands:
- `/panel` - Open the main control panel (all features accessible from here!)

### First-Time Setup:
1. Run `/panel` to open the main menu
2. Go to Permissions → Set yourself as owner using `/setowner @you`
3. Configure your alliance information in Alliance menu
4. Start adding bookings!

### Adding a Booking:
1. `/panel` → Bookings → Choose type (Building/Research/Training)
2. Click "➕ Add Booking"
3. Fill in the form:
   - **Member Name**: Enter the member's name
   - **Alliance Name**: Enter alliance name
   - **Duration**: Number of days
   - **Start Date**: YYYY-MM-DD format
   - **Notes**: Optional additional info

### Language Switching:
**Two ways to switch language:**
1. **Quick Switch**: Click the language button on main menu (🇺🇸/🇸🇦)
2. **Settings Menu**: `/panel` → Settings → Choose language

## 📊 Features in Detail

### 📅 Booking System:
- **Three Categories**: Building, Research, Training
- **Conflict Detection**: Prevents overlapping bookings
- **View All**: See complete booking lists with all details
- **Delete Own**: Users can delete their own bookings
- **Admin Override**: Admins can delete any booking
- **Rich Display**: Shows member name, alliance, duration, and dates

### 🤝 Alliance System:
- Store alliance name, tag, description
- Member management with ranks (R5, R4, R3, R2, R1)
- Track join dates
- R4 and R5 can manage members
- Commands: `/addmember`, `/removemember`, `/changerank`

### 🔔 Reminder System:
- Automatic DM reminders at: 24h, 6h, 3h, 1h before booking
- Can be enabled/disabled per user
- Shows remaining time and booking details
- Supports both languages

### 🛡️ Permission System:
- **Owner**: Full control (set via `/setowner`)
- **Admins**: Can manage bookings and members
- **Members**: Can create and manage own bookings
- Commands: `/addadmin`, `/removeadmin`

## 🖥️ Deployment Options

### Option 1: Direct Run (Development)
```bash
node src/index.js
```

### Option 2: npm start (Production)
```bash
npm start
```

### Option 3: PM2 (Recommended for Production)
```bash
pm2 start src/index.js --name discord-bot
pm2 save
pm2 startup  # Enable auto-restart on system reboot
```

### Option 4: Docker
```bash
docker-compose up -d
```

### Option 5: Cloud Platforms
- **Railway**: Use `railway.json` config
- **Render**: Use `render.yaml` config
- **Heroku**: Use `Procfile`

## 🔧 Troubleshooting

### Bot doesn't respond:
1. Check if bot is online in Discord
2. Verify DISCORD_TOKEN is correct in .env
3. Make sure all Privileged Intents are enabled
4. Wait up to 1 hour for global commands (or add GUILD_ID for instant)

### Commands not showing:
- If NO GUILD_ID: Wait up to 1 hour for global registration
- If WITH GUILD_ID: Commands appear instantly in that server
- Verify bot has proper permissions in your server

### Buttons not working:
✅ Fixed in v2.0! If still having issues:
- Restart the bot
- Check console for errors
- Verify bot has "Use Application Commands" permission

### Database issues:
```bash
# Reset all data (WARNING: Deletes everything!)
rm -rf data/*.json
./deploy.sh
```

## 📁 Project Structure

```
bot/
├── src/
│   ├── index.js                 # Main bot entry point
│   ├── commands/                # Slash commands
│   │   ├── panel.js            # Main panel command
│   │   ├── addadmin.js         # Admin management
│   │   ├── addmember.js        # Alliance member management
│   │   ├── changerank.js       # Rank management
│   │   └── stats.js            # Statistics command
│   ├── handlers/               # Event handlers
│   │   ├── buttonManager.js   # Button interactions & menus
│   │   ├── interactionHandler.js # Button click handlers
│   │   └── modalHandler.js    # Form submissions
│   ├── services/               # Background services
│   │   └── reminderService.js # Reminder scheduling
│   └── utils/                  # Utilities
│       ├── database.js        # JSON database manager
│       └── translations.js    # Multi-language support
├── data/                       # Database files (auto-created)
│   ├── users.json             # User preferences
│   ├── bookings.json          # All bookings
│   ├── alliance.json          # Alliance info
│   ├── permissions.json       # Admin/owner permissions
│   └── reminders.json         # Reminder settings
├── deploy.sh                  # 🆕 One-command deployment script
├── .env                       # Configuration (create from .env.example)
└── package.json              # Dependencies

```

## 🌐 Language Support

### Default Language: English
All new users will see English by default.

### Switching Languages:
- **English** 🇺🇸: Click the 🇸🇦 العربية button
- **Arabic** 🇸🇦: Click the 🇺🇸 English button

### Supported Languages:
- ✅ English (Default)
- ✅ العربية (Arabic)

## 🔄 Updates & Changelog

### v2.0.0 (Current)
- ✨ Enhanced booking system with member name, ID, alliance, and duration
- 🌐 Changed default language from Arabic to English
- 🔘 Added quick language switcher button on main menu
- 📊 Improved booking display with better formatting
- 🚀 Created comprehensive deployment script (deploy.sh)
- 🐛 Fixed all button interaction issues
- ✅ Better error handling and validation
- 📝 Enhanced booking information display

### v1.0.0
- Initial release
- Basic booking system
- Alliance management
- Reminder system
- Multi-language support (Arabic default)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Feel free to use and modify!

## 💬 Support

Need help? 
- Check the `/panel` → Help menu in Discord
- Review TROUBLESHOOTING.md
- Open an issue on GitHub
- Check the documentation files

## 🙏 Credits

Developed with ❤️ for Discord alliance management
- Discord.js library
- Node.js community
- All contributors

---

**Enjoy your new and improved Discord Booking Bot!** 🎉

*For detailed deployment guides, see DEPLOYMENT.md*
*For more examples, see EXAMPLES.md*
*For help, see TROUBLESHOOTING.md*
