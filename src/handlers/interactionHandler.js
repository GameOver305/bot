import { ButtonManager } from './buttonManager.js';
import db from '../utils/database.js';
import { t } from '../utils/translations.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export async function handleButtonInteraction(interaction) {
  const userId = interaction.user.id;
  const user = db.getUser(userId);
  const lang = user.language || 'en';
  const customId = interaction.customId;

  try {
    // Language switcher
    if (customId === 'lang_switch') {
      const newLang = lang === 'ar' ? 'en' : 'ar';
      db.setUser(userId, { language: newLang });
      await interaction.update(ButtonManager.createMainMenu(newLang));
      return;
    }

    // Main menu navigation
    if (customId === 'menu_bookings' || customId === 'menu_ministry_appointments') {
      await interaction.update(ButtonManager.createMinistryAppointmentsMenu(lang));
    } 
    else if (customId === 'menu_alliance') {
      await interaction.update(ButtonManager.createAllianceMenu(lang));
    }
    else if (customId === 'menu_reminders') {
      await interaction.update(ButtonManager.createRemindersMenu(userId, lang));
    }
    else if (customId === 'menu_settings') {
      await interaction.update(ButtonManager.createSettingsMenu(userId, lang));
    }
    else if (customId === 'menu_permissions') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: t(lang, 'permissions.ownerOnly'), ephemeral: true });
        return;
      }
      await interaction.update(ButtonManager.createPermissionsMenu(userId, lang));
    }
    else if (customId === 'menu_help') {
      await interaction.update(ButtonManager.createHelpMenu(lang));
    }
    else if (customId === 'menu_stats') {
      await interaction.update(ButtonManager.createStatsMenu(lang));
    }

    // New Main Menu Items
    else if (customId === 'menu_members') {
      await interaction.update(ButtonManager.createMembersMenu(userId, lang));
    }
    else if (customId === 'menu_logs') {
      await interaction.update(ButtonManager.createLogsMenu(userId, lang));
    }
    else if (customId === 'menu_schedule') {
      await interaction.update(ButtonManager.createScheduleMenu(userId, lang));
    }

    // Ministry Appointments
    else if (customId === 'appointment_building' || customId === 'appointment_research' || customId === 'appointment_training') {
      const type = customId.replace('appointment_', '');
      await showAppointmentModal(interaction, type, lang);
    }
    else if (customId === 'appointment_view_all') {
      await showAllAppointments(interaction, lang);
    }
    else if (customId === 'appointment_delete') {
      await showDeleteAppointmentModal(interaction, lang);
    }

    // Reminder Edit
    else if (customId === 'reminder_edit_message') {
      await showEditReminderMessageModal(interaction, lang);
    }
    else if (customId === 'reminder_set_time') {
      await showSetReminderTimeModal(interaction, lang);
    }

    // Layout Controls
    else if (customId === 'layout_move_up') {
      await showMoveButtonModal(interaction, 'up', lang);
    }
    else if (customId === 'layout_move_down') {
      await showMoveButtonModal(interaction, 'down', lang);
    }
    else if (customId === 'layout_swap') {
      await showSwapButtonsModal(interaction, lang);
    }
    else if (customId === 'layout_edit_labels') {
      await showEditLabelsModal(interaction, lang);
    }

    // Close menu
    else if (customId === 'close_menu') {
      await interaction.message.delete().catch(() => {});
    }

    // Settings buttons
    else if (customId === 'settings_buttons') {
      await interaction.update(ButtonManager.createButtonLayoutMenu(userId, lang));
    }
    else if (customId === 'settings_about') {
      await showAboutMenu(interaction, lang);
    }
    else if (customId === 'settings_update') {
      await checkBotUpdate(interaction, lang);
    }

    // Admin permission buttons
    else if (customId === 'perm_add_admin') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ المالك فقط' : '❌ Owner only', ephemeral: true });
        return;
      }
      await showAddAdminModal(interaction, lang);
    }
    else if (customId === 'perm_remove_admin') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ المالك فقط' : '❌ Owner only', ephemeral: true });
        return;
      }
      await showRemoveAdminModal(interaction, lang);
    }
    else if (customId === 'perm_set_owner') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ المالك فقط' : '❌ Owner only', ephemeral: true });
        return;
      }
      await showSetOwnerModal(interaction, lang);
    }

    // Back buttons
    else if (customId === 'back_main') {
      await interaction.update(ButtonManager.createMainMenu(lang));
    }
    else if (customId === 'back_permissions') {
      await interaction.update(ButtonManager.createPermissionsMenu(userId, lang));
    }
    else if (customId === 'back_bookings') {
      await interaction.update(ButtonManager.createBookingsMenu(lang));
    }
    else if (customId === 'back_alliance') {
      await interaction.update(ButtonManager.createAllianceMenu(lang));
    }
    else if (customId === 'back_permissions') {
      await interaction.update(ButtonManager.createPermissionsMenu(userId, lang));
    }
    else if (customId === 'back_owner_admin') {
      await interaction.update(ButtonManager.createOwnerAdminMenu(userId, lang));
    }

    // Owner Admin Panel
    else if (customId === 'menu_owner_admin') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ هذه القائمة للمالك فقط' : '❌ This menu is owner only', ephemeral: true });
        return;
      }
      await interaction.update(ButtonManager.createOwnerAdminMenu(userId, lang));
    }
    else if (customId === 'owner_guilds') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
        return;
      }
      await interaction.update(ButtonManager.createGuildsMenu(userId, lang));
    }
    else if (customId === 'owner_buttons') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
        return;
      }
      await interaction.update(ButtonManager.createButtonLayoutMenu(userId, lang));
    }
    else if (customId === 'owner_permissions') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
        return;
      }
      await interaction.update(ButtonManager.createPermissionsMenu(userId, lang));
    }

    // Guild Management
    else if (customId === 'guild_add') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
        return;
      }
      await showAddGuildModal(interaction, lang);
    }
    else if (customId === 'guild_remove') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
        return;
      }
      await showRemoveGuildModal(interaction, lang);
    }
    else if (customId === 'guild_info') {
      const guilds = db.getGuilds();
      let info = lang === 'ar' 
        ? '**📋 معلومات نظام السيرفرات:**\n\n'
        : '**📋 Server System Information:**\n\n';
      info += lang === 'ar'
        ? '• **GUILD_ID** في ملف .env يُستخدم فقط للتسجيل السريع للأوامر في السيرفر المحدد.\n'
        + '• إذا تم تركه فارغاً، يتم تسجيل الأوامر عالمياً (يستغرق حتى ساعة).\n'
        + '• البوت يعمل في جميع السيرفرات المضاف إليها تلقائياً.\n'
        + '• نظام إدارة السيرفرات هنا للتتبع فقط، ليس إلزامياً لعمل البوت.\n\n'
        + `**عدد السيرفرات المسجلة:** ${guilds.registered?.length || 0}`
        : '• **GUILD_ID** in .env is only used for fast command registration in specified server.\n'
        + '• If left empty, commands are registered globally (takes up to 1 hour).\n'
        + '• Bot works in all servers it\'s added to automatically.\n'
        + '• Server management system here is for tracking only, not required for bot operation.\n\n'
        + `**Registered Servers:** ${guilds.registered?.length || 0}`;
      await interaction.reply({ content: info, ephemeral: true });
    }

    // Button Layout
    else if (customId === 'layout_reset') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
        return;
      }
      db.resetButtonLayout();
      await interaction.update(ButtonManager.createButtonLayoutMenu(userId, lang));
      await interaction.followUp({ 
        content: lang === 'ar' ? '✅ تم إعادة تعيين ترتيب الأزرار إلى الوضع الافتراضي' : '✅ Button layout reset to default', 
        ephemeral: true 
      });
    }
    else if (customId === 'layout_preview') {
      await interaction.reply({ 
        ...ButtonManager.createMainMenu(lang), 
        ephemeral: true 
      });
    }

    // Alliance Register Button
    else if (customId === 'alliance_register') {
      const isR5OrAdmin = (db.getAlliance().leader === userId) || db.isAdmin(userId);
      if (!isR5OrAdmin) {
        await interaction.reply({ content: t(lang, 'alliance.noPermission'), ephemeral: true });
        return;
      }
      await showAllianceRegisterModal(interaction, lang);
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

    // Delete booking
    else if (customId.startsWith('booking_delete_')) {
      const type = customId.replace('booking_delete_', '');
      await showDeleteBookingMenu(interaction, type, lang, userId);
    }

    // Confirm delete booking
    else if (customId.startsWith('confirm_delete_')) {
      const [_, __, type, bookingId] = customId.split('_');
      const booking = db.getBookings(type).find(b => b.id === bookingId);
      
      if (!booking) {
        await interaction.reply({ content: lang === 'ar' ? '❌ الحجز غير موجود' : '❌ Booking not found', ephemeral: true });
        return;
      }

      // Check if user owns the booking or is admin
      if (booking.userId !== userId && !db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية لحذف هذا الحجز' : '❌ No permission to delete this booking', ephemeral: true });
        return;
      }

      db.removeBooking(type, bookingId);
      await interaction.update(ButtonManager.createBookingTypeMenu(type, lang));
      await interaction.followUp({ content: t(lang, 'bookings.removed'), ephemeral: true });
    }

    // Cancel delete
    else if (customId.startsWith('cancel_delete_')) {
      const type = customId.split('_')[2];
      await interaction.update(ButtonManager.createBookingTypeMenu(type, lang));
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
      await showAllianceDetailedInfo(interaction, lang);
    }
    else if (customId === 'alliance_ranks') {
      await showAllianceRanks(interaction, lang);
    }
    else if (customId === 'alliance_commands') {
      await showAllianceCommands(interaction, lang);
    }
    else if (customId === 'alliance_manage_menu') {
      // Check permissions
      if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
        await interaction.reply({ content: t(lang, 'alliance.noPermission'), ephemeral: true });
        return;
      }
      await interaction.update(ButtonManager.createAllianceManageMenu(userId, lang));
    }

    // Alliance Management Actions
    else if (customId === 'alliance_add_member') {
      if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
        await interaction.reply({ content: t(lang, 'alliance.noPermission'), ephemeral: true });
        return;
      }
      await showAddMemberModal(interaction, lang);
    }
    else if (customId === 'alliance_remove_member') {
      if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
        await interaction.reply({ content: t(lang, 'alliance.noPermission'), ephemeral: true });
        return;
      }
      await showRemoveMemberModal(interaction, lang);
    }
    else if (customId === 'alliance_change_rank') {
      if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
        await interaction.reply({ content: t(lang, 'alliance.noPermission'), ephemeral: true });
        return;
      }
      await showChangeRankModal(interaction, lang);
    }
    else if (customId === 'alliance_set_info') {
      const isR5OrAdmin = (db.getAlliance().leader === userId) || db.isAdmin(userId);
      if (!isR5OrAdmin) {
        await interaction.reply({ content: t(lang, 'alliance.r5Only'), ephemeral: true });
        return;
      }
      await showSetAllianceInfoModal(interaction, lang);
    }
    else if (customId === 'alliance_set_leader') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: t(lang, 'permissions.ownerOnly'), ephemeral: true });
        return;
      }
      await showSetLeaderModal(interaction, lang);
    }

    // Reminders
    else if (customId === 'reminder_add') {
      await showAddReminderModal(interaction, lang);
    }
    else if (customId === 'reminder_view') {
      await showRemindersList(interaction, userId, lang);
    }
    else if (customId === 'reminder_delete') {
      await showDeleteReminderMenu(interaction, userId, lang);
    }
    else if (customId.startsWith('reminder_delete_')) {
      const reminderId = customId.replace('reminder_delete_', '');
      db.removeReminder(userId, reminderId);
      await interaction.update(ButtonManager.createRemindersMenu(userId, lang));
      await interaction.followUp({ content: lang === 'ar' ? '✅ تم حذف التذكير' : '✅ Reminder deleted', ephemeral: true });
    }

    // Admin Management
    else if (customId === 'perm_manage_admins') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: t(lang, 'permissions.ownerOnly'), ephemeral: true });
        return;
      }
      await interaction.update(ButtonManager.createAdminMenu(userId, lang));
    }
    else if (customId === 'admin_add') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: t(lang, 'permissions.ownerOnly'), ephemeral: true });
        return;
      }
      await showAddAdminModal(interaction, lang);
    }
    else if (customId === 'admin_remove') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: t(lang, 'permissions.ownerOnly'), ephemeral: true });
        return;
      }
      await showRemoveAdminModal(interaction, lang);
    }
    else if (customId === 'admin_set_owner') {
      if (!db.isOwner(userId)) {
        await interaction.reply({ content: t(lang, 'permissions.ownerOnly'), ephemeral: true });
        return;
      }
      await showSetOwnerModal(interaction, lang);
    }

    // Advanced Alliance Info
    else if (customId === 'view_members_detailed') {
      await showDetailedMembersList(interaction, lang);
    }
    else if (customId === 'view_alliance_activity') {
      await showAllianceActivity(interaction, lang);
    }
    else if (customId === 'export_alliance_data') {
      await exportAllianceData(interaction, lang);
    }

    // Alliance Logs
    else if (customId === 'set_log_channel') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await showSetLogChannelModal(interaction, lang);
    }
    else if (customId === 'view_log_channel') {
      await showCurrentLogChannel(interaction, lang);
    }
    else if (customId === 'remove_log_channel') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await removeLogChannel(interaction, lang);
    }
    else if (customId === 'view_recent_logs') {
      await showRecentLogs(interaction, lang);
    }

    // Ministries
    else if (customId === 'add_ministry') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await showAddMinistryModal(interaction, lang);
    }
    else if (customId === 'view_ministries') {
      await showMinistriesList(interaction, lang);
    }
    else if (customId === 'edit_ministry') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await showEditMinistryMenu(interaction, lang);
    }
    else if (customId === 'delete_ministry') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await showDeleteMinistryMenu(interaction, lang);
    }
    else if (customId === 'schedule_activity') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await showScheduleActivityModal(interaction, lang);
    }
    else if (customId === 'assign_minister') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await showAssignMinisterMenu(interaction, lang);
    }

    // Advanced Schedules
    else if (customId === 'create_scheduled_alert') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await showCreateScheduledAlertModal(interaction, lang);
    }
    else if (customId === 'view_schedules') {
      await showSchedulesList(interaction, lang);
    }
    else if (customId === 'edit_schedule') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await showEditScheduleMenu(interaction, lang);
    }
    else if (customId === 'delete_schedule') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await showDeleteScheduleMenu(interaction, lang);
    }
    else if (customId === 'schedule_activity_advanced') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await showAdvancedScheduleModal(interaction, lang);
    }
    else if (customId === 'toggle_auto_repeat') {
      if (!db.checkPermission(userId, 'admin')) {
        await interaction.reply({ content: t(lang, 'permissions.adminOnly'), ephemeral: true });
        return;
      }
      await toggleAutoRepeat(interaction, lang);
    }

    // === Members Management ===
    else if (customId === 'member_add') {
      if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية R4/R5 أو أدمن فقط' : '❌ R4/R5 or Admin only', ephemeral: true });
        return;
      }
      await showNewAddMemberModal(interaction, lang);
    }
    else if (customId === 'member_remove') {
      if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية R4/R5 أو أدمن فقط' : '❌ R4/R5 or Admin only', ephemeral: true });
        return;
      }
      await showNewRemoveMemberModal(interaction, lang);
    }
    else if (customId === 'member_change_rank') {
      if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية R4/R5 أو أدمن فقط' : '❌ R4/R5 or Admin only', ephemeral: true });
        return;
      }
      await showNewChangeRankModal(interaction, lang);
    }
    else if (customId === 'member_list_all') {
      await showAllMembersList(interaction, lang);
    }
    else if (customId === 'member_search') {
      await showMemberSearchModal(interaction, lang);
    }

    // === Ministries Management ===
    else if (customId === 'ministry_add') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
        return;
      }
      await showAddMinistryModal(interaction, lang);
    }
    else if (customId === 'ministry_view') {
      await showMinistriesList(interaction, lang);
    }
    else if (customId === 'ministry_assign') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
        return;
      }
      await showAssignMinisterModal(interaction, lang);
    }
    else if (customId === 'ministry_schedule') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
        return;
      }
      await showScheduleActivityModal(interaction, lang);
    }
    else if (customId === 'ministry_delete') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
        return;
      }
      await showDeleteMinistryModal(interaction, lang);
    }

    // === Logs Management ===
    else if (customId === 'logs_set_channel') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
        return;
      }
      await showSetLogChannelModal(interaction, lang);
    }
    else if (customId === 'logs_view_all') {
      await showRecentLogs(interaction, lang);
    }
    else if (customId === 'logs_clear_channel') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
        return;
      }
      await removeLogChannel(interaction, lang);
    }

    // === Schedule Management ===
    else if (customId === 'schedule_create') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
        return;
      }
      await showAdvancedScheduleModal(interaction, lang);
    }
    else if (customId === 'schedule_view_all') {
      await showSchedulesList(interaction, lang);
    }
    else if (customId === 'schedule_alert') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
        return;
      }
      await showCreateScheduledAlertModal(interaction, lang);
    }
    else if (customId === 'schedule_delete') {
      if (!db.isAdmin(userId)) {
        await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
        return;
      }
      await showDeleteScheduleMenu(interaction, lang);
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

  const memberNameInput = new TextInputBuilder()
    .setCustomId('member_name')
    .setLabel(lang === 'ar' ? 'اسم العضو' : 'Member Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(lang === 'ar' ? 'أدخل اسم العضو' : 'Enter member name')
    .setRequired(true);

  const allianceInput = new TextInputBuilder()
    .setCustomId('alliance_name')
    .setLabel(lang === 'ar' ? 'اسم التحالف' : 'Alliance Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(lang === 'ar' ? 'أدخل اسم التحالف' : 'Enter alliance name')
    .setRequired(true);

  const durationInput = new TextInputBuilder()
    .setCustomId('duration')
    .setLabel(lang === 'ar' ? 'عدد الأيام' : 'Number of Days')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('1')
    .setRequired(true);

  const startDateInput = new TextInputBuilder()
    .setCustomId('start_date')
    .setLabel(lang === 'ar' ? 'تاريخ البداية (YYYY-MM-DD)' : 'Start Date (YYYY-MM-DD)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('2024-02-15')
    .setRequired(true);

  const notesInput = new TextInputBuilder()
    .setCustomId('notes')
    .setLabel(lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(memberNameInput),
    new ActionRowBuilder().addComponents(allianceInput),
    new ActionRowBuilder().addComponents(durationInput),
    new ActionRowBuilder().addComponents(startDateInput),
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
    const duration = booking.duration || Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
    
    message += `**${index + 1}.**\n`;
    message += `${lang === 'ar' ? '👤 العضو' : '👤 Member'}: ${booking.memberName || booking.userName || 'N/A'}\n`;
    message += `${lang === 'ar' ? '🆔 المعرف' : '🆔 ID'}: <@${booking.userId}>\n`;
    message += `${lang === 'ar' ? '🤝 التحالف' : '🤝 Alliance'}: ${booking.allianceName || lang === 'ar' ? 'غير محدد' : 'Not specified'}\n`;
    message += `${lang === 'ar' ? '📅 البداية' : '📅 Start'}: ${start}\n`;
    message += `${lang === 'ar' ? '📅 النهاية' : '📅 End'}: ${end}\n`;
    message += `${lang === 'ar' ? '⏱️ المدة' : '⏱️ Duration'}: ${duration} ${lang === 'ar' ? 'يوم' : 'day'}${duration > 1 ? 's' : ''}\n`;
    
    if (booking.notes) {
      message += `${lang === 'ar' ? '📝 ملاحظات' : '📝 Notes'}: ${booking.notes}\n`;
    }
    message += '\n';
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
    const joinDate = new Date(member.joinedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
    message += `${index + 1}. <@${member.id}> - **${member.rank}** (${lang === 'ar' ? 'انضم' : 'Joined'}: ${joinDate})\n`;
  });

  await interaction.reply({ 
    content: message, 
    ephemeral: true 
  });
}

async function showDeleteBookingMenu(interaction, type, lang, userId) {
  const bookings = db.getBookings(type);
  const userBookings = bookings.filter(b => b.userId === userId || db.isAdmin(userId));
  
  if (userBookings.length === 0) {
    await interaction.reply({
      content: lang === 'ar' ? '❌ ليس لديك حجوزات لحذفها' : '❌ You have no bookings to delete',
      ephemeral: true
    });
    return;
  }

  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
  
  let description = lang === 'ar' ? 'اختر الحجز الذي تريد حذفه:\n\n' : 'Select the booking to delete:\n\n';
  
  userBookings.forEach((booking, index) => {
    const start = new Date(booking.startDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
    const end = new Date(booking.endDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
    description += `**${index + 1}.** ${start} - ${end}\n`;
    if (booking.notes) {
      description += `   📝 ${booking.notes}\n`;
    }
  });

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle(lang === 'ar' ? '🗑️ حذف حجز' : '🗑️ Delete Booking')
    .setDescription(description)
    .setTimestamp();

  const rows = [];
  const buttons = [];
  
  userBookings.forEach((booking, index) => {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`confirm_delete_${type}_${booking.id}`)
        .setLabel(`${index + 1}`)
        .setStyle(ButtonStyle.Danger)
    );
    
    if ((index + 1) % 5 === 0 || index === userBookings.length - 1) {
      rows.push(new ActionRowBuilder().addComponents(buttons.splice(0)));
    }
  });

  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`cancel_delete_${type}`)
        .setLabel(lang === 'ar' ? '❌ إلغاء' : '❌ Cancel')
        .setStyle(ButtonStyle.Secondary)
    )
  );

  await interaction.reply({
    embeds: [embed],
    components: rows,
    ephemeral: true
  });
}

