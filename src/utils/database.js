import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.files = {
      users: path.join(this.dataDir, 'users.json'),
      bookings: path.join(this.dataDir, 'bookings.json'),
      alliance: path.join(this.dataDir, 'alliance.json'),
      permissions: path.join(this.dataDir, 'permissions.json'),
      reminders: path.join(this.dataDir, 'reminders.json'),
      alliance_logs: path.join(this.dataDir, 'alliance_logs.json'),
      ministries: path.join(this.dataDir, 'ministries.json'),
      advanced_bookings: path.join(this.dataDir, 'advanced_bookings.json'),
      guilds: path.join(this.dataDir, 'guilds.json'),
      button_layout: path.join(this.dataDir, 'button_layout.json')
    };
    
    // Cache for faster reads
    this.cache = {};
    this.cacheTime = {};
    this.cacheTTL = 5000; // 5 seconds cache
    
    this.init();
  }

  init() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize files with default data
    const defaults = {
      users: {},
      bookings: {
        building: [],
        research: [],
        training: []
      },
      alliance: {
        name: '',
        tag: '',
        leader: '',
        members: [],
        description: ''
      },
      permissions: {
        owner: '',
        admins: [],
        moderators: []
      },
      reminders: {
        enabled: true,
        times: [86400000, 21600000, 10800000, 3600000] // 24h, 6h, 3h, 1h in milliseconds
      },
      alliance_logs: {
        logChannels: {},
        logs: []
      },
      ministries: {
        ministries: [],
        schedules: []
      },
      advanced_bookings: {
        activities: [],
        schedules: [],
        notifications: []
      },
      guilds: {
        registered: [],
        settings: {}
      },
      button_layout: {
        rows: [
          ['menu_alliance', 'menu_bookings', 'menu_members'],
          ['menu_ministries', 'menu_logs', 'menu_schedule'],
          ['menu_permissions', 'menu_reminders', 'menu_stats'],
          ['menu_settings', 'menu_help', 'lang_switch']
        ]
      }
    };

    for (const [key, file] of Object.entries(this.files)) {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(defaults[key], null, 2));
      }
    }
  }

  read(type) {
    try {
      // Check cache first
      const now = Date.now();
      if (this.cache[type] && this.cacheTime[type] && (now - this.cacheTime[type] < this.cacheTTL)) {
        return this.cache[type];
      }
      
      const data = fs.readFileSync(this.files[type], 'utf8');
      const parsed = JSON.parse(data);
      
      // Update cache
      this.cache[type] = parsed;
      this.cacheTime[type] = now;
      
      return parsed;
    } catch (error) {
      console.error(`Error reading ${type}:`, error);
      return null;
    }
  }

  write(type, data) {
    try {
      fs.writeFileSync(this.files[type], JSON.stringify(data, null, 2));
      // Update cache immediately
      this.cache[type] = data;
      this.cacheTime[type] = Date.now();
      return true;
    } catch (error) {
      console.error(`Error writing ${type}:`, error);
      return false;
    }
  }
  
  // Clear cache for a type
  clearCache(type = null) {
    if (type) {
      delete this.cache[type];
      delete this.cacheTime[type];
    } else {
      this.cache = {};
      this.cacheTime = {};
    }
  }

  // User preferences
  getUser(userId) {
    const users = this.read('users');
    const defaultLang = users._defaultLanguage || 'en';
    return users[userId] || { language: defaultLang, notifications: true };
  }
  
  // Get user language (always uses default if not explicitly set)
  getUserLanguage(userId) {
    const users = this.read('users');
    const defaultLang = users._defaultLanguage || 'en';
    const user = users[userId];
    // If user hasn't explicitly changed language, use default
    if (!user || !user.languageSet) {
      return defaultLang;
    }
    return user.language || defaultLang;
  }

  setUser(userId, data) {
    const users = this.read('users');
    users[userId] = { ...users[userId], ...data };
    return this.write('users', users);
  }
  
  // Set user language explicitly
  setUserLanguage(userId, lang) {
    const users = this.read('users');
    if (!users[userId]) {
      users[userId] = { notifications: true };
    }
    users[userId].language = lang;
    users[userId].languageSet = true; // Mark as explicitly set
    return this.write('users', users);
  }
  
  // Apply default language to all users who haven't set their own
  applyDefaultLanguageToAll(lang) {
    const users = this.read('users');
    users._defaultLanguage = lang;
    // Reset languageSet flag for all users so they get new default
    for (const key in users) {
      if (key.startsWith('_')) continue; // Skip internal keys
      if (users[key] && !users[key].languageSet) {
        users[key].language = lang;
      }
    }
    return this.write('users', users);
  }

  // Bookings
  getBookings(type = null) {
    const bookings = this.read('bookings');
    return type ? bookings[type] : bookings;
  }

  addBooking(type, booking) {
    const bookings = this.read('bookings');
    booking.id = Date.now().toString();
    booking.createdAt = new Date().toISOString();
    bookings[type].push(booking);
    this.write('bookings', bookings);
    return booking;
  }

  removeBooking(type, bookingId) {
    const bookings = this.read('bookings');
    bookings[type] = bookings[type].filter(b => b.id !== bookingId);
    return this.write('bookings', bookings);
  }

  checkConflict(type, startDate, endDate, excludeId = null) {
    const bookings = this.read('bookings');
    const typeBookings = bookings[type];
    
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return typeBookings.some(booking => {
      if (excludeId && booking.id === excludeId) return false;
      
      const bookingStart = new Date(booking.startDate).getTime();
      const bookingEnd = new Date(booking.endDate).getTime();
      
      return (start < bookingEnd && end > bookingStart);
    });
  }

  // Alliance
  getAlliance() {
    return this.read('alliance');
  }

  updateAlliance(data) {
    const alliance = this.read('alliance');
    return this.write('alliance', { ...alliance, ...data });
  }

  addMember(member) {
    const alliance = this.read('alliance');
    alliance.members.push({
      id: member.userId,
      discordId: member.userId,
      gameId: member.gameId || '',
      name: member.name,
      gameName: member.gameName || member.name,
      rank: member.rank || 'R1',
      power: member.power || 0,
      furnaceLevel: member.furnaceLevel || 0,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });
    return this.write('alliance', alliance);
  }

  // Update member with game info
  updateMember(memberId, data) {
    const alliance = this.read('alliance');
    const index = alliance.members.findIndex(m => m.id === memberId || m.discordId === memberId);
    if (index !== -1) {
      alliance.members[index] = { ...alliance.members[index], ...data, lastActive: new Date().toISOString() };
      return this.write('alliance', alliance);
    }
    return false;
  }

  // Get member by game ID or discord ID
  getMember(id) {
    const alliance = this.read('alliance');
    return alliance.members.find(m => m.id === id || m.discordId === id || m.gameId === id);
  }

  // Cleanup expired bookings
  cleanupExpiredBookings() {
    const bookings = this.read('bookings');
    const now = Date.now();
    let cleaned = 0;
    
    for (const type of ['building', 'research', 'training', 'ministry']) {
      if (bookings[type]) {
        const before = bookings[type].length;
        bookings[type] = bookings[type].filter(b => {
          const endTime = new Date(b.endDate || b.date + ' ' + b.time).getTime();
          return endTime > now;
        });
        cleaned += before - bookings[type].length;
      }
    }
    
    if (cleaned > 0) {
      this.write('bookings', bookings);
      console.log(`🧹 تنظيف تلقائي: حذف ${cleaned} موعد منتهي`);
    }
    return cleaned;
  }

  // Custom texts management
  getCustomTexts() {
    const users = this.read('users');
    return users._customTexts || {
      mainTitle: { ar: '🎮 لوحة التحكم الرئيسية', en: '🎮 Main Control Panel' },
      allianceTitle: { ar: '🤝 التحالف', en: '🤝 Alliance' },
      membersTitle: { ar: '👥 الأعضاء', en: '👥 Members' },
      welcomeMessage: { ar: 'مرحباً بك في نظام إدارة التحالف', en: 'Welcome to Alliance Management System' }
    };
  }

  setCustomText(key, arText, enText) {
    const users = this.read('users');
    if (!users._customTexts) users._customTexts = {};
    users._customTexts[key] = { ar: arText, en: enText };
    return this.write('users', users);
  }

  // Bot version management
  getBotVersion() {
    const users = this.read('users');
    return users._botVersion || '2.4.0';
  }

  setBotVersion(version) {
    const users = this.read('users');
    users._botVersion = version;
    return this.write('users', users);
  }

  // Banned users management
  getBannedUsers() {
    const users = this.read('users');
    return users._bannedUsers || [];
  }

  banUser(userId, reason = '') {
    const users = this.read('users');
    if (!users._bannedUsers) users._bannedUsers = [];
    if (!users._bannedUsers.find(b => b.userId === userId)) {
      users._bannedUsers.push({
        userId,
        reason,
        bannedAt: new Date().toISOString()
      });
      this.write('users', users);
    }
    return true;
  }

  unbanUser(userId) {
    const users = this.read('users');
    if (!users._bannedUsers) return false;
    const before = users._bannedUsers.length;
    users._bannedUsers = users._bannedUsers.filter(b => b.userId !== userId);
    if (users._bannedUsers.length < before) {
      this.write('users', users);
      return true;
    }
    return false;
  }

  isUserBanned(userId) {
    const bannedUsers = this.getBannedUsers();
    return bannedUsers.some(b => b.userId === userId);
  }

  // Activity logs
  getActivityLogs() {
    const users = this.read('users');
    return users._activityLogs || [];
  }

  addActivityLog(action, userId, details = {}) {
    const users = this.read('users');
    if (!users._activityLogs) users._activityLogs = [];
    users._activityLogs.push({
      timestamp: new Date().toISOString(),
      action,
      user: userId,
      details
    });
    // Keep only last 100 logs
    if (users._activityLogs.length > 100) {
      users._activityLogs = users._activityLogs.slice(-100);
    }
    return this.write('users', users);
  }

  removeMember(userId) {
    const alliance = this.read('alliance');
    alliance.members = alliance.members.filter(m => m.id !== userId);
    return this.write('alliance', alliance);
  }

  updateMemberRank(userId, rank) {
    const alliance = this.read('alliance');
    const member = alliance.members.find(m => m.id === userId);
    if (member) {
      member.rank = rank;
      this.write('alliance', alliance);
      return { success: true, member };
    }
    return { success: false, message: 'Member not found' };
  }

  changeMemberRank(userId, rank) {
    return this.updateMemberRank(userId, rank);
  }

  // Permissions
  getPermissions() {
    return this.read('permissions');
  }

  setOwner(userId) {
    const perms = this.read('permissions');
    perms.owner = userId;
    return this.write('permissions', perms);
  }

  addAdmin(userId) {
    const perms = this.read('permissions');
    if (!perms.admins.includes(userId)) {
      perms.admins.push(userId);
      return this.write('permissions', perms);
    }
    return false;
  }

  removeAdmin(userId) {
    const perms = this.read('permissions');
    perms.admins = perms.admins.filter(id => id !== userId);
    return this.write('permissions', perms);
  }

  isOwner(userId) {
    const perms = this.read('permissions');
    const envOwnerId = process.env.OWNER_ID;
    const permOwnerId = perms.owner;
    
    // Convert both to string for comparison
    const userIdStr = String(userId);
    const envOwnerStr = envOwnerId ? String(envOwnerId).trim() : '';
    const permOwnerStr = permOwnerId ? String(permOwnerId).trim() : '';
    
    // Debug logging
    console.log(`[isOwner] userId: "${userIdStr}" | envOwner: "${envOwnerStr}" | permOwner: "${permOwnerStr}"`);
    console.log(`[isOwner] Match env: ${userIdStr === envOwnerStr} | Match perm: ${userIdStr === permOwnerStr}`);
    
    return userIdStr === permOwnerStr || userIdStr === envOwnerStr;
  }

  isAdmin(userId) {
    const perms = this.read('permissions');
    // Check if user is admin or owner (from permissions or .env)
    return perms.admins.includes(userId) || perms.admins.includes(String(userId)) || this.isOwner(userId);
  }

  hasAlliancePermission(userId) {
    const alliance = this.read('alliance');
    const member = alliance.members.find(m => m.id === userId);
    return member && ['R5', 'R4'].includes(member.rank);
  }

  // Reminders
  getReminders(userId = null) {
    const data = this.read('reminders');
    if (userId) {
      // Return user-specific reminders
      const users = this.read('users');
      return users[userId]?.reminders || [];
    }
    return data;
  }

  addReminder(userId, reminder) {
    const users = this.read('users');
    if (!users[userId]) users[userId] = { language: 'en', notifications: true };
    if (!users[userId].reminders) users[userId].reminders = [];
    
    users[userId].reminders.push(reminder);
    return this.write('users', users);
  }

  removeReminder(userId, reminderId) {
    const users = this.read('users');
    if (!users[userId] || !users[userId].reminders) return false;
    
    users[userId].reminders = users[userId].reminders.filter(r => r.id !== reminderId);
    return this.write('users', users);
  }

  updateReminders(data) {
    const reminders = this.read('reminders');
    return this.write('reminders', { ...reminders, ...data });
  }

  // Alliance Management
  setAllianceInfo(updates) {
    const alliance = this.read('alliance');
    Object.assign(alliance, updates);
    return this.write('alliance', alliance);
  }

  setAllianceLeader(userId) {
    const alliance = this.read('alliance');
    alliance.leader = userId;
    return this.write('alliance', alliance);
  }

  addAllianceMember(userId, rank) {
    const alliance = this.read('alliance');
    alliance.members.push({
      id: userId,
      rank: rank,
      joinedAt: new Date().toISOString()
    });
    return this.write('alliance', alliance);
  }

  removeAllianceMember(userId) {
    const alliance = this.read('alliance');
    alliance.members = alliance.members.filter(m => m.id !== userId);
    
    // If removed user was leader, clear leader
    if (alliance.leader === userId) {
      alliance.leader = '';
    }
    
    return this.write('alliance', alliance);
  }

  changeAllianceRank(userId, newRank) {
    const alliance = this.read('alliance');
    const member = alliance.members.find(m => m.id === userId);
    
    if (member) {
      member.rank = newRank;
      return this.write('alliance', alliance);
    }
    
    return false;
  }

  // Cleanup old bookings
  cleanupOldBookings() {
    const bookings = this.read('bookings');
    const now = new Date().getTime();
    let cleaned = 0;

    for (const type of ['building', 'research', 'training']) {
      const before = bookings[type].length;
      bookings[type] = bookings[type].filter(booking => {
        const endDate = new Date(booking.endDate).getTime();
        return endDate > now;
      });
      cleaned += before - bookings[type].length;
    }

    if (cleaned > 0) {
      this.write('bookings', bookings);
    }

    return cleaned;
  }

  // Alliance Logs
  getAllianceLogs() {
    return this.read('alliance_logs');
  }

  addAllianceLog(action, userId, details = {}) {
    const logs = this.read('alliance_logs');
    const log = {
      id: Date.now().toString(),
      action,
      userId,
      details,
      timestamp: new Date().toISOString()
    };
    logs.logs.push(log);
    
    // Keep only last 1000 logs
    if (logs.logs.length > 1000) {
      logs.logs = logs.logs.slice(-1000);
    }
    
    this.write('alliance_logs', logs);
    return log;
  }

  setLogChannel(guildId, channelId) {
    const logs = this.read('alliance_logs');
    logs.logChannels[guildId] = channelId;
    return this.write('alliance_logs', logs);
  }

  getLogChannel(guildId) {
    const logs = this.read('alliance_logs');
    return logs.logChannels[guildId];
  }

  removeLogChannel(guildId) {
    const logs = this.read('alliance_logs');
    delete logs.logChannels[guildId];
    return this.write('alliance_logs', logs);
  }

  getRecentLogs(limit = 10) {
    const logs = this.read('alliance_logs');
    return logs.logs.slice(-limit).reverse();
  }

  // Ministries
  getMinistries() {
    const data = this.read('ministries');
    return data.ministries;
  }

  addMinistry(name, description, minister = null) {
    const data = this.read('ministries');
    const ministry = {
      id: Date.now().toString(),
      name,
      description,
      minister,
      createdAt: new Date().toISOString()
    };
    data.ministries.push(ministry);
    this.write('ministries', data);
    return ministry;
  }

  updateMinistry(id, updates) {
    const data = this.read('ministries');
    const ministry = data.ministries.find(m => m.id === id);
    if (ministry) {
      Object.assign(ministry, updates);
      return this.write('ministries', data);
    }
    return false;
  }

  removeMinistry(id) {
    const data = this.read('ministries');
    data.ministries = data.ministries.filter(m => m.id !== id);
    // Remove related schedules
    data.schedules = data.schedules.filter(s => s.ministryId !== id);
    return this.write('ministries', data);
  }

  deleteMinistry(name) {
    const data = this.read('ministries');
    const ministry = data.ministries.find(m => m.name.toLowerCase() === name.toLowerCase());
    if (!ministry) {
      return { success: false, message: 'Ministry not found' };
    }
    data.ministries = data.ministries.filter(m => m.id !== ministry.id);
    // Remove related schedules
    data.schedules = data.schedules.filter(s => s.ministryId !== ministry.id);
    this.write('ministries', data);
    return { success: true, ministry };
  }

  assignMinister(ministryId, userId) {
    const data = this.read('ministries');
    const ministry = data.ministries.find(m => m.id === ministryId);
    if (ministry) {
      ministry.minister = userId;
      return this.write('ministries', data);
    }
    return false;
  }

  addMinistrySchedule(ministryId, activity, time, repeat = false) {
    const data = this.read('ministries');
    const schedule = {
      id: Date.now().toString(),
      ministryId,
      activity,
      time,
      repeat,
      createdAt: new Date().toISOString()
    };
    data.schedules.push(schedule);
    this.write('ministries', data);
    return schedule;
  }

  getMinistrySchedules(ministryId = null) {
    const data = this.read('ministries');
    return ministryId 
      ? data.schedules.filter(s => s.ministryId === ministryId)
      : data.schedules;
  }

  removeMinistrySchedule(id) {
    const data = this.read('ministries');
    data.schedules = data.schedules.filter(s => s.id !== id);
    return this.write('ministries', data);
  }

  // Advanced Bookings
  getAdvancedBookings() {
    return this.read('advanced_bookings');
  }

  addAdvancedActivity(name, description, duration) {
    const data = this.read('advanced_bookings');
    const activity = {
      id: Date.now().toString(),
      name,
      description,
      duration,
      createdAt: new Date().toISOString()
    };
    data.activities.push(activity);
    this.write('advanced_bookings', data);
    return activity;
  }

  addScheduledBooking(activityId, startTime, userId, repeat = false, repeatInterval = null) {
    const data = this.read('advanced_bookings');
    const schedule = {
      id: Date.now().toString(),
      activityId,
      startTime,
      userId,
      repeat,
      repeatInterval,
      createdAt: new Date().toISOString()
    };
    data.schedules.push(schedule);
    this.write('advanced_bookings', data);
    return schedule;
  }

  getScheduledBookings(activityId = null) {
    const data = this.read('advanced_bookings');
    return activityId
      ? data.schedules.filter(s => s.activityId === activityId)
      : data.schedules;
  }

  removeScheduledBooking(id) {
    const data = this.read('advanced_bookings');
    data.schedules = data.schedules.filter(s => s.id !== id);
    return this.write('advanced_bookings', data);
  }

  addBookingNotification(scheduleId, notifyBefore) {
    const data = this.read('advanced_bookings');
    const notification = {
      id: Date.now().toString(),
      scheduleId,
      notifyBefore,
      sent: false,
      createdAt: new Date().toISOString()
    };
    data.notifications.push(notification);
    this.write('advanced_bookings', data);
    return notification;
  }

  // Helper: Get all users
  getUsers() {
    return this.read('users');
  }

  // Helper: Check permission
  checkPermission(userId, level = 'admin') {
    const perms = this.read('permissions');
    
    if (level === 'owner') {
      return perms.owner === userId;
    }
    
    if (level === 'admin') {
      return perms.owner === userId || perms.admins.includes(userId);
    }
    
    if (level === 'moderator') {
      return perms.owner === userId || 
             perms.admins.includes(userId) || 
             (perms.moderators && perms.moderators.includes(userId));
    }
    
    return false;
  }

  // Guild (Server) Management
  getGuilds() {
    return this.read('guilds') || { registered: [], settings: {} };
  }

  addGuild(guildId, guildName) {
    const data = this.getGuilds();
    if (!data.registered.find(g => g.id === guildId)) {
      data.registered.push({ 
        id: guildId, 
        name: guildName, 
        addedAt: Date.now() 
      });
      this.write('guilds', data);
      return { success: true, guild: { id: guildId, name: guildName } };
    }
    return { success: false, message: 'Guild already registered' };
  }

  removeGuild(guildId) {
    const data = this.getGuilds();
    const index = data.registered.findIndex(g => g.id === guildId);
    if (index !== -1) {
      const removed = data.registered.splice(index, 1)[0];
      this.write('guilds', data);
      return { success: true, guild: removed };
    }
    return { success: false, message: 'Guild not found' };
  }

  // Button Layout Management
  getButtonLayout() {
    return this.read('button_layout') || {
      rows: [
        ['menu_alliance', 'menu_bookings', 'menu_members'],
        ['menu_ministries', 'menu_logs', 'menu_schedule'],
        ['menu_permissions', 'menu_reminders', 'menu_stats'],
        ['menu_settings', 'menu_help', 'lang_switch']
      ]
    };
  }

  updateButtonLayout(newLayout) {
    return this.write('button_layout', newLayout);
  }

  setButtonLayout(newLayout) {
    return this.updateButtonLayout(newLayout);
  }

  resetButtonLayout() {
    const defaultLayout = {
      rows: [
        ['menu_alliance', 'menu_bookings', 'menu_members'],
        ['menu_ministries', 'menu_logs', 'menu_schedule'],
        ['menu_permissions', 'menu_reminders', 'menu_stats'],
        ['menu_settings', 'menu_help', 'lang_switch']
      ]
    };
    return this.write('button_layout', defaultLayout);
  }

  // About data management
  getAboutData() {
    const data = this.read('users');
    return data._about || { content: '' };
  }

  setAboutData(content) {
    const data = this.read('users');
    data._about = { content, updatedAt: new Date().toISOString() };
    return this.write('users', data);
  }

  // Default language management
  getDefaultLanguage() {
    const data = this.read('users');
    return data._defaultLanguage || 'en';
  }

  setDefaultLanguage(lang) {
    const data = this.read('users');
    data._defaultLanguage = lang;
    return this.write('users', data);
  }

  // Custom labels management
  getCustomLabels(userId) {
    const user = this.getUser(userId);
    return user.customLabels || {};
  }

  saveCustomLabels(userId, labels) {
    return this.setUser(userId, { customLabels: labels });
  }

  // Save bookings for ministry type
  saveBookings(type, bookings) {
    const allBookings = this.read('bookings');
    allBookings[type] = bookings;
    return this.write('bookings', allBookings);
  }
}

export default new Database();
