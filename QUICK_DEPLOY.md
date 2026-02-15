# 🚀 Quick Deployment Guide

## One-Command Deployment (Recommended!)

### For Linux/Mac:
```bash
./deploy.sh
```

### For Windows:
```bash
# Install dependencies
npm install

# Start the bot
npm start
```

---

## What the deploy.sh Script Does:

✅ Checks Node.js and npm installation  
✅ Validates your configuration (.env file)  
✅ Installs all required dependencies  
✅ Fixes security vulnerabilities  
✅ Creates and initializes database files  
✅ Tests bot configuration  
✅ Offers to start the bot automatically

---

## Quick Setup (3 Steps):

### 1️⃣ Get Your Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create application → Bot section → Reset Token
3. **Enable all Privileged Intents**:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 2️⃣ Configure .env
```bash
# Open .env file
nano .env

# Add your token
DISCORD_TOKEN=your_bot_token_here

# Optional: Add for instant commands
GUILD_ID=your_server_id_here
```

### 3️⃣ Deploy
```bash
./deploy.sh
```

---

## 🎯 For Hosting Platforms:

### Railway:
```bash
# Already configured! Just:
1. Connect your GitHub repo
2. Add DISCORD_TOKEN in environment variables
3. Deploy automatically
```

### Render:
```bash
# Using render.yaml:
1. Connect repo
2. Set DISCORD_TOKEN
3. Auto-deploys
```

### Heroku:
```bash
heroku create
git push heroku main
heroku config:set DISCORD_TOKEN=your_token
```

### VPS (Ubuntu/Debian):
```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone and setup
git clone <your-repo>
cd bot
./deploy.sh

# 3. Run with PM2 (keeps running)
npm install -g pm2
pm2 start src/index.js --name discord-bot
pm2 save
pm2 startup
```

---

## 📋 Post-Deployment Checklist:

After bot starts:

1. ✅ Invite bot to your server (with proper permissions)
2. ✅ Run `/panel` command
3. ✅ Set yourself as owner: Go to Permissions menu
4. ✅ Test language switcher button
5. ✅ Add a test booking
6. ✅ Configure alliance info

---

## 🔧 Troubleshooting:

### Bot doesn't respond:
```bash
# Check if running
ps aux | grep "node src/index.js"

# Check logs
tail -f bot.log  # if using nohup
pm2 logs discord-bot  # if using pm2
```

### Commands not appearing:
- No GUILD_ID: Wait up to 60 minutes (global registration)
- With GUILD_ID: Instant (restart bot if needed)

### Permission errors:
- Make sure bot has "Administrator" or at minimum:
  - Send Messages
  - Embed Links
  - Use Application Commands
  - Read Message History

---

## 🔄 Updating to v2.0:

If you have an older version:

```bash
# 1. Backup your data
cp -r data data_backup

# 2. Pull latest changes
git pull origin main

# 3. Run deployment script
./deploy.sh

# 4. Restart bot
pm2 restart discord-bot
# or
pkill -f "node src/index.js" && npm start
```

---

## 📱 Docker Deployment:

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🎉 Success Indicators:

When properly deployed, you should see:
```
✅ Bot is ready!
📝 Logged in as: YourBot#1234
🆔 Bot ID: 123456789
🌐 Servers: 1
✅ Reminder system started
```

---

## 💡 Pro Tips:

1. **For Production**: Always use PM2 or Docker
2. **For Development**: Use `node src/index.js` directly
3. **Add GUILD_ID** for testing (instant commands)
4. **Regular Backups**: `tar -czf backup_$(date +%Y%m%d).tar.gz data/`
5. **Monitor Logs**: Keep an eye on errors
6. **Update Regularly**: `git pull && ./deploy.sh`

---

## 📞 Need Help?

- Check [README_V2.md](README_V2.md) for detailed docs
- Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Check bot console logs for errors
- Verify all Privileged Intents are enabled

---

**Happy Deploying! 🚀**
