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
      advanced_bookings: path.join(this.dataDir, 'advanced_bookings.json')
    };
    
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
      const data = fs.readFileSync(this.files[type], 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${type}:`, error);
      return null;
    }
  }

  write(type, data) {
    try {
      fs.writeFileSync(this.files[type], JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${type}:`, error);
      return false;
    }
  }

  // User preferences
  getUser(userId) {
    const users = this.read('users');
    return users[userId] || { language: 'en', notifications: true };
  }

  setUser(userId, data) {
    const users = this.read('users');
    users[userId] = { ...users[userId], ...data };
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
      name: member.name,
      rank: member.rank || 'R1',
      joinedAt: new Date().toISOString()
    });
    return this.write('alliance', alliance);
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
    return perms.owner === userId;
  }

  isAdmin(userId) {
    const perms = this.read('permissions');
    return perms.admins.includes(userId) || perms.owner === userId;
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
}

export default new Database();
