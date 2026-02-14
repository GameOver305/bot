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
      reminders: path.join(this.dataDir, 'reminders.json')
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
    return users[userId] || { language: 'ar', notifications: true };
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
      return this.write('alliance', alliance);
    }
    return false;
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
  getReminders() {
    return this.read('reminders');
  }

  updateReminders(data) {
    const reminders = this.read('reminders');
    return this.write('reminders', { ...reminders, ...data });
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
}

export default new Database();