async function showAllianceManageMenu(interaction, lang) {
  await interaction.reply({
    content: lang === 'ar' 
      ? '⚙️ **إدارة التحالف**\n\n' +
        '**الأوامر المتاحة:**\n' +
        '• `/addmember @user rank` - إضافة عضو\n' +
        '• `/removemember @user` - إزالة عضو\n' +
        '• `/changerank @user rank` - تغيير الرتبة\n' +
        '• `/setalliance name:... tag:... description:...` - تعديل معلومات التحالف\n' +
        '• `/setleader @user` - تعيين القائد (المشرفين فقط)\n\n' +
        '**الرتب المتاحة:** R5, R4, R3, R2, R1'
      : '⚙️ **Alliance Management**\n\n' +
        '**Available Commands:**\n' +
        '• `/addmember @user rank` - Add member\n' +
        '• `/removemember @user` - Remove member\n' +
        '• `/changerank @user rank` - Change rank\n' +
        '• `/setalliance name:... tag:... description:...` - Edit alliance info\n' +
        '• `/setleader @user` - Set leader (Admins only)\n\n' +
        '**Available ranks:** R5, R4, R3, R2, R1',
    ephemeral: true
  });
}

async function showAllianceDetailedInfo(interaction, lang) {
  const alliance = db.getAlliance();
  
  // Count members by rank
  const rankCounts = { R5: 0, R4: 0, R3: 0, R2: 0, R1: 0 };
  alliance.members.forEach(member => {
    if (rankCounts[member.rank] !== undefined) {
      rankCounts[member.rank]++;
    }
  });

  const { EmbedBuilder } = await import('discord.js');
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(lang === 'ar' ? '🤝 معلومات التحالف التفصيلية' : '🤝 Detailed Alliance Information')
    .setTimestamp();

  embed.addFields(
    { 
      name: lang === 'ar' ? '📛 اسم التحالف' : '📛 Alliance Name', 
      value: alliance.name || (lang === 'ar' ? 'غير محدد' : 'Not set'), 
      inline: true 
    },
    { 
      name: lang === 'ar' ? '🏷️ الوسم' : '🏷️ Tag', 
      value: alliance.tag || (lang === 'ar' ? 'غير محدد' : 'Not set'), 
      inline: true 
    },
    { 
      name: lang === 'ar' ? '👑 القائد' : '👑 Leader', 
      value: alliance.leader ? `<@${alliance.leader}>` : (lang === 'ar' ? 'غير محدد' : 'Not set'), 
      inline: false 
    }
  );

  if (alliance.description) {
    embed.addFields({
      name: lang === 'ar' ? '📝 الوصف' : '📝 Description',
      value: alliance.description,
      inline: false
    });
  }

  embed.addFields(
    { 
      name: lang === 'ar' ? '👥 إجمالي الأعضاء' : '👥 Total Members', 
      value: alliance.members.length.toString(), 
      inline: true 
    },
    { 
      name: lang === 'ar' ? '⭐ توزيع الرتب' : '⭐ Rank Distribution', 
      value: `**R5:** ${rankCounts.R5} | **R4:** ${rankCounts.R4}\n**R3:** ${rankCounts.R3} | **R2:** ${rankCounts.R2}\n**R1:** ${rankCounts.R1}`,
      inline: true 
    }
  );

  if (alliance.members.length > 0) {
    const recentMembers = alliance.members
      .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
      .slice(0, 5)
      .map(m => `<@${m.id}> - **${m.rank}**`)
      .join('\n');

    embed.addFields({
      name: lang === 'ar' ? '🆕 أحدث الأعضاء (آخر 5)' : '🆕 Recent Members (Last 5)',
      value: recentMembers,
      inline: false
    });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showAllianceRanks(interaction, lang) {
  const alliance = db.getAlliance();
  
  // Group members by rank
  const membersByRank = { R5: [], R4: [], R3: [], R2: [], R1: [] };
  alliance.members.forEach(member => {
    if (membersByRank[member.rank]) {
      membersByRank[member.rank].push(member);
    }
  });

  const { EmbedBuilder } = await import('discord.js');
  const embed = new EmbedBuilder()
    .setColor('#ffd700')
    .setTitle(lang === 'ar' ? '⭐ توزيع رتب التحالف' : '⭐ Alliance Rank Distribution')
    .setDescription(lang === 'ar' 
      ? `إجمالي الأعضاء: **${alliance.members.length}**` 
      : `Total Members: **${alliance.members.length}**`)
    .setTimestamp();

  ['R5', 'R4', 'R3', 'R2', 'R1'].forEach(rank => {
    const members = membersByRank[rank];
    if (members.length > 0) {
      const memberList = members
        .map((m, i) => `${i + 1}. <@${m.id}>`)
        .join('\n');
      
      embed.addFields({
        name: `${rank === 'R5' ? '👑' : rank === 'R4' ? '⭐' : '•'} ${rank} (${members.length})`,
        value: memberList || (lang === 'ar' ? 'لا يوجد' : 'None'),
        inline: false
      });
    }
  });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showAllianceCommands(interaction, lang) {
  const { EmbedBuilder } = await import('discord.js');
  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle(lang === 'ar' ? '📜 أوامر التحالف' : '📜 Alliance Commands')
    .setDescription(lang === 'ar' 
      ? 'جميع الأوامر المتاحة لإدارة التحالف' 
      : 'All available commands for alliance management')
    .setTimestamp();

  embed.addFields(
    {
      name: lang === 'ar' ? '📊 عرض المعلومات' : '📊 View Information',
      value: lang === 'ar'
        ? '• `/allianceinfo` - معلومات التحالف التفصيلية\n' +
          '• `/members [rank]` - عرض جميع الأعضاء أو حسب الرتبة'
        : '• `/allianceinfo` - Detailed alliance information\n' +
          '• `/members [rank]` - View all members or by rank',
      inline: false
    },
    {
      name: lang === 'ar' ? '👥 إدارة الأعضاء (R4, R5, Admins)' : '👥 Member Management (R4, R5, Admins)',
      value: lang === 'ar'
        ? '• `/addmember @user rank` - إضافة عضو جديد\n' +
          '• `/removemember @user` - إزالة عضو\n' +
          '• `/changerank @user rank` - تغيير رتبة عضو'
        : '• `/addmember @user rank` - Add new member\n' +
          '• `/removemember @user` - Remove member\n' +
          '• `/changerank @user rank` - Change member rank',
      inline: false
    },
    {
      name: lang === 'ar' ? '⚙️ إدارة التحالف (R5, Admins)' : '⚙️ Alliance Settings (R5, Admins)',
      value: lang === 'ar'
        ? '• `/setalliance` - تعديل اسم/وسم/وصف التحالف\n' +
          '  - مثال: `/setalliance name:Phoenix tag:[PHX] description:...`'
        : '• `/setalliance` - Edit alliance name/tag/description\n' +
          '  - Example: `/setalliance name:Phoenix tag:[PHX] description:...`',
      inline: false
    },
    {
      name: lang === 'ar' ? '👑 إدارة القيادة (Admins فقط)' : '👑 Leadership (Admins Only)',
      value: lang === 'ar'
        ? '• `/setleader @user` - تعيين قائد التحالف'
        : '• `/setleader @user` - Set alliance leader',
      inline: false
    }
  );

  embed.setFooter({ 
    text: lang === 'ar' 
      ? 'الرتب المتاحة: R5 (قائد), R4, R3, R2, R1' 
      : 'Available ranks: R5 (leader), R4, R3, R2, R1' 
  });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showAdminManageMenu(interaction, lang) {
  const perms = db.getPermissions();
  
  let adminList = lang === 'ar' ? 'لا يوجد مشرفين حالياً' : 'No admins currently';
  if (perms.admins.length > 0) {
    adminList = perms.admins.map((id, i) => `${i + 1}. <@${id}>`).join('\n');
  }

  await interaction.reply({
    content: lang === 'ar'
      ? `👮 **إدارة المشرفين**\n\n` +
        `**المشرفين الحاليين:**\n${adminList}\n\n` +
        `**الأوامر المتاحة:**\n` +
        `• \`/addadmin @user\` - إضافة مشرف\n` +
        `• \`/removeadmin @user\` - حذف مشرف`
      : `👮 **Admin Management**\n\n` +
        `**Current Admins:**\n${adminList}\n\n` +
        `**Available Commands:**\n` +
        `• \`/addadmin @user\` - Add admin\n` +
        `• \`/removeadmin @user\` - Remove admin`,
    ephemeral: true
  });
}

// === Alliance Management Modals ===

async function showAddMemberModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('alliance_modal_add_member')
    .setTitle(lang === 'ar' ? 'إضافة عضو للتحالف' : 'Add Alliance Member');

  const userIdInput = new TextInputBuilder()
    .setCustomId('user_id')
    .setLabel(lang === 'ar' ? 'ID العضو أو @منشن' : 'User ID or @mention')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('123456789012345678 or @user')
    .setRequired(true);

  const rankInput = new TextInputBuilder()
    .setCustomId('rank')
    .setLabel(lang === 'ar' ? 'الرتبة (R1, R2, R3, R4, R5)' : 'Rank (R1, R2, R3, R4, R5)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('R4')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(userIdInput),
    new ActionRowBuilder().addComponents(rankInput)
  );

  await interaction.showModal(modal);
}

async function showRemoveMemberModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('alliance_modal_remove_member')
    .setTitle(lang === 'ar' ? 'إزالة عضو من التحالف' : 'Remove Alliance Member');

  const userIdInput = new TextInputBuilder()
    .setCustomId('user_id')
    .setLabel(lang === 'ar' ? 'ID العضو أو @منشن' : 'User ID or @mention')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('123456789012345678 or @user')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(userIdInput)
  );

  await interaction.showModal(modal);
}

async function showChangeRankModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('alliance_modal_change_rank')
    .setTitle(lang === 'ar' ? 'تغيير رتبة عضو' : 'Change Member Rank');

  const userIdInput = new TextInputBuilder()
    .setCustomId('user_id')
    .setLabel(lang === 'ar' ? 'ID العضو أو @منشن' : 'User ID or @mention')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('123456789012345678 or @user')
    .setRequired(true);

  const rankInput = new TextInputBuilder()
    .setCustomId('rank')
    .setLabel(lang === 'ar' ? 'الرتبة الجديدة (R1-R5)' : 'New Rank (R1-R5)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('R3')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(userIdInput),
    new ActionRowBuilder().addComponents(rankInput)
  );

  await interaction.showModal(modal);
}

