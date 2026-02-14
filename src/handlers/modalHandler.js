import db from '../utils/database.js';
import { t } from '../utils/translations.js';
import { ButtonManager } from './buttonManager.js';

export async function handleModalSubmit(interaction) {
  const userId = interaction.user.id;
  const user = db.getUser(userId);
  const lang = user.language || 'ar';
  const customId = interaction.customId;

  try {
    if (customId.startsWith('booking_modal_')) {
      const type = customId.replace('booking_modal_', '');
      await processBooking(interaction, type, lang);
    }
  } catch (error) {
    console.error('Error handling modal submit:', error);
    await interaction.reply({ 
      content: t(lang, 'common.error'), 
      ephemeral: true 
    });
  }
}

async function processBooking(interaction, type, lang) {
  const startDateStr = interaction.fields.getTextInputValue('start_date');
  const durationStr = interaction.fields.getTextInputValue('duration');
  const notes = interaction.fields.getTextInputValue('notes') || '';

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDateStr)) {
    await interaction.reply({ 
      content: lang === 'ar' 
        ? '❌ تنسيق التاريخ غير صحيح. استخدم: YYYY-MM-DD (مثال: 2024-02-15)' 
        : '❌ Invalid date format. Use: YYYY-MM-DD (example: 2024-02-15)', 
      ephemeral: true 
    });
    return;
  }

  // Validate duration
  const duration = parseInt(durationStr);
  if (isNaN(duration) || duration < 1) {
    await interaction.reply({ 
      content: lang === 'ar' 
        ? '❌ المدة يجب أن تكون رقم موجب' 
        : '❌ Duration must be a positive number', 
      ephemeral: true 
    });
    return;
  }

  // Calculate dates
  const startDate = new Date(startDateStr);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration);

  // Check for conflicts
  if (db.checkConflict(type, startDate, endDate)) {
    await interaction.reply({ 
      content: t(lang, 'bookings.conflict'), 
      ephemeral: true 
    });
    return;
  }

  // Add booking
  const booking = db.addBooking(type, {
    userId: interaction.user.id,
    userName: interaction.user.username,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    duration,
    notes,
    status: 'active'
  });

  // Schedule reminders
  scheduleReminders(interaction.client, booking, type, lang);

  // Update the original message with new booking list
  await interaction.update(ButtonManager.createBookingTypeMenu(type, lang));
  
  // Send success message
  await interaction.followUp({ 
    content: t(lang, 'bookings.success'), 
    ephemeral: true 
  });
}

function scheduleReminders(client, booking, type, lang) {
  const reminderSettings = db.getReminders();
  if (!reminderSettings.enabled) return;

  const user = db.getUser(booking.userId);
  if (user.notifications === false) return;

  const userLang = user.language || lang;
  const startTime = new Date(booking.startDate).getTime();
  const now = Date.now();

  reminderSettings.times.forEach(timeBeforeMs => {
    const reminderTime = startTime - timeBeforeMs;
    
    if (reminderTime > now) {
      const delay = reminderTime - now;
      
      setTimeout(async () => {
        try {
          const userObj = await client.users.fetch(booking.userId);
          const remaining = formatTimeRemaining(timeBeforeMs, userLang);
          const start = new Date(booking.startDate).toLocaleString(userLang === 'ar' ? 'ar-EG' : 'en-US');
          
          const message = t(userLang, 'reminders.message', {
            type: t(userLang, `reminders.types.${type}`),
            start,
            remaining
          });

          await userObj.send(message);
        } catch (error) {
          console.error('Failed to send reminder:', error);
        }
      }, delay);
    }
  });
}

function formatTimeRemaining(ms, lang) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return lang === 'ar' ? `${days} يوم` : `${days} day${days > 1 ? 's' : ''}`;
  }
  
  return lang === 'ar' ? `${hours} ساعة` : `${hours} hour${hours > 1 ? 's' : ''}`;
}

export { scheduleReminders, formatTimeRemaining };
