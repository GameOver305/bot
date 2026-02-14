import cron from 'node-cron';
import db from '../utils/database.js';

export class ReminderSystem {
  constructor(client) {
    this.client = client;
    this.scheduledReminders = new Map();
  }

  start() {
    // Check for reminders every hour
    cron.schedule('0 * * * *', () => {
      this.checkAndSendReminders();
    });

    // Cleanup old bookings daily at midnight
    cron.schedule('0 0 * * *', () => {
      this.cleanupOldBookings();
    });

    console.log('✅ Reminder system started');
  }

  async checkAndSendReminders() {
    const reminderSettings = db.getReminders();
    if (!reminderSettings.enabled) return;

    const now = Date.now();
    const allBookings = db.getBookings();

    for (const [type, bookings] of Object.entries(allBookings)) {
      for (const booking of bookings) {
        const startTime = new Date(booking.startDate).getTime();
        
        // Skip past bookings
        if (startTime < now) continue;

        const user = db.getUser(booking.userId);
        if (user.notifications === false) continue;

        // Check each reminder time
        for (const timeBeforeMs of reminderSettings.times) {
          const reminderTime = startTime - timeBeforeMs;
          
          // If reminder should be sent within the next hour
          if (reminderTime > now && reminderTime <= now + 3600000) {
            const reminderId = `${booking.id}_${timeBeforeMs}`;
            
            // Check if already scheduled
            if (!this.scheduledReminders.has(reminderId)) {
              this.scheduleReminder(booking, type, timeBeforeMs, user.language || 'ar');
              this.scheduledReminders.set(reminderId, true);
            }
          }
        }
      }
    }
  }

  scheduleReminder(booking, type, timeBeforeMs, lang) {
    const startTime = new Date(booking.startDate).getTime();
    const reminderTime = startTime - timeBeforeMs;
    const now = Date.now();
    const delay = reminderTime - now;

    if (delay <= 0) return;

    setTimeout(async () => {
      try {
        const user = await this.client.users.fetch(booking.userId);
        const start = new Date(booking.startDate).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
        const remaining = this.formatTimeRemaining(timeBeforeMs, lang);
        
        const typeNames = {
          ar: {
            building: 'مواعيد البناء',
            research: 'مواعيد الأبحاث',
            training: 'مواعيد التدريب'
          },
          en: {
            building: 'Building Schedule',
            research: 'Research Schedule',
            training: 'Training Schedule'
          }
        };

        const typeName = typeNames[lang][type];
        
        const message = `🔔 **${lang === 'ar' ? 'تذكير بالحجز' : 'Booking Reminder'}**\n\n` +
                       `⏰ ${lang === 'ar' ? 'لديك حجز في' : 'You have a booking in'} **${typeName}**\n` +
                       `📅 **${lang === 'ar' ? 'البداية' : 'Start'}:** ${start}\n` +
                       `⏳ **${lang === 'ar' ? 'المتبقي' : 'Remaining'}:** ${remaining}`;

        if (booking.notes) {
          message += `\n📝 **${lang === 'ar' ? 'ملاحظات' : 'Notes'}:** ${booking.notes}`;
        }

        await user.send(message);
        console.log(`✅ Reminder sent to ${booking.userName} for ${type} booking`);
      } catch (error) {
        console.error('Failed to send reminder:', error);
      }
    }, delay);
  }

  formatTimeRemaining(ms, lang) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return lang === 'ar' ? `${days} يوم` : `${days} day${days > 1 ? 's' : ''}`;
    }
    
    return lang === 'ar' ? `${hours} ساعة` : `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  cleanupOldBookings() {
    const cleaned = db.cleanupOldBookings();
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old bookings`);
    }
  }

  stop() {
    this.scheduledReminders.clear();
    console.log('⏹️ Reminder system stopped');
  }
}