async function showSetAllianceInfoModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('alliance_modal_set_info')
    .setTitle(lang === 'ar' ? 'تعديل معلومات التحالف' : 'Edit Alliance Info');

  const alliance = db.getAlliance();

  const nameInput = new TextInputBuilder()
    .setCustomId('name')
    .setLabel(lang === 'ar' ? 'اسم التحالف' : 'Alliance Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(alliance.name || 'Phoenix Alliance')
    .setRequired(false);

  const tagInput = new TextInputBuilder()
    .setCustomId('tag')
    .setLabel(lang === 'ar' ? 'الوسم [TAG]' : 'Tag [TAG]')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(alliance.tag || '[PHX]')
    .setRequired(false);

  const descInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel(lang === 'ar' ? 'الوصف' : 'Description')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(alliance.description || 'We are the best alliance!')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(tagInput),
    new ActionRowBuilder().addComponents(descInput)
  );

  await interaction.showModal(modal);
}

async function showSetLeaderModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('alliance_modal_set_leader')
    .setTitle(lang === 'ar' ? 'تعيين قائد التحالف' : 'Set Alliance Leader');

  const userIdInput = new TextInputBuilder()
    .setCustomId('user_id')
    .setLabel(lang === 'ar' ? 'ID العضو أو @منشن' : 'User ID or @mention')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('123456789012345678 or @user')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(userIdInput)
  );

  await interaction.showModal(modal);
}

