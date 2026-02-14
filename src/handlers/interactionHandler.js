import { ButtonManager } from './buttonManager.js';
import db from '../utils/database.js';
import { t } from '../utils/translations.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export async function handleButtonInteraction(interaction) {
  const userId = interaction.user.id;
  const user = db.getUser(userId);
  const lang = user.language || 'ar';
  const customId = interaction.customId;

  try {
    // Main menu navigation
    if (customId === 'menu_bookings') {
      await interaction.update(ButtonManager.createBookingsMenu(lang));
    } 
    else if (customId === 'menu_alliance') {
      await interaction.update(ButtonManager.createAllianceMenu(lang));
    }
    else if (customId === 'menu_settings') {
      await interaction.update(ButtonManager.createSettingsMenu(userId, lang));
    }
    else if (customId === 'menu_permissions') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: t(lang, 'permissions.ownerOnly'), ephemeral: true });
        return;
      }
      await interaction.update(ButtonManager.createPermissionsMenu(lang));
    }
    else if (customId === 'menu_help') {
      await interaction.reply({ content: 'قريباً...', ephemeral: true });
    }

    // Back buttons
    else if (customId === 'back_main') {
      await interaction.update(ButtonManager.createMainMenu(lang));
    }
    else if (customId === 'back_bookings') {
      await interaction.update(ButtonManager.createBookingsMenu(lang));
    }

    // Booking type selection
    else if (customId.startsWith('booking_') && !customId.includes('add') && !customId.includes('view')) {
      const type = customId.split('_')[1];
      await interaction.update(ButtonManager.createBookingTypeMenu(type, lang));
    }

    // Add booking
    else if (customId.startsWith('booking_add_')) {
      const type = customId.replace('booking_add_', '');
      await showBookingModal(interaction, type, lang);
    }

    // View bookings
    else if (customId.startsWith('booking_view_')) {
      const type = customId.replace('booking_view_', '');
      await showBookingsList(interaction, type, lang);
    }

    // Settings
    else if (customId === 'settings_lang_ar' || customId === 'settings_lang_en') {
      const newLang = customId.split('_')[2];
      db.setUser(userId, { language: newLang });
      await interaction.update(ButtonManager.createSettingsMenu(userId, newLang));
      await interaction.followUp({ 
        content: t(newLang, 'settings.languageChanged', { lang: newLang === 'ar' ? 'العربية' : 'English' }), 
        ephemeral: true 
      });
    }
    else if (customId === 'settings_notifications') {
      const currentStatus = user.notifications !== false;
      db.setUser(userId, { notifications: !currentStatus });
      const status = !currentStatus ? t(lang, 'settings.enabled') : t(lang, 'settings.disabled');
      await interaction.update(ButtonManager.createSettingsMenu(userId, lang));
      await interaction.followUp({ 
        content: t(lang, 'settings.notificationsToggled', { status }), 
        ephemeral: true 
      });
    }

    // Alliance members
    else if (customId === 'alliance_members') {
      await showAllianceMembers(interaction, lang);
    }
    else if (customId === 'alliance_info') {
      await interaction.update(ButtonManager.createAllianceMenu(lang));
    }

  } catch (error) {
    console.error('Error handling button interaction:', error);
    try {
      await interaction.reply({ 
        content: t(lang, 'common.error'), 
        ephemeral: true 
      });
    } catch (e) {
      console.error('Failed to send error message:', e);
    }
  }
}

async function showBookingModal(interaction, type, lang) {
  const modal = new ModalBuilder()
    .setCustomId(`booking_modal_${type}`)
    .setTitle(t(lang, `bookings.${type}`));

  const startDateInput = new TextInputBuilder()
    .setCustomId('start_date')
    .setLabel(lang === 'ar' ? 'تاريخ البداية (YYYY-MM-DD)' : 'Start Date (YYYY-MM-DD)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('2024-02-15')
    .setRequired(true);

  const durationInput = new TextInputBuilder()
    .setCustomId('duration')
    .setLabel(lang === 'ar' ? 'المدة (بالأيام)' : 'Duration (days)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('1')
    .setRequired(true);

  const notesInput = new TextInputBuilder()
    .setCustomId('notes')
    .setLabel(lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(startDateInput),
    new ActionRowBuilder().addComponents(durationInput),
    new ActionRowBuilder().addComponents(notesInput)
  );

  await interaction.showModal(modal);
}

async function showBookingsList(interaction, type, lang) {
  const bookings = db.getBookings(type);
  
  if (bookings.length === 0) {
    await interaction.reply({ 
      content: t(lang, 'bookings.empty'), 
      ephemeral: true 
    });
    return;
  }

  let message = `**📋 ${t(lang, `bookings.${type}`)}**\n\n`;
  
  bookings.forEach((booking, index) => {
    const start = new Date(booking.startDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
    const end = new Date(booking.endDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
    const duration = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
    
    message += t(lang, 'bookings.details', {
      user: `<@${booking.userId}>`,
      start,
      end,
      duration
    });
    
    if (booking.notes) {
      message += `\n${lang === 'ar' ? 'ملاحظات' : 'Notes'}: ${booking.notes}`;
    }
    message += '\n\n';
  });

  await interaction.reply({ 
    content: message, 
    ephemeral: true 
  });
}

async function showAllianceMembers(interaction, lang) {
  const alliance = db.getAlliance();
  
  if (alliance.members.length === 0) {
    await interaction.reply({ 
      content: lang === 'ar' ? 'لا يوجد أعضاء في التحالف' : 'No members in alliance', 
      ephemeral: true 
    });
    return;
  }

  let message = `**👥 ${lang === 'ar' ? 'أعضاء التحالف' : 'Alliance Members'}**\n\n`;
  
  alliance.members.forEach((member, index) => {
    message += `${index + 1}. <@${member.id}> - ${member.rank}\n`;
  });

  await interaction.reply({ 
    content: message, 
    ephemeral: true 
  });
}