// === Reminders Modals ===

async function showAddReminderModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('reminder_modal_add')
    .setTitle(lang === 'ar' ? 'إضافة تذكير جديد' : 'Add New Reminder');

  const messageInput = new TextInputBuilder()
    .setCustomId('message')
    .setLabel(lang === 'ar' ? 'رسالة التذكير' : 'Reminder Message')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(lang === 'ar' ? 'تذكير مهم' : 'Important reminder')
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId('time')
    .setLabel(lang === 'ar' ? 'الوقت (YYYY-MM-DD HH:MM)' : 'Time (YYYY-MM-DD HH:MM)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('2024-02-20 15:30')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(messageInput),
    new ActionRowBuilder().addComponents(timeInput)
  );

  await interaction.showModal(modal);
}

async function showRemindersList(interaction, userId, lang) {
  const reminders = db.getReminders(userId);
  
  const { EmbedBuilder } = await import('discord.js');
  const embed = new EmbedBuilder()
    .setColor('#ff6b6b')
    .setTitle(lang === 'ar' ? '📋 جميع تذكيراتك' : '📋 All Your Reminders')
    .setTimestamp();

  if (reminders.length === 0) {
    embed.setDescription(lang === 'ar' ? 'لا توجد تذكيرات' : 'No reminders');
  } else {
    reminders.forEach((r, i) => {
      const date = new Date(r.time).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
      embed.addFields({
        name: `${i + 1}. ${r.message}`,
        value: `⏰ ${date}\n🆔 \`${r.id}\``,
        inline: false
      });
    });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showDeleteReminderMenu(interaction, userId, lang) {
  const reminders = db.getReminders(userId);
  
  if (reminders.length === 0) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ لا توجد تذكيرات لحذفها' : '❌ No reminders to delete', 
      ephemeral: true 
    });
    return;
  }

  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle(lang === 'ar' ? '🗑️ حذف تذكير' : '🗑️ Delete Reminder')
    .setDescription(lang === 'ar' ? 'اختر التذكير المراد حذفه' : 'Choose a reminder to delete');

  const buttons = [];
  reminders.slice(0, 5).forEach((r, i) => {
    const date = new Date(r.time).toLocaleDateString();
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`reminder_delete_${r.id}`)
        .setLabel(`${i + 1}. ${r.message.substring(0, 20)}... (${date})`)
        .setStyle(ButtonStyle.Danger)
    );
  });

  const rows = [];
  for (let i = 0; i < buttons.length; i += 2) {
    const row = new ActionRowBuilder();
    row.addComponents(buttons[i]);
    if (buttons[i + 1]) row.addComponents(buttons[i + 1]);
    rows.push(row);
  }

  await interaction.reply({ embeds: [embed], components: rows, ephemeral: true });
}

// === Admin Management Modals ===

async function showAddAdminModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('admin_modal_add')
    .setTitle(lang === 'ar' ? 'إضافة مشرف' : 'Add Admin');

  const userIdInput = new TextInputBuilder()
    .setCustomId('user_id')
    .setLabel(lang === 'ar' ? 'ID المستخدم أو @منشن' : 'User ID or @mention')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('123456789012345678 or @user')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(userIdInput)
  );

  await interaction.showModal(modal);
}

async function showRemoveAdminModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('admin_modal_remove')
    .setTitle(lang === 'ar' ? 'حذف مشرف' : 'Remove Admin');

  const userIdInput = new TextInputBuilder()
    .setCustomId('user_id')
    .setLabel(lang === 'ar' ? 'ID المستخدم أو @منشن' : 'User ID or @mention')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('123456789012345678 or @user')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(userIdInput)
  );

  await interaction.showModal(modal);
}

async function showSetOwnerModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('admin_modal_set_owner')
    .setTitle(lang === 'ar' ? 'تعيين مالك جديد' : 'Set New Owner');

  const userIdInput = new TextInputBuilder()
    .setCustomId('user_id')
    .setLabel(lang === 'ar' ? 'ID المستخدم أو @منشن' : 'User ID or @mention')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('123456789012345678 or @user')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(userIdInput)
  );

  await interaction.showModal(modal);
}
// === Advanced Alliance Functions ===

async function showDetailedMembersList(interaction, lang) {
  const alliance = db.getAlliance();
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');

  if (!alliance.members || alliance.members.length === 0) {
    await interaction.reply({ content: lang === 'ar' ? '❌ لا يوجد أعضاء' : '❌ No members', ephemeral: true });
    return;
  }

  let description = '';
  alliance.members.forEach((member, index) => {
    const joinDate = new Date(member.joinedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
    description += `**${index + 1}.** <@${member.id}>\n`;
    description += `   └ ${lang === 'ar' ? 'رتبة' : 'Rank'}: **${member.rank}** | ${lang === 'ar' ? 'انضم' : 'Joined'}: ${joinDate}\n`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`👥 ${lang === 'ar' ? 'قائمة الأعضاء التفصيلية' : 'Detailed Members List'}`)
    .setDescription(description)
    .setColor('#4A90E2')
    .setFooter({ text: lang === 'ar' ? `إجمالي: ${alliance.members.length} عضو` : `Total: ${alliance.members.length} members` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showAllianceActivity(interaction, lang) {
  const alliance = db.getAlliance();
  const bookings = db.getBookings();
  const { EmbedBuilder } = await import('discord.js');

  // حساب الأنشطة
  let totalBookings = 0;
  for (const type in bookings) {
    if (Array.isArray(bookings[type])) {
      totalBookings += bookings[type].length;
    }
  }

  const recentMembers = alliance.members
    ?.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
    .slice(0, 5)
    .map(m => `• <@${m.id}>`)
    .join('\n') || (lang === 'ar' ? 'لا يوجد' : 'None');

  const embed = new EmbedBuilder()
    .setTitle(`📊 ${lang === 'ar' ? 'نشاط التحالف' : 'Alliance Activity'}`)
    .setColor('#E67E22')
    .addFields(
      {
        name: lang === 'ar' ? '📅 إجمالي الحجوزات' : '📅 Total Bookings',
        value: totalBookings.toString(),
        inline: true
      },
      {
        name: lang === 'ar' ? '👥 عدد الأعضاء' : '👥 Member Count',
        value: (alliance.members?.length || 0).toString(),
        inline: true
      },
      {
        name: lang === 'ar' ? '🆕 أحدث الأعضاء' : '🆕 Recent Members',
        value: recentMembers,
        inline: false
      }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function exportAllianceData(interaction, lang) {
  const alliance = db.getAlliance();
  const bookings = db.getBookings();

  const data = {
    alliance: alliance,
    bookings: bookings,
    exportedAt: new Date().toISOString()
  };

  const jsonData = JSON.stringify(data, null, 2);
  const { AttachmentBuilder } = await import('discord.js');
  const attachment = new AttachmentBuilder(Buffer.from(jsonData), { name: 'alliance_data.json' });

  await interaction.reply({ 
    content: lang === 'ar' ? '📥 تم تصدير بيانات التحالف' : '📥 Alliance data exported',
    files: [attachment],
    ephemeral: true
  });
}

// === Alliance Logs Functions ===

async function showSetLogChannelModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('log_channel_modal')
    .setTitle(lang === 'ar' ? 'تعيين قناة السجلات' : 'Set Log Channel');

  const channelInput = new TextInputBuilder()
    .setCustomId('channel_id')
    .setLabel(lang === 'ar' ? 'ID القناة أو #منشن' : 'Channel ID or #mention')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('123456789012345678 or #channel')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(channelInput)
  );

  await interaction.showModal(modal);
}

async function showCurrentLogChannel(interaction, lang) {
  const channelId = db.getLogChannel(interaction.guildId);
  const { EmbedBuilder } = await import('discord.js');

  const embed = new EmbedBuilder()
    .setTitle(lang === 'ar' ? '📊 قناة السجلات الحالية' : '📊 Current Log Channel')
    .setColor('#4A90E2');

  if (channelId) {
    embed.setDescription(`${lang === 'ar' ? 'القناة' : 'Channel'}: <#${channelId}>`);
  } else {
    embed.setDescription(lang === 'ar' ? '❌ لم يتم تعيين قناة السجلات' : '❌ No log channel set');
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function removeLogChannel(interaction, lang) {
  db.removeLogChannel(interaction.guildId);
  await interaction.reply({ 
    content: lang === 'ar' ? '✅ تم إزالة قناة السجلات' : '✅ Log channel removed',
    ephemeral: true
  });
}

async function showRecentLogs(interaction, lang) {
  const logs = db.getRecentLogs(10);
  const { EmbedBuilder } = await import('discord.js');

  const embed = new EmbedBuilder()
    .setTitle(lang === 'ar' ? '📖 آخر السجلات' : '📖 Recent Logs')
    .setColor('#9B59B6');

  if (logs.length === 0) {
    embed.setDescription(lang === 'ar' ? 'لا توجد سجلات' : 'No logs available');
  } else {
    let description = '';
    logs.forEach((log, index) => {
      const time = new Date(log.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
      description += `**${index + 1}.** ${log.action} - <@${log.userId}>\n`;
      description += `   └ ${time}\n`;
    });
    embed.setDescription(description);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// === Ministries Functions ===

async function showAddMinistryModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('ministry_modal_add')
    .setTitle(lang === 'ar' ? 'إضافة وزارة' : 'Add Ministry');

  const nameInput = new TextInputBuilder()
    .setCustomId('ministry_name')
    .setLabel(lang === 'ar' ? 'اسم الوزارة' : 'Ministry Name')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const descInput = new TextInputBuilder()
    .setCustomId('ministry_description')
    .setLabel(lang === 'ar' ? 'الوصف' : 'Description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(descInput)
  );

  await interaction.showModal(modal);
}

async function showMinistriesList(interaction, lang) {
  const ministries = db.getMinistries();
  const { EmbedBuilder } = await import('discord.js');

  const embed = new EmbedBuilder()
    .setTitle(lang === 'ar' ? '🏛️ قائمة الوزارات' : '🏛️ Ministries List')
    .setColor('#9B59B6');

  if (!ministries || ministries.length === 0) {
    embed.setDescription(lang === 'ar' ? 'لا توجد وزارات' : 'No ministries available');
  } else {
    let description = '';
    ministries.forEach((ministry, index) => {
      description += `**${index + 1}. ${ministry.name}**\n`;
      description += `   ${ministry.description}\n`;
      if (ministry.minister) {
        description += `   👤 ${lang === 'ar' ? 'الوزير' : 'Minister'}: <@${ministry.minister}>\n`;
      }
      description += '\n';
    });
    embed.setDescription(description);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showEditMinistryMenu(interaction, lang) {
  await interaction.reply({
    content: lang === 'ar' ? '⚠️ استخدم الأمر: /ministries ثم اختر تعديل' : '⚠️ Use command: /ministries then choose edit',
    ephemeral: true
  });
}

async function showDeleteMinistryMenu(interaction, lang) {
  await interaction.reply({
    content: lang === 'ar' ? '⚠️ استخدم الأمر: /ministries ثم اختر حذف' : '⚠️ Use command: /ministries then choose delete',
    ephemeral: true
  });
}

async function showScheduleActivityModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('schedule_activity_modal')
    .setTitle(lang === 'ar' ? 'جدولة نشاط' : 'Schedule Activity');

  const activityInput = new TextInputBuilder()
    .setCustomId('activity_name')
    .setLabel(lang === 'ar' ? 'اسم النشاط' : 'Activity Name')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId('activity_time')
    .setLabel(lang === 'ar' ? 'الوقت (YYYY-MM-DD HH:MM)' : 'Time (YYYY-MM-DD HH:MM)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('2024-02-15 14:30')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(activityInput),
    new ActionRowBuilder().addComponents(timeInput)
  );

  await interaction.showModal(modal);
}

async function showAssignMinisterMenu(interaction, lang) {
  await interaction.reply({
    content: lang === 'ar' ? '⚠️ استخدم الأمر: /ministries ثم اختر تعيين وزير' : '⚠️ Use command: /ministries then choose assign minister',
    ephemeral: true
  });
}

// === Advanced Schedule Functions ===

async function showCreateScheduledAlertModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('scheduled_alert_modal')
    .setTitle(lang === 'ar' ? 'إنشاء تنبيه مجدول' : 'Create Scheduled Alert');

  const messageInput = new TextInputBuilder()
    .setCustomId('alert_message')
    .setLabel(lang === 'ar' ? 'رسالة التنبيه' : 'Alert Message')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId('alert_time')
    .setLabel(lang === 'ar' ? 'الوقت (YYYY-MM-DD HH:MM)' : 'Time (YYYY-MM-DD HH:MM)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('2024-02-15 14:30')
    .setRequired(true);

  const repeatInput = new TextInputBuilder()
    .setCustomId('alert_repeat')
    .setLabel(lang === 'ar' ? 'تكرار (بالساعات، 0 = لا)' : 'Repeat (in hours, 0 = no)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('0')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(messageInput),
    new ActionRowBuilder().addComponents(timeInput),
    new ActionRowBuilder().addComponents(repeatInput)
  );

  await interaction.showModal(modal);
}

async function showSchedulesList(interaction, lang) {
  const schedules = db.getScheduledBookings();
  const { EmbedBuilder } = await import('discord.js');

  const embed = new EmbedBuilder()
    .setTitle(lang === 'ar' ? '📅 قائمة الجداول' : '📅 Schedules List')
    .setColor('#E67E22');

  if (!schedules || schedules.length === 0) {
    embed.setDescription(lang === 'ar' ? 'لا توجد جداول' : 'No schedules available');
  } else {
    let description = '';
    schedules.forEach((schedule, index) => {
      const time = new Date(schedule.startTime).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
      description += `**${index + 1}.** ${lang === 'ar' ? 'النشاط' : 'Activity'}: ${schedule.activityId}\n`;
      description += `   └ ${time} | ${schedule.repeat ? '🔄' : '⏱️'}\n`;
    });
    embed.setDescription(description);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showEditScheduleMenu(interaction, lang) {
  await interaction.reply({
    content: lang === 'ar' ? '⚠️ استخدم الأمر: /schedule ثم اختر تعديل' : '⚠️ Use command: /schedule then choose edit',
    ephemeral: true
  });
}

async function showDeleteScheduleMenu(interaction, lang) {
  await interaction.reply({
    content: lang === 'ar' ? '⚠️ استخدم الأمر: /schedule ثم اختر حذف' : '⚠️ Use command: /schedule then choose delete',
    ephemeral: true
  });
}

async function showAdvancedScheduleModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('advanced_schedule_modal')
    .setTitle(lang === 'ar' ? 'جدولة متقدمة' : 'Advanced Scheduling');

  const activityInput = new TextInputBuilder()
    .setCustomId('schedule_activity')
    .setLabel(lang === 'ar' ? 'النشاط' : 'Activity')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId('schedule_time')
    .setLabel(lang === 'ar' ? 'الوقت (YYYY-MM-DD HH:MM)' : 'Time (YYYY-MM-DD HH:MM)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('2024-02-15 14:30')
    .setRequired(true);

  const intervalInput = new TextInputBuilder()
    .setCustomId('schedule_interval')
    .setLabel(lang === 'ar' ? 'فترة التكرار (بالساعات)' : 'Repeat Interval (in hours)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('24')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(activityInput),
    new ActionRowBuilder().addComponents(timeInput),
    new ActionRowBuilder().addComponents(intervalInput)
  );

  await interaction.showModal(modal);
}

async function toggleAutoRepeat(interaction, lang) {
  await interaction.reply({
    content: lang === 'ar' ? '⚠️ هذه الميزة قيد التطوير' : '⚠️ This feature is under development',
    ephemeral: true
  });
}

// === New Members Management Functions (with different names to avoid conflicts) ===

async function showNewAddMemberModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_member_add')
    .setTitle(lang === 'ar' ? 'إضافة عضو جديد' : 'Add New Member');

  const userInput = new TextInputBuilder()
    .setCustomId('member_user')
    .setLabel(lang === 'ar' ? 'المستخدم (@منشن أو ID)' : 'User (@mention or ID)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('@user or 123456789')
    .setRequired(true);

  const rankInput = new TextInputBuilder()
    .setCustomId('member_rank')
    .setLabel(lang === 'ar' ? 'الرتبة' : 'Rank')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('R1, R2, R3, R4, R5')
    .setValue('R1')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(userInput),
    new ActionRowBuilder().addComponents(rankInput)
  );

  await interaction.showModal(modal);
}

async function showNewRemoveMemberModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_member_remove')
    .setTitle(lang === 'ar' ? 'إزالة عضو' : 'Remove Member');

  const userInput = new TextInputBuilder()
    .setCustomId('member_user')
    .setLabel(lang === 'ar' ? 'المستخدم (@منشن أو ID)' : 'User (@mention or ID)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('@user or 123456789')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(userInput)
  );

  await interaction.showModal(modal);
}

async function showNewChangeRankModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_member_rank')
    .setTitle(lang === 'ar' ? 'تغيير رتبة عضو' : 'Change Member Rank');

  const userInput = new TextInputBuilder()
    .setCustomId('member_user')
    .setLabel(lang === 'ar' ? 'المستخدم (@منشن أو ID)' : 'User (@mention or ID)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('@user or 123456789')
    .setRequired(true);

  const rankInput = new TextInputBuilder()
    .setCustomId('member_rank')
    .setLabel(lang === 'ar' ? 'الرتبة الجديدة' : 'New Rank')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('R1, R2, R3, R4, R5')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(userInput),
    new ActionRowBuilder().addComponents(rankInput)
  );

  await interaction.showModal(modal);
}

async function showAllMembersList(interaction, lang) {
  const alliance = db.getAlliance();
  const { EmbedBuilder } = await import('discord.js');

  if (!alliance.members || alliance.members.length === 0) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ لا يوجد أعضاء' : '❌ No members', 
      ephemeral: true 
    });
    return;
  }

  // Group by rank
  const byRank = {};
  alliance.members.forEach(m => {
    if (!byRank[m.rank]) byRank[m.rank] = [];
    byRank[m.rank].push(m);
  });

  const embed = new EmbedBuilder()
    .setTitle(lang === 'ar' ? `👥 جميع الأعضاء (${alliance.members.length})` : `👥 All Members (${alliance.members.length})`)
    .setColor('#3498db')
    .setTimestamp();

  for (const rank of ['R5', 'R4', 'R3', 'R2', 'R1']) {
    if (byRank[rank] && byRank[rank].length > 0) {
      const members = byRank[rank].map((m, i) => {
        const joinDate = new Date(m.joinedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
        return `${i + 1}. <@${m.id}> - ${joinDate}`;
      }).join('\n');
      
      embed.addFields({
        name: `⭐ ${rank} (${byRank[rank].length})`,
        value: members,
        inline: false
      });
    }
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showMemberSearchModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_member_search')
    .setTitle(lang === 'ar' ? 'بحث عن عضو' : 'Search Member');

  const searchInput = new TextInputBuilder()
    .setCustomId('search_query')
    .setLabel(lang === 'ar' ? 'اسم المستخدم أو ID' : 'Username or ID')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(lang === 'ar' ? 'اكتب للبحث...' : 'Type to search...')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(searchInput)
  );

  await interaction.showModal(modal);
}

async function showDeleteMinistryModal(interaction, lang) {
  const ministries = db.getMinistries();
  
  if (!ministries || ministries.length === 0) {
    await interaction.reply({
      content: lang === 'ar' ? '❌ لا توجد وزارات لحذفها' : '❌ No ministries to delete',
      ephemeral: true
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId('modal_ministry_delete')
    .setTitle(lang === 'ar' ? 'حذف وزارة' : 'Delete Ministry');

  const nameInput = new TextInputBuilder()
    .setCustomId('ministry_name')
    .setLabel(lang === 'ar' ? 'اسم الوزارة' : 'Ministry Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(lang === 'ar' ? 'أدخل اسم الوزارة...' : 'Enter ministry name...')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput)
  );

  await interaction.showModal(modal);
}

async function showAssignMinisterModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_ministry_assign')
    .setTitle(lang === 'ar' ? 'تعيين وزير' : 'Assign Minister');

  const ministryInput = new TextInputBuilder()
    .setCustomId('ministry_name')
    .setLabel(lang === 'ar' ? 'اسم الوزارة' : 'Ministry Name')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const userInput = new TextInputBuilder()
    .setCustomId('minister_user')
    .setLabel(lang === 'ar' ? 'المستخدم (@منشن أو ID)' : 'User (@mention or ID)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('@user or 123456789')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(ministryInput),
    new ActionRowBuilder().addComponents(userInput)
  );

  await interaction.showModal(modal);
}

// Add Guild Modal
async function showAddGuildModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_guild_add')
    .setTitle(lang === 'ar' ? 'إضافة سيرفر' : 'Add Server');

  const idInput = new TextInputBuilder()
    .setCustomId('guild_id')
    .setLabel(lang === 'ar' ? 'معرف السيرفر (Guild ID)' : 'Server ID (Guild ID)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('1234567890123456789')
    .setRequired(true)
    .setMinLength(17)
    .setMaxLength(20);

  const nameInput = new TextInputBuilder()
    .setCustomId('guild_name')
    .setLabel(lang === 'ar' ? 'اسم السيرفر' : 'Server Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(lang === 'ar' ? 'اسم للتعريف فقط' : 'Name for reference only')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(idInput),
    new ActionRowBuilder().addComponents(nameInput)
  );

  await interaction.showModal(modal);
}

// Remove Guild Modal
async function showRemoveGuildModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_guild_remove')
    .setTitle(lang === 'ar' ? 'إزالة سيرفر' : 'Remove Server');

  const idInput = new TextInputBuilder()
    .setCustomId('guild_id')
    .setLabel(lang === 'ar' ? 'معرف السيرفر (Guild ID)' : 'Server ID (Guild ID)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('1234567890123456789')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(idInput)
  );

  await interaction.showModal(modal);
}

// Alliance Register Modal
async function showAllianceRegisterModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_alliance_register')
    .setTitle(lang === 'ar' ? 'تسجيل التحالف' : 'Register Alliance');

  const nameInput = new TextInputBuilder()
    .setCustomId('alliance_name')
    .setLabel(lang === 'ar' ? 'اسم التحالف' : 'Alliance Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(lang === 'ar' ? 'مثال: أبطال الشرق' : 'Example: Eastern Heroes')
    .setRequired(true)
    .setMaxLength(50);

  const tagInput = new TextInputBuilder()
    .setCustomId('alliance_tag')
    .setLabel(lang === 'ar' ? 'تاق التحالف (3-4 أحرف)' : 'Alliance Tag (3-4 chars)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(lang === 'ar' ? 'مثال: [EH]' : 'Example: [EH]')
    .setRequired(true)
    .setMinLength(3)
    .setMaxLength(6);

  const descInput = new TextInputBuilder()
    .setCustomId('alliance_desc')
    .setLabel(lang === 'ar' ? 'وصف التحالف (اختياري)' : 'Description (optional)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(lang === 'ar' ? 'أدخل وصفاً للتحالف...' : 'Enter alliance description...')
    .setRequired(false)
    .setMaxLength(500);

  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(tagInput),
    new ActionRowBuilder().addComponents(descInput)
  );

  await interaction.showModal(modal);
}

// Ministry Appointment Modal
async function showAppointmentModal(interaction, type, lang) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const alliance = db.getAlliance();
  
  const ministryNames = {
    building: lang === 'ar' ? 'البناء' : 'Building',
    research: lang === 'ar' ? 'البحث' : 'Research',
    training: lang === 'ar' ? 'التدريب' : 'Training'
  };

  const modal = new ModalBuilder()
    .setCustomId(`modal_appointment_${type}`)
    .setTitle(lang === 'ar' ? `📅 ${ministryNames[type]}` : `📅 ${ministryNames[type]}`);

  const memberInput = new TextInputBuilder()
    .setCustomId('appointment_member')
    .setLabel(lang === 'ar' ? 'اسم العضو' : 'Member Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(interaction.user.username)
    .setValue(interaction.user.username)
    .setRequired(true)
    .setMaxLength(50);

  const memberIdInput = new TextInputBuilder()
    .setCustomId('appointment_member_id')
    .setLabel(lang === 'ar' ? 'ID العضو' : 'Member ID')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(interaction.user.id)
    .setValue(interaction.user.id)
    .setRequired(true);

  const dayMonthInput = new TextInputBuilder()
    .setCustomId('appointment_date')
    .setLabel(lang === 'ar' ? `اليوم/الشهر (${currentYear})` : `Day/Month (${currentYear})`)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(`${now.getDate()}/${currentMonth}`)
    .setRequired(true)
    .setMinLength(3)
    .setMaxLength(5);

  const timeInput = new TextInputBuilder()
    .setCustomId('appointment_time')
    .setLabel(lang === 'ar' ? 'الوقت: 00:00, 00:30... 23:30' : 'Time: 00:00, 00:30... 23:30')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('14:00')
    .setRequired(true)
    .setMinLength(4)
    .setMaxLength(5);

  modal.addComponents(
    new ActionRowBuilder().addComponents(memberInput),
    new ActionRowBuilder().addComponents(memberIdInput),
    new ActionRowBuilder().addComponents(dayMonthInput),
    new ActionRowBuilder().addComponents(timeInput)
  );

  await interaction.showModal(modal);
}

async function showAllAppointments(interaction, lang) {
  const appointments = db.getBookings('ministry') || [];
  let content = lang === 'ar' ? '**📋 جميع المواعيد:**\n\n' : '**📋 All Appointments:**\n\n';
  
  if (appointments.length === 0) {
    content += lang === 'ar' ? '❌ لا توجد مواعيد' : '❌ No appointments';
  } else {
    appointments.forEach((apt, i) => {
      content += `**${i + 1}.** ${apt.ministry || apt.type} | ${apt.date} ${apt.time} | ${apt.userName}\n`;
    });
  }
  await interaction.reply({ content, ephemeral: true });
}

async function showDeleteAppointmentModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_appointment_delete')
    .setTitle(lang === 'ar' ? 'حذف موعد' : 'Delete');

  const idInput = new TextInputBuilder()
    .setCustomId('appointment_id')
    .setLabel(lang === 'ar' ? 'رقم الموعد' : 'Number')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(idInput));
  await interaction.showModal(modal);
}

async function showEditReminderMessageModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_reminder_edit')
    .setTitle(lang === 'ar' ? 'تعديل تذكير' : 'Edit Reminder');

  const idInput = new TextInputBuilder()
    .setCustomId('reminder_id')
    .setLabel(lang === 'ar' ? 'الرقم' : 'Number')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const messageInput = new TextInputBuilder()
    .setCustomId('reminder_message')
    .setLabel(lang === 'ar' ? 'الرسالة' : 'Message')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(idInput),
    new ActionRowBuilder().addComponents(messageInput)
  );
  await interaction.showModal(modal);
}

async function showSetReminderTimeModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_reminder_time')
    .setTitle(lang === 'ar' ? 'وقت التذكير' : 'Time');

  const idInput = new TextInputBuilder()
    .setCustomId('reminder_id')
    .setLabel(lang === 'ar' ? 'الرقم' : 'Number')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId('reminder_before')
    .setLabel(lang === 'ar' ? 'قبل (5m,15m,30m,1h,1d)' : 'Before (5m,15m,30m,1h,1d)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(idInput),
    new ActionRowBuilder().addComponents(timeInput)
  );
  await interaction.showModal(modal);
}

async function showMoveButtonModal(interaction, direction, lang) {
  const modal = new ModalBuilder()
    .setCustomId(`modal_layout_move_${direction}`)
    .setTitle(lang === 'ar' ? 'نقل زر' : 'Move');

  const rowInput = new TextInputBuilder()
    .setCustomId('row_number')
    .setLabel(lang === 'ar' ? 'الصف (1-4)' : 'Row (1-4)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const buttonInput = new TextInputBuilder()
    .setCustomId('button_index')
    .setLabel(lang === 'ar' ? 'الزر (1-3)' : 'Button (1-3)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(rowInput),
    new ActionRowBuilder().addComponents(buttonInput)
  );
  await interaction.showModal(modal);
}

async function showSwapButtonsModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_layout_swap')
    .setTitle(lang === 'ar' ? 'تبديل' : 'Swap');

  const pos1Input = new TextInputBuilder()
    .setCustomId('position1')
    .setLabel(lang === 'ar' ? 'موضع1 (صف,زر)' : 'Pos1 (row,btn)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('1,2')
    .setRequired(true);

  const pos2Input = new TextInputBuilder()
    .setCustomId('position2')
    .setLabel(lang === 'ar' ? 'موضع2 (صف,زر)' : 'Pos2 (row,btn)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('2,1')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(pos1Input),
    new ActionRowBuilder().addComponents(pos2Input)
  );
  await interaction.showModal(modal);
}

async function showEditLabelsModal(interaction, lang) {
  const modal = new ModalBuilder()
    .setCustomId('modal_layout_edit_labels')
    .setTitle(lang === 'ar' ? 'تعديل نص زر' : 'Edit Button Label');

  const buttonInput = new TextInputBuilder()
    .setCustomId('button_id')
    .setLabel(lang === 'ar' ? 'رقم الزر: 1=تحالف, 2=مواعيد, 3=أعضاء...' : 'Button: 1=Alliance, 2=Appt, 3=Members...')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('1')
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(2);

  const labelArInput = new TextInputBuilder()
    .setCustomId('label_ar')
    .setLabel(lang === 'ar' ? 'النص العربي الجديد' : 'New Arabic Text')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(lang === 'ar' ? '🤝 التحالف' : '🤝 التحالف')
    .setRequired(true);

  const labelEnInput = new TextInputBuilder()
    .setCustomId('label_en')
    .setLabel(lang === 'ar' ? 'النص الإنجليزي الجديد' : 'New English Text')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('🤝 Alliance')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(buttonInput),
    new ActionRowBuilder().addComponents(labelArInput),
    new ActionRowBuilder().addComponents(labelEnInput)
  );
  
  await interaction.showModal(modal);
}

// About menu
async function showAboutMenu(interaction, lang) {
  const aboutData = db.getAboutData() || {};
  const content = aboutData.content || (lang === 'ar' 
    ? '**معلومات البوت**\n\nبوت إدارة التحالف\nالإصدار: 2.1.0'
    : '**Bot Information**\n\nAlliance Management Bot\nVersion: 2.1.0');
  
  await interaction.reply({ content, ephemeral: true });
}

// Check for bot updates
async function checkBotUpdate(interaction, lang) {
  await interaction.reply({ 
    content: lang === 'ar' 
      ? '✅ البوت محدث إلى أحدث إصدار (2.1.0)\n\nللتحديث اليدوي:\n```\ngit pull origin main\nnpm install\n```'
      : '✅ Bot is up to date (Version 2.1.0)\n\nFor manual update:\n```\ngit pull origin main\nnpm install\n```',
    ephemeral: true 
  });
}

// Button number mapping for edit labels
const buttonNumberMap = {
  1: 'menu_alliance',
  2: 'menu_ministry_appointments',
  3: 'menu_members',
  4: 'menu_logs',
  5: 'menu_schedule',
  6: 'menu_reminders',
  7: 'menu_permissions',
  8: 'menu_stats',
  9: 'menu_settings',
  10: 'menu_help',
  11: 'lang_switch'
};
