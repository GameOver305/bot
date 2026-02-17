import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType } from 'discord.js';
import { t } from '../utils/translations.js';
import db from '../utils/database.js';

export class ButtonManager {
  static createMainMenu(lang = 'en') {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(lang === 'ar' ? '🎮 لوحة التحكم الرئيسية' : '🎮 Main Control Panel')
      .setDescription(lang === 'ar' 
        ? '**مرحباً بك في نظام إدارة التحالف المتكامل**\n\n' +
          'استخدم الأزرار التالية للوصول إلى جميع الأنظمة:'
        : '**Welcome to the Complete Alliance Management System**\n\n' +
          'Use the buttons below to access all systems:')
      .setTimestamp();

    // Row 1: Core Systems
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_alliance')
          .setLabel(lang === 'ar' ? '🤝 التحالف' : '🤝 Alliance')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('menu_ministry_appointments')
          .setLabel(lang === 'ar' ? '📅 مواعيد الوزارات' : '📅 Ministry Appointments')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('menu_members')
          .setLabel(lang === 'ar' ? '👥 الأعضاء' : '👥 Members')
          .setStyle(ButtonStyle.Primary)
      );

    // Row 2: Advanced Systems
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_logs')
          .setLabel(lang === 'ar' ? '📜 السجلات' : '📜 Logs')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('menu_schedule')
          .setLabel(lang === 'ar' ? '📅 الجدولة' : '📅 Schedule')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('menu_reminders')
          .setLabel(lang === 'ar' ? '🔔 التذكيرات' : '🔔 Reminders')
          .setStyle(ButtonStyle.Success)
      );

    // Row 3: Management & Settings
    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_permissions')
          .setLabel(lang === 'ar' ? '� الأدمن' : '👮 Admin')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('menu_stats')
          .setLabel(lang === 'ar' ? '📊 الإحصائيات' : '📊 Stats')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('menu_settings')
          .setLabel(lang === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings')
          .setStyle(ButtonStyle.Secondary)
      );

    // Row 4: Help, Edit Description & Language
    const row4 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_help')
          .setLabel(lang === 'ar' ? '❓ المساعدة' : '❓ Help')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('edit_description_main')
          .setLabel(lang === 'ar' ? '📝 تعديل الشرح' : '📝 Edit Description')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('lang_switch')
          .setLabel(lang === 'ar' ? '🇺🇸 English' : '🇸🇦 العربية')
          .setStyle(ButtonStyle.Success)
      );

    return { embeds: [embed], components: [row1, row2, row3, row4] };
  }

  static createBookingsMenu(lang = 'en') {
    // This is now redirected to Ministry Appointments
    return this.createMinistryAppointmentsMenu(lang);
  }

  // New Ministry Appointments System
  static createMinistryAppointmentsMenu(lang = 'en') {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const appointments = db.getBookings('ministry') || [];

    let description = lang === 'ar'
      ? '**📅 نظام مواعيد الوزارات**\n\n' +
        'يمكنك حجز مواعيد للوزارات المختلفة (بناء، بحث، تدريب)\n' +
        `📆 الشهر الحالي: ${currentMonth}/${currentYear}\n\n`
      : '**📅 Ministry Appointments System**\n\n' +
        'Book appointments for different ministries (building, research, training)\n' +
        `📆 Current Month: ${currentMonth}/${currentYear}\n\n`;

    if (appointments.length > 0) {
      description += '**📋 ' + (lang === 'ar' ? 'المواعيد المسجلة:' : 'Registered Appointments:') + '**\n';
      appointments.slice(0, 10).forEach((apt, index) => {
        const ministry = apt.ministry || apt.type || 'N/A';
        const time = apt.time || '00:00';
        const date = apt.date || 'N/A';
        const user = apt.userName || 'N/A';
        description += `${index + 1}. **${ministry}** | ${date} ${time} | ${user}\n`;
      });
    } else {
      description += lang === 'ar' ? '❌ لا توجد مواعيد مسجلة حالياً' : '❌ No appointments registered';
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(lang === 'ar' ? '📅 مواعيد الوزارات' : '📅 Ministry Appointments')
      .setDescription(description)
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('appointment_building')
          .setLabel(lang === 'ar' ? '🏗️ البناء' : '🏗️ Building')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('appointment_research')
          .setLabel(lang === 'ar' ? '🔬 البحث' : '🔬 Research')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('appointment_training')
          .setLabel(lang === 'ar' ? '⚔️ التدريب' : '⚔️ Training')
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('appointment_view_all')
          .setLabel(lang === 'ar' ? '📋 عرض الكل' : '📋 View All')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('appointment_delete')
          .setLabel(lang === 'ar' ? '🗑️ حذف موعد' : '🗑️ Delete')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  static createBookingTypeMenu(type, lang = 'en') {
    const bookings = db.getBookings(type);
    
    let description = t(lang, 'bookings.description');
    
    if (bookings.length === 0) {
      description += '\n\n' + t(lang, 'bookings.empty');
    } else {
      description += '\n\n**📋 ' + (lang === 'ar' ? 'الحجوزات الحالية:' : 'Current Bookings:') + '**\n';
      bookings.forEach((booking, index) => {
        const memberName = booking.memberName || booking.userName || 'N/A';
        const allianceName = booking.allianceName || (lang === 'ar' ? 'غير محدد' : 'Not set');
        const start = new Date(booking.startDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
        const end = new Date(booking.endDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
        const duration = booking.duration || Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
        
        description += `\n**${index + 1}.** ${memberName} | ${allianceName}`;
        description += `\n   ${start} → ${end} (${duration} ${lang === 'ar' ? 'يوم' : 'day'}${duration > 1 ? 's' : ''})`;
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle(t(lang, `bookings.${type}`))
      .setDescription(description)
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`booking_add_${type}`)
          .setLabel(t(lang, 'bookings.add'))
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`booking_view_${type}`)
          .setLabel(t(lang, 'bookings.view'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`booking_delete_${type}`)
          .setLabel(lang === 'ar' ? '🗑️ حذف حجز' : '🗑️ Delete Booking')
          .setStyle(ButtonStyle.Danger)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_bookings')
          .setLabel(t(lang, 'bookings.back'))
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  static createAllianceMenu(lang = 'en') {
    const alliance = db.getAlliance();
    const hasAlliance = alliance.name && alliance.name !== '';
    
    const embed = new EmbedBuilder()
      .setColor('#ff00ff')
      .setTitle(lang === 'ar' ? '🤝 نظام التحالف' : '🤝 Alliance System')
      .setDescription(lang === 'ar'
        ? `**معلومات التحالف:**\n\n` +
          `📛 **الاسم:** ${alliance.name || 'غير مسجل'}\n` +
          `🏷️ **التاغ:** ${alliance.tag || 'غير محدد'}\n` +
          `👑 **القائد:** ${alliance.leader ? `<@${alliance.leader}>` : 'غير محدد'}\n` +
          `👥 **الأعضاء:** ${alliance.members.length}\n` +
          `📝 **الوصف:** ${alliance.description || 'لا يوجد'}`
        : `**Alliance Information:**\n\n` +
          `📛 **Name:** ${alliance.name || 'Not registered'}\n` +
          `🏷️ **Tag:** ${alliance.tag || 'Not set'}\n` +
          `👑 **Leader:** ${alliance.leader ? `<@${alliance.leader}>` : 'Not set'}\n` +
          `👥 **Members:** ${alliance.members.length}\n` +
          `📝 **Description:** ${alliance.description || 'None'}`)
      .setTimestamp();

    // Row 1: View Info
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('alliance_info')
          .setLabel(lang === 'ar' ? '📊 معلومات مفصلة' : '📊 Detailed Info')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('alliance_members')
          .setLabel(lang === 'ar' ? '👥 الأعضاء' : '👥 Members')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('alliance_ranks')
          .setLabel(lang === 'ar' ? '⭐ الرتب' : '⭐ Ranks')
          .setStyle(ButtonStyle.Secondary)
      );
    
    // Row 2: Member Management (was in alliance_commands)
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('alliance_add_member')
          .setLabel(lang === 'ar' ? '➕ إضافة عضو' : '➕ Add Member')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!hasAlliance),
        new ButtonBuilder()
          .setCustomId('alliance_remove_member')
          .setLabel(lang === 'ar' ? '➖ إزالة عضو' : '➖ Remove Member')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!hasAlliance),
        new ButtonBuilder()
          .setCustomId('alliance_change_rank')
          .setLabel(lang === 'ar' ? '⭐ تغيير رتبة' : '⭐ Change Rank')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasAlliance)
      );

    // Row 3: Alliance Settings
    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('alliance_register')
          .setLabel(lang === 'ar' ? '📝 تسجيل/تعديل' : '📝 Register/Edit')
          .setStyle(hasAlliance ? ButtonStyle.Secondary : ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('alliance_set_leader')
          .setLabel(lang === 'ar' ? '👑 تعيين قائد' : '👑 Set Leader')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasAlliance),
        new ButtonBuilder()
          .setCustomId('guild_alliance_link')
          .setLabel(lang === 'ar' ? '🔗 ربط تلقائي' : '🔗 Auto Link')
          .setStyle(ButtonStyle.Success)
      );

    // Row 4: Navigation
    const row4 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('close_menu')
          .setLabel(lang === 'ar' ? '❌ إغلاق' : '❌ Close')
          .setStyle(ButtonStyle.Danger)
      );

    return { embeds: [embed], components: [row1, row2, row3, row4] };
  }

  static createSettingsMenu(userId, lang = 'en') {
    const user = db.getUser(userId);
        const isOwner = true; // كل مستخدم يتحكم في لوحته فقط
    
    const embed = new EmbedBuilder()
      .setColor('#ffff00')
      .setTitle(lang === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings')
      .setDescription(lang === 'ar' 
        ? 'إعدادات البوت والتخصيص'
        : 'Bot settings and customization')
      .addFields(
        { name: lang === 'ar' ? '🌐 اللغة' : '🌐 Language', value: user.language === 'ar' ? 'العربية' : 'English', inline: true },
        { name: lang === 'ar' ? '🔔 التذكيرات' : '🔔 Reminders', value: user.notifications ? (lang === 'ar' ? 'مفعلة' : 'Enabled') : (lang === 'ar' ? 'معطلة' : 'Disabled'), inline: true },
        { name: lang === 'ar' ? '📦 الإصدار' : '📦 Version', value: '2.1.0', inline: true }
      )
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('settings_lang_ar')
          .setLabel('🇸🇦 العربية')
          .setStyle(user.language === 'ar' ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('settings_lang_en')
          .setLabel('🇺🇸 English')
          .setStyle(user.language === 'en' ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('settings_notifications')
          .setLabel(user.notifications ? '🔕' : '🔔')
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('settings_buttons')
          .setLabel(lang === 'ar' ? '🎨 تخصيص الأزرار' : '🎨 Customize Buttons')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('settings_about')
          .setLabel(lang === 'ar' ? 'ℹ️ عن البوت' : 'ℹ️ About')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('settings_update')
          .setLabel(lang === 'ar' ? '🔄 تحديث' : '🔄 Update')
          .setStyle(ButtonStyle.Success)
      );

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('close_menu')
          .setLabel(lang === 'ar' ? '❌ إغلاق' : '❌ Close')
          .setStyle(ButtonStyle.Danger)
      );

    const components = [row1, row2, row3];

        // لم يعد هناك زر خاص للمالك فقط، كل مستخدم يرى لوحة تحكمه

    return { embeds: [embed], components };
  }

  static createPermissionsMenu(userId, lang = 'en') {
    const perms = db.getPermissions();
    const isOwner = db.isOwner(userId);
    
    let adminList = lang === 'ar' ? 'لا يوجد مشرفين' : 'No admins';
    if (perms.admins.length > 0) {
      adminList = perms.admins.map(id => `<@${id}>`).join('\n');
    }

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(lang === 'ar' ? '👮 إدارة الأدمن والمالك' : '👮 Admin & Owner Panel')
      .setDescription(lang === 'ar' 
        ? '**لوحة تحكم متكاملة للإدارة**\n\n' +
          '• إضافة/إزالة المشرفين\n' +
          '• تغيير المالك\n' +
          '• إدارة السيرفرات\n' +
          '• تخصيص الأزرار'
        : '**Complete Admin Control Panel**\n\n' +
          '• Add/Remove admins\n' +
          '• Change owner\n' +
          '• Manage servers\n' +
          '• Customize buttons')
      .addFields(
        { name: lang === 'ar' ? '👑 المالك' : '👑 Owner', value: perms.owner ? `<@${perms.owner}>` : (lang === 'ar' ? 'غير محدد' : 'Not set'), inline: true },
        { name: lang === 'ar' ? '👮 المشرفين' : '👮 Admins', value: `${perms.admins.length}`, inline: true }
      )
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('perm_add_admin')
          .setLabel(lang === 'ar' ? '➕ إضافة أدمن' : '➕ Add Admin')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('perm_remove_admin')
          .setLabel(lang === 'ar' ? '➖ إزالة أدمن' : '➖ Remove Admin')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('owner_default_lang')
          .setLabel(lang === 'ar' ? '🌍 لغة البوت' : '🌍 Bot Language')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('owner_guilds')
          .setLabel(lang === 'ar' ? '🌐 السيرفرات' : '🌐 Servers')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('owner_buttons')
          .setLabel(lang === 'ar' ? '🎨 الأزرار' : '🎨 Buttons')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('perm_manage_admins')
          .setLabel(lang === 'ar' ? '📋 قائمة الأدمن' : '📋 Admin List')
          .setStyle(ButtonStyle.Secondary)
      );

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('close_menu')
          .setLabel(lang === 'ar' ? '❌ إغلاق' : '❌ Close')
          .setStyle(ButtonStyle.Danger)
      );

    return { embeds: [embed], components: [row1, row2, row3] };
  }

  static createStatsMenu(lang = 'en') {
    const allBookings = db.getBookings();
        const isOwner = db.isOwner(userId);
    const perms = db.getPermissions();
    
    const totalBookings = allBookings.building.length + allBookings.research.length + allBookings.training.length;
    
    const embed = new EmbedBuilder()
      .setColor('#00ffff')
      .setTitle(lang === 'ar' ? '📊 إحصائيات البوت' : '📊 Bot Statistics')
      .setDescription(lang === 'ar' ? 'إحصائيات الاستخدام الحالية' : 'Current usage statistics')
      .addFields(
        { name: '🏗️ حجوزات البناء', value: allBookings.building.length.toString(), inline: true },
        { name: '🔬 حجوزات الأبحاث', value: allBookings.research.length.toString(), inline: true },
        { name: '⚔️ حجوزات التدريب', value: allBookings.training.length.toString(), inline: true },
        { name: '📝 إجمالي الحجوزات', value: totalBookings.toString(), inline: true },
        { name: '👥 أعضاء التحالف', value: alliance.members.length.toString(), inline: true },
        { name: '👮 المشرفين', value: perms.admins.length.toString(), inline: true }
      )
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row] };
  }

  static createHelpMenu(lang = 'en') {
    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle(lang === 'ar' ? '❓ قائمة المساعدة' : '❓ Help Menu')
      .setDescription(lang === 'ar' 
        ? 'دليل استخدام البوت بالتفصيل'
        : 'Detailed bot usage guide')
      .addFields(
        { 
          name: lang === 'ar' ? '📅 نظام الحجوزات' : '📅 Booking System',
          value: lang === 'ar'
            ? '• اختر نوع الحجز (بناء/أبحاث/تدريب)\n• أضف حجز جديد بالضغط على زر "إضافة"\n• شاهد جميع الحجوزات\n• احذف حجزك الخاص'
            : '• Choose booking type\n• Add new booking\n• View all bookings\n• Delete your own booking',
          inline: false
        },
        {
          name: lang === 'ar' ? '🤝 نظام التحالف' : '🤝 Alliance System',
          value: lang === 'ar'
            ? '• عرض معلومات التحالف\n• قائمة الأعضاء\n• إدارة الأعضاء (R4, R5 فقط)'
            : '• View alliance info\n• List members\n• Manage members (R4, R5 only)',
          inline: false
        },
        {
          name: lang === 'ar' ? '🔔 التذكيرات' : '🔔 Reminders',
          value: lang === 'ar'
            ? '• تلقائية قبل: 24س، 6س، 3س، 1س\n• يمكن تفعيل/تعطيل من الإعدادات\n• تصل كرسائل خاصة'
            : '• Automatic before: 24h, 6h, 3h, 1h\n• Can enable/disable in settings\n• Sent as DMs',
          inline: false
        },
        {
          name: lang === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings',
          value: lang === 'ar'
            ? '• تغيير اللغة (عربي/إنجليزي)\n• تفعيل/تعطيل التذكيرات'
            : '• Change language\n• Toggle notifications',
          inline: false
        }
      )
      .setFooter({ text: lang === 'ar' ? 'للمزيد من المساعدة، راجع الوثائق' : 'For more help, check documentation' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row] };
  }

  // Reminders Menu
  static createRemindersMenu(userId, lang = 'en') {
    const reminders = db.getReminders(userId);
    
    const embed = new EmbedBuilder()
      .setColor('#ff6b6b')
      .setTitle(lang === 'ar' ? '🔔 نظام التذكيرات' : '🔔 Reminders System')
      .setDescription(lang === 'ar' 
        ? 'إدارة جميع تذكيراتك الشخصية\n\n' +
          '⏱️ **أوقات التذكير المتاحة:**\n' +
          '• قبل 5 دقائق\n• قبل 15 دقيقة\n• قبل 30 دقيقة\n• قبل ساعة\n• قبل يوم'
        : 'Manage all your personal reminders\n\n' +
          '⏱️ **Available reminder times:**\n' +
          '• 5 minutes before\n• 15 minutes before\n• 30 minutes before\n• 1 hour before\n• 1 day before')
      .setTimestamp();

    if (reminders.length === 0) {
      embed.addFields({
        name: lang === 'ar' ? '📝 التذكيرات' : '📝 Reminders',
        value: lang === 'ar' ? 'لا توجد تذكيرات حالياً' : 'No reminders currently',
        inline: false
      });
    } else {
      const remindersList = reminders.slice(0, 5).map((r, i) => {
        const date = new Date(r.time).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
        const reminderTime = r.reminderBefore || '1h';
        return `**${i + 1}.** ${r.message}\n   ⏰ ${date} | ⏱️ ${reminderTime}`;
      }).join('\n\n');

      embed.addFields({
        name: lang === 'ar' ? `📝 التذكيرات (${reminders.length})` : `📝 Reminders (${reminders.length})`,
        value: remindersList,
        inline: false
      });
    }

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('reminder_add')
          .setLabel(lang === 'ar' ? '➕ إضافة تذكير' : '➕ Add Reminder')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('reminder_edit_message')
          .setLabel(lang === 'ar' ? '✏️ تعديل رسالة' : '✏️ Edit Message')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(reminders.length === 0),
        new ButtonBuilder()
          .setCustomId('reminder_set_time')
          .setLabel(lang === 'ar' ? '⏱️ وقت التذكير' : '⏱️ Set Time')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(reminders.length === 0)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('reminder_view')
          .setLabel(lang === 'ar' ? '📋 عرض الكل' : '📋 View All')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('reminder_delete')
          .setLabel(lang === 'ar' ? '🗑️ حذف تذكير' : '🗑️ Delete Reminder')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(reminders.length === 0),
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  // Alliance Management Menu
  static createAllianceManageMenu(userId, lang = 'en') {
    const hasPermission = db.hasAlliancePermission(userId) || db.isAdmin(userId);
    const isR5OrAdmin = (db.getAlliance().leader === userId) || db.isAdmin(userId);
    const alliance = db.getAlliance();
    const hasAlliance = alliance.name && alliance.name !== '';

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle(lang === 'ar' ? '⚙️ إدارة التحالف' : '⚙️ Alliance Management')
      .setDescription(lang === 'ar'
        ? 'إدارة كاملة لأعضاء ومعلومات التحالف'
        : 'Complete management of alliance members and information')
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('alliance_register')
          .setLabel(lang === 'ar' ? '📝 تسجيل التحالف' : '📝 Register Alliance')
          .setStyle(hasAlliance ? ButtonStyle.Secondary : ButtonStyle.Success)
          .setDisabled(!isR5OrAdmin),
        new ButtonBuilder()
          .setCustomId('alliance_set_info')
          .setLabel(lang === 'ar' ? '✏️ تعديل المعلومات' : '✏️ Edit Info')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isR5OrAdmin || !hasAlliance),
        new ButtonBuilder()
          .setCustomId('alliance_set_leader')
          .setLabel(lang === 'ar' ? '👑 تعيين قائد' : '👑 Set Leader')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!db.isAdmin(userId))
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('alliance_add_member')
          .setLabel(lang === 'ar' ? '➕ إضافة عضو' : '➕ Add Member')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!hasPermission || !hasAlliance),
        new ButtonBuilder()
          .setCustomId('alliance_remove_member')
          .setLabel(lang === 'ar' ? '➖ إزالة عضو' : '➖ Remove Member')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!hasPermission || !hasAlliance),
        new ButtonBuilder()
          .setCustomId('alliance_change_rank')
          .setLabel(lang === 'ar' ? '⭐ تغيير رتبة' : '⭐ Change Rank')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasPermission || !hasAlliance)
      );

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_alliance')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2, row3] };
  }

  // Admin Management Menu
  static createAdminMenu(userId, lang = 'en') {
    const perms = db.getPermissions();
    
    let adminList = lang === 'ar' ? 'لا يوجد مشرفين' : 'No admins';
    if (perms.admins.length > 0) {
      adminList = perms.admins.map((id, i) => `${i + 1}. <@${id}>`).join('\n');
    }

    const embed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle(lang === 'ar' ? '👮 إدارة المشرفين' : '👮 Admin Management')
      .setDescription(lang === 'ar'
        ? 'إدارة صلاحيات المشرفين والمالك'
        : 'Manage admin permissions and owner')
      .addFields(
        { name: '👑 ' + (lang === 'ar' ? 'المالك' : 'Owner'), value: perms.owner ? `<@${perms.owner}>` : (lang === 'ar' ? 'غير محدد' : 'Not set'), inline: false },
        { name: '👮 ' + (lang === 'ar' ? 'المشرفين' : 'Admins'), value: adminList, inline: false }
      )
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('admin_add')
          .setLabel(lang === 'ar' ? '➕ إضافة مشرف' : '➕ Add Admin')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('admin_remove')
          .setLabel(lang === 'ar' ? '➖ حذف مشرف' : '➖ Remove Admin')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(perms.admins.length === 0)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_permissions')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  // Members Management Menu - Advanced with Game ID
  static createMembersMenu(userId, lang = 'en') {
    const alliance = db.getAlliance();
    const hasPermission = db.hasAlliancePermission(userId) || db.isAdmin(userId);
    const isOwner = db.isOwner(userId);
    
    let membersList = lang === 'ar' ? 'لا يوجد أعضاء' : 'No members';
    if (alliance.members && alliance.members.length > 0) {
      const displayMembers = alliance.members.slice(0, 8);
      membersList = displayMembers.map((m, i) => {
        const gameInfo = m.gameId ? `🎮 ${m.gameId}` : '';
        const power = m.power ? `⚡ ${(m.power/1000000).toFixed(1)}M` : '';
        return `${i + 1}. <@${m.id}> **[${m.rank}]**\n   ${gameInfo} ${power}`;
      }).join('\n');
      
      if (alliance.members.length > 8) {
        membersList += `\n\n${lang === 'ar' ? '...والمزيد' : '...and more'} (${alliance.members.length} ${lang === 'ar' ? 'عضو' : 'members'})`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle(lang === 'ar' ? '👥 إدارة الأعضاء المتقدمة' : '👥 Advanced Members Management')
      .setDescription(lang === 'ar'
        ? '**نظام إدارة الأعضاء المتكامل**\n\n' +
          '🎮 ربط حسابات اللعبة بالدسكورد\n' +
          '⚡ تتبع القوة ومستوى الفرن\n' +
          '👑 تعيين الرتب والقادة'
        : '**Complete Members Management System**\n\n' +
          '🎮 Link game accounts with Discord\n' +
          '⚡ Track power and furnace level\n' +
          '👑 Assign ranks and leaders')
      .addFields({
        name: lang === 'ar' ? `📋 الأعضاء (${alliance.members?.length || 0})` : `📋 Members (${alliance.members?.length || 0})`,
        value: membersList,
        inline: false
      })
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('member_add_advanced')
          .setLabel(lang === 'ar' ? '➕ إضافة عضو' : '➕ Add Member')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('member_edit_game')
          .setLabel(lang === 'ar' ? '🎮 تعديل بيانات اللعبة' : '🎮 Edit Game Data')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('member_set_leader')
          .setLabel(lang === 'ar' ? '👑 تعيين قائد' : '👑 Set Leader')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!isOwner)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('member_change_rank')
          .setLabel(lang === 'ar' ? '⭐ تغيير رتبة' : '⭐ Change Rank')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('member_remove')
          .setLabel(lang === 'ar' ? '➖ إزالة عضو' : '➖ Remove Member')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('member_view_profile')
          .setLabel(lang === 'ar' ? '👤 عرض ملف' : '👤 View Profile')
          .setStyle(ButtonStyle.Secondary)
      );

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('member_list_all')
          .setLabel(lang === 'ar' ? '📋 عرض الكل' : '📋 View All')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('member_search')
          .setLabel(lang === 'ar' ? '🔍 بحث' : '🔍 Search')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('member_export')
          .setLabel(lang === 'ar' ? '📤 تصدير' : '📤 Export')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2, row3] };
  }

  // Ministries Menu
  static createMinistriesMenu(userId, lang = 'en') {
    const ministries = db.getMinistries();
    const hasPermission = db.isAdmin(userId);
    
    let ministriesList = lang === 'ar' ? 'لا توجد وزارات' : 'No ministries';
    if (ministries && ministries.length > 0) {
      ministriesList = ministries.slice(0, 5).map((m, i) => {
        const minister = m.minister ? `<@${m.minister}>` : (lang === 'ar' ? 'غير معين' : 'Not assigned');
        return `${i + 1}. **${m.name}**\n   👤 ${minister}`;
      }).join('\n\n');
      
      if (ministries.length > 5) {
        ministriesList += `\n\n${lang === 'ar' ? '...والمزيد' : '...and more'} (${ministries.length} ${lang === 'ar' ? 'وزارة' : 'ministries'})`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle(lang === 'ar' ? '🏛️ نظام الوزارات' : '🏛️ Ministries System')
      .setDescription(lang === 'ar'
        ? 'إدارة الوزارات وتعيين الوزراء'
        : 'Manage ministries and assign ministers')
      .addFields({
        name: lang === 'ar' ? '📋 الوزارات' : '📋 Ministries',
        value: ministriesList,
        inline: false
      })
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ministry_add')
          .setLabel(lang === 'ar' ? '➕ إضافة وزارة' : '➕ Add Ministry')
          .setEmoji('➕')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('ministry_view')
          .setLabel(lang === 'ar' ? '📋 عرض الكل' : '📋 View All')
          .setEmoji('📋')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('ministry_assign')
          .setLabel(lang === 'ar' ? '👤 تعيين وزير' : '👤 Assign Minister')
          .setEmoji('👤')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasPermission)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ministry_schedule')
          .setLabel(lang === 'ar' ? '📅 جدولة نشاط' : '📅 Schedule Activity')
          .setEmoji('📅')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('ministry_delete')
          .setLabel(lang === 'ar' ? '🗑️ حذف وزارة' : '🗑️ Delete Ministry')
          .setEmoji('🗑️')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!hasPermission || !ministries || ministries.length === 0),
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ القائمة الرئيسية' : '◀️ Main Menu')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  // Logs Menu
  static createLogsMenu(userId, lang = 'en') {
    const hasPermission = db.isAdmin(userId);
    const logChannel = db.getLogChannel('default');
    const recentLogs = db.getRecentLogs(5);
    
    let logsText = lang === 'ar' ? 'لا توجد سجلات' : 'No logs';
    if (recentLogs && recentLogs.length > 0) {
      logsText = recentLogs.map((log, i) => {
        const time = new Date(log.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return `${i + 1}. **${log.action}** - <@${log.userId}>\n   ⏰ ${time}`;
      }).join('\n');
    }

    const embed = new EmbedBuilder()
      .setColor('#e67e22')
      .setTitle(lang === 'ar' ? '📜 نظام السجلات' : '📜 Logs System')
      .setDescription(lang === 'ar'
        ? 'تتبع جميع العمليات والأنشطة'
        : 'Track all operations and activities')
      .addFields(
        {
          name: lang === 'ar' ? '📺 قناة السجلات' : '📺 Log Channel',
          value: logChannel ? `<#${logChannel}>` : (lang === 'ar' ? '❌ غير محددة' : '❌ Not set'),
          inline: false
        },
        {
          name: lang === 'ar' ? '📋 آخر السجلات' : '📋 Recent Logs',
          value: logsText,
          inline: false
        }
      )
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('logs_set_channel')
          .setLabel(lang === 'ar' ? '📺 تعيين قناة' : '📺 Set Channel')
          .setEmoji('📺')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('logs_view_all')
          .setLabel(lang === 'ar' ? '📋 عرض الكل' : '📋 View All')
          .setEmoji('📋')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('logs_clear_channel')
          .setLabel(lang === 'ar' ? '🗑️ إزالة القناة' : '🗑️ Remove Channel')
          .setEmoji('🗑️')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!hasPermission || !logChannel)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ القائمة الرئيسية' : '◀️ Main Menu')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  // Schedule Menu
  static createScheduleMenu(userId, lang = 'en') {
    const hasPermission = db.isAdmin(userId);
    const schedules = db.getScheduledBookings();
    
    let schedulesText = lang === 'ar' ? 'لا توجد جداول' : 'No schedules';
    if (schedules && schedules.length > 0) {
      schedulesText = schedules.slice(0, 5).map((s, i) => {
        const time = new Date(s.startTime).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
        const repeat = s.repeat ? '🔄' : '⏱️';
        return `${i + 1}. ${repeat} ${lang === 'ar' ? 'نشاط' : 'Activity'} #${s.activityId}\n   ⏰ ${time}`;
      }).join('\n');
      
      if (schedules.length > 5) {
        schedulesText += `\n\n${lang === 'ar' ? '...والمزيد' : '...and more'} (${schedules.length} ${lang === 'ar' ? 'جدول' : 'schedules'})`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#e91e63')
      .setTitle(lang === 'ar' ? '📅 نظام الجدولة المتقدم' : '📅 Advanced Schedule System')
      .setDescription(lang === 'ar'
        ? 'جدولة الأنشطة والتنبيهات المتكررة'
        : 'Schedule activities and recurring alerts')
      .addFields({
        name: lang === 'ar' ? '📋 الجداول النشطة' : '📋 Active Schedules',
        value: schedulesText,
        inline: false
      })
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('schedule_create')
          .setLabel(lang === 'ar' ? '➕ إنشاء جدول' : '➕ Create Schedule')
          .setEmoji('➕')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('schedule_view_all')
          .setLabel(lang === 'ar' ? '📋 عرض الكل' : '📋 View All')
          .setEmoji('📋')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('schedule_alert')
          .setLabel(lang === 'ar' ? '🔔 تنبيه مجدول' : '🔔 Scheduled Alert')
          .setEmoji('🔔')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasPermission)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('schedule_delete')
          .setLabel(lang === 'ar' ? '🗑️ حذف جدول' : '🗑️ Delete Schedule')
          .setEmoji('🗑️')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!hasPermission || !schedules || schedules.length === 0),
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ القائمة الرئيسية' : '◀️ Main Menu')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  // Owner Admin Menu - Advanced Settings for Owner Only
  static createOwnerAdminMenu(userId, lang = 'en') {
    const isOwner = db.isOwner(userId);

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(lang === 'ar' ? '👑 لوحة التحكم المتقدمة - المالك فقط' : '👑 Advanced Admin Panel - Owner Only')
      .setDescription(lang === 'ar' 
        ? '⚠️ **هذه القائمة مخصصة للمالك فقط**\n\n' +
          'إدارة متقدمة للنظام والصلاحيات'
        : '⚠️ **This menu is for owner only**\n\n' +
          'Advanced system and permissions management')
      .setTimestamp();

    if (!isOwner) {
      embed.setDescription(lang === 'ar' 
        ? '❌ ليس لديك صلاحية الوصول لهذه القائمة' 
        : '❌ You don\'t have permission to access this menu');
    }

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('owner_guilds')
          .setLabel(lang === 'ar' ? '🌐 إدارة السيرفرات' : '🌐 Manage Servers')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('owner_buttons')
          .setLabel(lang === 'ar' ? '🔧 تعديل الأزرار' : '🔧 Customize Buttons')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('owner_permissions')
          .setLabel(lang === 'ar' ? '🔐 الصلاحيات' : '🔐 Permissions')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!isOwner)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('owner_auto_update')
          .setLabel(lang === 'ar' ? '🔄 تحديث البوت' : '🔄 Update Bot')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('owner_texts')
          .setLabel(lang === 'ar' ? '✏️ تحكم النصوص' : '✏️ Text Control')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('owner_security')
          .setLabel(lang === 'ar' ? '🛡️ الحماية' : '🛡️ Security')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!isOwner)
      );

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('owner_default_lang')
          .setLabel(lang === 'ar' ? '🌍 اللغة الافتراضية' : '🌍 Default Language')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('owner_cleanup')
          .setLabel(lang === 'ar' ? '🧹 تنظيف البيانات' : '🧹 Cleanup Data')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ القائمة الرئيسية' : '◀️ Main Menu')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2, row3] };
  }

  // Guilds Management Menu
  static createGuildsMenu(userId, lang = 'en') {
    const isOwner = db.isOwner(userId);
    const guilds = db.getGuilds();

    let description = lang === 'ar'
      ? '**إدارة السيرفرات المسجلة**\n\n'
      : '**Manage Registered Servers**\n\n';

    if (guilds.registered && guilds.registered.length > 0) {
      description += '**📋 ' + (lang === 'ar' ? 'السيرفرات المسجلة:' : 'Registered Servers:') + '**\n';
      guilds.registered.forEach((guild, index) => {
        const addedDate = new Date(guild.addedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
        description += `\n${index + 1}. **${guild.name}**\n   🆔 ${guild.id}\n   📅 ${addedDate}`;
      });
    } else {
      description += lang === 'ar' 
        ? '❌ لا توجد سيرفرات مسجلة حالياً\n\nℹ️ **ملاحظة:** GUILD_ID في ملف .env يستخدم فقط للتسجيل السريع للأوامر.\nإذا تركته فارغاً، سيتم تسجيل الأوامر عالمياً وستعمل في جميع السيرفرات.'
        : '❌ No servers registered currently\n\nℹ️ **Note:** GUILD_ID in .env is only used for fast command registration.\nIf left empty, commands will be registered globally and work in all servers.';
    }

    const embed = new EmbedBuilder()
      .setColor('#00ffff')
      .setTitle(lang === 'ar' ? '🌐 إدارة السيرفرات' : '🌐 Server Management')
      .setDescription(description)
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('guild_add')
          .setLabel(lang === 'ar' ? '➕ إضافة سيرفر' : '➕ Add Server')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('guild_remove')
          .setLabel(lang === 'ar' ? '➖ إزالة سيرفر' : '➖ Remove Server')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!isOwner || !guilds.registered || guilds.registered.length === 0),
        new ButtonBuilder()
          .setCustomId('guild_info')
          .setLabel(lang === 'ar' ? 'ℹ️ معلومات' : 'ℹ️ Info')
          .setStyle(ButtonStyle.Secondary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_owner_admin')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  // Button Layout Customization Menu
  static createButtonLayoutMenu(userId, lang = 'en', selectedBtn = null) {
    const isOwner = db.isOwner(userId);
    const layout = db.getButtonLayout();

    const buttonNames = {
      menu_alliance: { ar: '🤝 التحالف', en: '🤝 Alliance' },
      menu_ministry_appointments: { ar: '📅 المواعيد', en: '📅 Appointments' },
      menu_bookings: { ar: '📅 الحجوزات', en: '📅 Bookings' },
      menu_members: { ar: '👥 الأعضاء', en: '👥 Members' },
      menu_logs: { ar: '📜 السجلات', en: '📜 Logs' },
      menu_schedule: { ar: '📅 الجدولة', en: '📅 Schedule' },
      menu_reminders: { ar: '🔔 التذكيرات', en: '🔔 Reminders' },
      menu_permissions: { ar: '👮 الأدمن', en: '👮 Admin' },
      menu_stats: { ar: '📊 الإحصائيات', en: '📊 Stats' },
      menu_settings: { ar: '⚙️ الإعدادات', en: '⚙️ Settings' },
      menu_help: { ar: '❓ المساعدة', en: '❓ Help' },
      lang_switch: { ar: '🌐 اللغة', en: '🌐 Language' },
      menu_ministries: { ar: '🏛️ الوزارات', en: '🏛️ Ministries' }
    };

    // Build visual layout display
    let description = lang === 'ar'
      ? '**🎨 تخصيص ترتيب الأزرار**\n\n'
      : '**🎨 Customize Button Layout**\n\n';

    description += '**' + (lang === 'ar' ? '📋 الترتيب الحالي:' : '📋 Current Layout:') + '**\n\n';
    
    let btnIndex = 1;
    layout.rows.forEach((row, rowIndex) => {
      description += `**${lang === 'ar' ? 'صف' : 'Row'} ${rowIndex + 1}:** `;
      const rowBtns = row.map(btn => {
        const name = buttonNames[btn] ? buttonNames[btn][lang] : btn;
        const marker = selectedBtn === `${rowIndex},${row.indexOf(btn)}` ? '**[ ' : '';
        const markerEnd = selectedBtn === `${rowIndex},${row.indexOf(btn)}` ? ' ]**' : '';
        return `${marker}${btnIndex++}. ${name}${markerEnd}`;
      });
      description += rowBtns.join(' | ') + '\n';
    });

    if (selectedBtn) {
      const [selRow, selCol] = selectedBtn.split(',').map(Number);
      const selBtnId = layout.rows[selRow]?.[selCol];
      const selName = buttonNames[selBtnId] ? buttonNames[selBtnId][lang] : selBtnId;
      description += '\n' + (lang === 'ar' 
        ? `✨ **الزر المحدد:** ${selName}\nاستخدم الأسهم لتحريكه`
        : `✨ **Selected:** ${selName}\nUse arrows to move it`);
    } else {
      description += '\n' + (lang === 'ar'
        ? '👆 **اختر زراً من القائمة أدناه لتحريكه**'
        : '👆 **Select a button from the menu below to move it**');
    }

    const embed = new EmbedBuilder()
      .setColor('#9900ff')
      .setTitle(lang === 'ar' ? '🎨 تخصيص الأزرار' : '🎨 Button Customization')
      .setDescription(description)
      .setTimestamp();

    // Create select menu with all buttons
    const selectOptions = [];
    let idx = 0;
    layout.rows.forEach((row, rowIndex) => {
      row.forEach((btn, colIndex) => {
        idx++;
        const name = buttonNames[btn] ? buttonNames[btn][lang] : btn;
        selectOptions.push({
          label: `${idx}. ${name.replace(/[^\w\s\u0600-\u06FF]/g, '')}`,
          description: `${lang === 'ar' ? 'صف' : 'Row'} ${rowIndex + 1}, ${lang === 'ar' ? 'موضع' : 'Pos'} ${colIndex + 1}`,
          value: `${rowIndex},${colIndex}`,
          default: selectedBtn === `${rowIndex},${colIndex}`
        });
      });
    });

    const selectMenu = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('layout_select_btn')
          .setPlaceholder(lang === 'ar' ? '📌 اختر زراً لتحريكه...' : '📌 Select a button to move...')
          .addOptions(selectOptions.slice(0, 25))
      );

    // Arrow buttons for movement
    const arrowRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('layout_move_up')
          .setLabel('⬆️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner || !selectedBtn),
        new ButtonBuilder()
          .setCustomId('layout_move_down')
          .setLabel('⬇️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner || !selectedBtn),
        new ButtonBuilder()
          .setCustomId('layout_move_left')
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner || !selectedBtn),
        new ButtonBuilder()
          .setCustomId('layout_move_right')
          .setLabel('➡️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner || !selectedBtn)
      );

    // Quick swap and actions
    const actionsRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('layout_swap')
          .setLabel(lang === 'ar' ? '🔄 تبديل سريع' : '🔄 Quick Swap')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('layout_reset')
          .setLabel(lang === 'ar' ? '↩️ إعادة ضبط' : '↩️ Reset')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('layout_preview')
          .setLabel(lang === 'ar' ? '👁️ معاينة' : '👁️ Preview')
          .setStyle(ButtonStyle.Secondary)
      );

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_owner_admin')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('close_menu')
          .setLabel(lang === 'ar' ? '❌ إغلاق' : '❌ Close')
          .setStyle(ButtonStyle.Danger)
      );

    return { embeds: [embed], components: [selectMenu, arrowRow, actionsRow, backRow] };
  }

  // Enhanced Button Swap Menu with two select menus
  static createButtonSwapMenu(userId, lang = 'en', selectedFirst = null) {
    const isOwner = db.isOwner(userId);
    const layout = db.getButtonLayout();

    const buttonNames = {
      menu_alliance: { ar: '🤝 التحالف', en: '🤝 Alliance' },
      menu_ministry_appointments: { ar: '📅 المواعيد', en: '📅 Appointments' },
      menu_bookings: { ar: '📅 الحجوزات', en: '📅 Bookings' },
      menu_members: { ar: '👥 الأعضاء', en: '👥 Members' },
      menu_logs: { ar: '📜 السجلات', en: '📜 Logs' },
      menu_schedule: { ar: '📅 الجدولة', en: '📅 Schedule' },
      menu_reminders: { ar: '🔔 التذكيرات', en: '🔔 Reminders' },
      menu_permissions: { ar: '👮 الأدمن', en: '👮 Admin' },
      menu_stats: { ar: '📊 الإحصائيات', en: '📊 Stats' },
      menu_settings: { ar: '⚙️ الإعدادات', en: '⚙️ Settings' },
      menu_help: { ar: '❓ المساعدة', en: '❓ Help' },
      lang_switch: { ar: '🌐 اللغة', en: '🌐 Language' },
      menu_ministries: { ar: '🏛️ الوزارات', en: '🏛️ Ministries' }
    };

    let description = lang === 'ar'
      ? '**🔄 تبديل مواضع الأزرار**\n\n'
      : '**🔄 Swap Button Positions**\n\n';

    if (selectedFirst) {
      const [r, c] = selectedFirst.split(',').map(Number);
      const btnId = layout.rows[r]?.[c];
      const btnName = buttonNames[btnId] ? buttonNames[btnId][lang] : btnId;
      description += lang === 'ar'
        ? `✅ **الزر الأول:** ${btnName}\n\n👇 **الآن اختر الزر الثاني للتبديل معه:**`
        : `✅ **First button:** ${btnName}\n\n👇 **Now select the second button to swap with:**`;
    } else {
      description += lang === 'ar'
        ? '👆 **اختر الزر الأول للتبديل:**'
        : '👆 **Select the first button to swap:**';
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(lang === 'ar' ? '🔄 تبديل الأزرار' : '🔄 Swap Buttons')
      .setDescription(description)
      .setTimestamp();

    // Create select options
    const selectOptions = [];
    let idx = 0;
    layout.rows.forEach((row, rowIndex) => {
      row.forEach((btn, colIndex) => {
        idx++;
        const name = buttonNames[btn] ? buttonNames[btn][lang] : btn;
        const pos = `${rowIndex},${colIndex}`;
        if (pos !== selectedFirst) {
          selectOptions.push({
            label: `${idx}. ${name.replace(/[^\w\s\u0600-\u06FF]/g, '')}`,
            description: `${lang === 'ar' ? 'صف' : 'Row'} ${rowIndex + 1}`,
            value: pos
          });
        }
      });
    });

    const components = [];

    if (selectedFirst) {
      // Show second select menu
      const selectMenu2 = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('swap_select_second')
            .setPlaceholder(lang === 'ar' ? '🎯 اختر الزر الثاني...' : '🎯 Select second button...')
            .addOptions(selectOptions.slice(0, 25))
        );
      components.push(selectMenu2);
    } else {
      // Show first select menu
      const allOptions = [];
      idx = 0;
      layout.rows.forEach((row, rowIndex) => {
        row.forEach((btn, colIndex) => {
          idx++;
          const name = buttonNames[btn] ? buttonNames[btn][lang] : btn;
          allOptions.push({
            label: `${idx}. ${name.replace(/[^\w\s\u0600-\u06FF]/g, '')}`,
            description: `${lang === 'ar' ? 'صف' : 'Row'} ${rowIndex + 1}`,
            value: `${rowIndex},${colIndex}`
          });
        });
      });

      const selectMenu1 = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('swap_select_first')
            .setPlaceholder(lang === 'ar' ? '📌 اختر الزر الأول...' : '📌 Select first button...')
            .addOptions(allOptions.slice(0, 25))
        );
      components.push(selectMenu1);
    }

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('owner_buttons')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('close_menu')
          .setLabel(lang === 'ar' ? '❌ إغلاق' : '❌ Close')
          .setStyle(ButtonStyle.Danger)
      );
    components.push(backRow);

    return { embeds: [embed], components };
  }

  // Admin Selection Menu with User Select
  static createAdminSelectMenu(userId, lang = 'en', action = 'add') {
    const perms = db.getPermissions();
    
    const embed = new EmbedBuilder()
      .setColor(action === 'add' ? '#00ff00' : '#ff0000')
      .setTitle(lang === 'ar' 
        ? (action === 'add' ? '➕ إضافة مشرف' : '➖ إزالة مشرف')
        : (action === 'add' ? '➕ Add Admin' : '➖ Remove Admin'))
      .setDescription(lang === 'ar'
        ? (action === 'add' 
          ? '👇 **اختر العضو الذي تريد منحه صلاحية المشرف:**'
          : '👇 **اختر المشرف الذي تريد إزالته:**')
        : (action === 'add'
          ? '👇 **Select the member to grant admin permissions:**'
          : '👇 **Select the admin to remove:**'))
      .setTimestamp();

    if (action === 'remove' && perms.admins.length > 0) {
      embed.addFields({
        name: lang === 'ar' ? '👮 المشرفين الحاليين' : '👮 Current Admins',
        value: perms.admins.map(id => `<@${id}>`).join('\n') || (lang === 'ar' ? 'لا يوجد' : 'None')
      });
    }

    const userSelect = new ActionRowBuilder()
      .addComponents(
        new UserSelectMenuBuilder()
          .setCustomId(action === 'add' ? 'admin_user_add' : 'admin_user_remove')
          .setPlaceholder(lang === 'ar' ? '👤 اختر عضواً...' : '👤 Select a member...')
          .setMinValues(1)
          .setMaxValues(1)
      );

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_permissions')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('close_menu')
          .setLabel(lang === 'ar' ? '❌ إغلاق' : '❌ Close')
          .setStyle(ButtonStyle.Danger)
      );

    return { embeds: [embed], components: [userSelect, backRow] };
  }

  // Log Channel Selection Menu
  static createLogChannelMenu(userId, lang = 'en') {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(lang === 'ar' ? '📜 تعيين قناة السجلات' : '📜 Set Log Channel')
      .setDescription(lang === 'ar'
        ? '👇 **اختر القناة التي تريد إرسال السجلات إليها:**\n\n' +
          '💡 سيتم إرسال جميع سجلات التحالف والأنشطة إلى هذه القناة.'
        : '👇 **Select the channel to send logs to:**\n\n' +
          '💡 All alliance and activity logs will be sent to this channel.')
      .setTimestamp();

    const channelSelect = new ActionRowBuilder()
      .addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId('log_channel_select')
          .setPlaceholder(lang === 'ar' ? '📺 اختر قناة...' : '📺 Select a channel...')
          .addChannelTypes(ChannelType.GuildText)
      );

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_logs')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('remove_log_channel')
          .setLabel(lang === 'ar' ? '🗑️ إزالة القناة' : '🗑️ Remove Channel')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('close_menu')
          .setLabel(lang === 'ar' ? '❌ إغلاق' : '❌ Close')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [channelSelect, backRow] };
  }

  // Default Language Menu for Owner
  static createDefaultLanguageMenu(userId, lang = 'en') {
    const currentDefault = db.getDefaultLanguage();
    
    const embed = new EmbedBuilder()
      .setColor('#9900ff')
      .setTitle(lang === 'ar' ? '🌍 لغة البوت الافتراضية' : '🌍 Default Bot Language')
      .setDescription(lang === 'ar'
        ? `**اللغة الافتراضية الحالية:** ${currentDefault === 'ar' ? '🇸🇦 العربية' : '🇺🇸 English'}\n\n` +
          '💡 هذه اللغة ستظهر للمستخدمين الجدد.\n' +
          'المستخدمون يمكنهم تغيير لغتهم الشخصية.'
        : `**Current default language:** ${currentDefault === 'ar' ? '🇸🇦 Arabic' : '🇺🇸 English'}\n\n` +
          '💡 This language will be shown to new users.\n' +
          'Users can change their personal language.')
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('set_default_lang_ar')
          .setLabel('🇸🇦 العربية')
          .setStyle(currentDefault === 'ar' ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('set_default_lang_en')
          .setLabel('🇺🇸 English')
          .setStyle(currentDefault === 'en' ? ButtonStyle.Success : ButtonStyle.Secondary)
      );

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_permissions')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('close_menu')
          .setLabel(lang === 'ar' ? '❌ إغلاق' : '❌ Close')
          .setStyle(ButtonStyle.Danger)
      );

    return { embeds: [embed], components: [row1, backRow] };
  }

  // Custom Texts Control Menu
  static createCustomTextsMenu(userId, lang = 'en') {
    const isOwner = db.isOwner(userId);
    const texts = db.getCustomTexts();

    const embed = new EmbedBuilder()
      .setColor('#ff6b6b')
      .setTitle(lang === 'ar' ? '✏️ تحكم في النصوص' : '✏️ Text Control')
      .setDescription(lang === 'ar'
        ? '**تخصيص النصوص داخل البوت**\n\n' +
          'يمكنك تعديل:\n' +
          '• عناوين القوائم\n' +
          '• رسائل الترحيب\n' +
          '• أسماء الأزرار\n' +
          '• الإشعارات'
        : '**Customize bot texts**\n\n' +
          'You can edit:\n' +
          '• Menu titles\n' +
          '• Welcome messages\n' +
          '• Button names\n' +
          '• Notifications')
      .addFields(
        { name: lang === 'ar' ? '📝 العنوان الرئيسي' : '📝 Main Title', value: texts.mainTitle?.[lang] || '-', inline: true },
        { name: lang === 'ar' ? '👋 رسالة الترحيب' : '👋 Welcome Message', value: texts.welcomeMessage?.[lang] || '-', inline: true }
      )
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('text_edit_title')
          .setLabel(lang === 'ar' ? '📝 تعديل العنوان' : '📝 Edit Title')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('text_edit_welcome')
          .setLabel(lang === 'ar' ? '👋 تعديل الترحيب' : '👋 Edit Welcome')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('text_edit_buttons')
          .setLabel(lang === 'ar' ? '🔘 تعديل الأزرار' : '🔘 Edit Buttons')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('text_reset_all')
          .setLabel(lang === 'ar' ? '↩️ استعادة الافتراضي' : '↩️ Reset to Default')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('back_owner_admin')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  // Security System Menu
  static createSecurityMenu(userId, lang = 'en') {
    const isOwner = db.isOwner(userId);
    const perms = db.getPermissions();
    
    const embed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle(lang === 'ar' ? '🛡️ نظام الحماية' : '🛡️ Security System')
      .setDescription(lang === 'ar'
        ? '**نظام حماية متكامل للبوت**\n\n' +
          '🔒 حماية الأوامر الحساسة\n' +
          '👁️ تتبع النشاطات\n' +
          '⚠️ تنبيهات الأمان\n' +
          '🚫 حظر المستخدمين'
        : '**Complete bot security system**\n\n' +
          '🔒 Protect sensitive commands\n' +
          '👁️ Activity tracking\n' +
          '⚠️ Security alerts\n' +
          '🚫 User bans')
      .addFields(
        { name: lang === 'ar' ? '👑 المالك' : '👑 Owner', value: perms.owner ? `<@${perms.owner}>` : '-', inline: true },
        { name: lang === 'ar' ? '👮 المشرفين' : '👮 Admins', value: `${perms.admins?.length || 0}`, inline: true }
      )
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('security_view_logs')
          .setLabel(lang === 'ar' ? '📜 سجل الأنشطة' : '📜 Activity Log')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('security_ban_user')
          .setLabel(lang === 'ar' ? '🚫 حظر مستخدم' : '🚫 Ban User')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('security_unban_user')
          .setLabel(lang === 'ar' ? '✅ إلغاء حظر' : '✅ Unban User')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!isOwner)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('security_backup')
          .setLabel(lang === 'ar' ? '💾 نسخ احتياطي' : '💾 Backup Data')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('security_restore')
          .setLabel(lang === 'ar' ? '📥 استعادة' : '📥 Restore')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('back_owner_admin')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  // Member Profile View
  static createMemberProfileMenu(memberId, lang = 'en') {
    const member = db.getMember(memberId);
    
    if (!member) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle(lang === 'ar' ? '❌ العضو غير موجود' : '❌ Member Not Found')
        .setDescription(lang === 'ar' ? 'لم يتم العثور على هذا العضو' : 'This member was not found');
      return { embeds: [embed], components: [] };
    }

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle(lang === 'ar' ? `👤 ملف العضو: ${member.gameName || member.name}` : `👤 Member Profile: ${member.gameName || member.name}`)
      .addFields(
        { name: '🎮 Game ID', value: member.gameId || '-', inline: true },
        { name: '📛 Game Name', value: member.gameName || member.name || '-', inline: true },
        { name: '⭐ Rank', value: member.rank || 'R1', inline: true },
        { name: '⚡ Power', value: member.power ? `${(member.power/1000000).toFixed(2)}M` : '-', inline: true },
        { name: '🔥 Furnace Level', value: member.furnaceLevel?.toString() || '-', inline: true },
        { name: '💬 Discord', value: `<@${member.discordId || member.id}>`, inline: true },
        { name: lang === 'ar' ? '📅 انضم في' : '📅 Joined', value: member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-', inline: true },
        { name: lang === 'ar' ? '🕐 آخر نشاط' : '🕐 Last Active', value: member.lastActive ? new Date(member.lastActive).toLocaleDateString() : '-', inline: true }
      )
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`member_edit_${memberId}`)
          .setLabel(lang === 'ar' ? '✏️ تعديل' : '✏️ Edit')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('menu_members')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row] };
  }

  // ============ قائمة حذف المواعيد المحسنة ============
  static createDeleteAppointmentsMenu(guildId, type, lang = 'en') {
    const bookings = db.getGuildBookings(guildId, type) || [];
    
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(lang === 'ar' ? '🗑️ حذف المواعيد' : '🗑️ Delete Appointments')
      .setDescription(lang === 'ar'
        ? `**نوع الحجز:** ${type === 'building' ? '🏗️ البناء' : type === 'research' ? '🔬 البحث' : '⚔️ التدريب'}\n\n` +
          'اختر طريقة الحذف:'
        : `**Booking Type:** ${type === 'building' ? '🏗️ Building' : type === 'research' ? '🔬 Research' : '⚔️ Training'}\n\n` +
          'Choose deletion method:')
      .addFields({
        name: lang === 'ar' ? '📊 إجمالي المواعيد' : '📊 Total Appointments',
        value: bookings.length.toString(),
        inline: true
      })
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`delete_all_${type}`)
          .setLabel(lang === 'ar' ? '🗑️ حذف الكل' : '🗑️ Delete All')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(bookings.length === 0),
        new ButtonBuilder()
          .setCustomId(`delete_select_${type}`)
          .setLabel(lang === 'ar' ? '📋 حذف مخصص' : '📋 Custom Delete')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(bookings.length === 0)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_ministry_appointments')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  // قائمة اختيار المواعيد للحذف المخصص
  static createSelectDeleteMenu(guildId, type, lang = 'en') {
    const bookings = db.getGuildBookings(guildId, type) || [];
    
    if (bookings.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle(lang === 'ar' ? '📋 لا توجد مواعيد' : '📋 No Appointments')
        .setDescription(lang === 'ar' ? 'لا توجد مواعيد للحذف' : 'No appointments to delete');
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('menu_ministry_appointments')
            .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
            .setStyle(ButtonStyle.Secondary)
        );
      
      return { embeds: [embed], components: [row] };
    }

    const embed = new EmbedBuilder()
      .setColor('#ff6b6b')
      .setTitle(lang === 'ar' ? '📋 اختر الموعد للحذف' : '📋 Select Appointment to Delete')
      .setDescription(lang === 'ar'
        ? '👇 اختر الموعد الذي تريد حذفه من القائمة'
        : '👇 Select the appointment to delete from the list')
      .setTimestamp();

    // إنشاء خيارات القائمة المنسدلة
    const selectOptions = bookings.slice(0, 25).map((booking, index) => {
      const date = booking.date || new Date(booking.startDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
      const time = booking.time || '';
      const userName = booking.userName || booking.memberName || 'Unknown';
      return {
        label: `${index + 1}. ${userName}`,
        description: `${date} ${time}`.trim(),
        value: booking.id
      };
    });

    const selectMenu = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`select_delete_booking_${type}`)
          .setPlaceholder(lang === 'ar' ? '📌 اختر موعداً للحذف...' : '📌 Select an appointment to delete...')
          .addOptions(selectOptions)
      );

    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`appointment_delete_menu_${type}`)
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [selectMenu, backRow] };
  }

  // تأكيد حذف جميع المواعيد
  static createConfirmDeleteAllMenu(type, lang = 'en') {
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(lang === 'ar' ? '⚠️ تأكيد الحذف' : '⚠️ Confirm Deletion')
      .setDescription(lang === 'ar'
        ? `**هل أنت متأكد من حذف جميع مواعيد ${type === 'building' ? 'البناء' : type === 'research' ? 'البحث' : 'التدريب'}?**\n\n` +
          '⚠️ هذا الإجراء لا يمكن التراجع عنه!'
        : `**Are you sure you want to delete all ${type} appointments?**\n\n` +
          '⚠️ This action cannot be undone!')
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_delete_all_${type}`)
          .setLabel(lang === 'ar' ? '✅ نعم، احذف الكل' : '✅ Yes, Delete All')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`appointment_delete_menu_${type}`)
          .setLabel(lang === 'ar' ? '❌ إلغاء' : '❌ Cancel')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row] };
  }

  // ============ نقل الزر مع موافقة/رفض ============
  static createButtonMoveConfirmMenu(userId, lang = 'en', moveData) {
    const layout = db.getButtonLayout();
    const buttonNames = {
      menu_alliance: { ar: '🤝 التحالف', en: '🤝 Alliance' },
      menu_ministry_appointments: { ar: '📅 المواعيد', en: '📅 Appointments' },
      menu_bookings: { ar: '📅 الحجوزات', en: '📅 Bookings' },
      menu_members: { ar: '👥 الأعضاء', en: '👥 Members' },
      menu_logs: { ar: '📜 السجلات', en: '📜 Logs' },
      menu_schedule: { ar: '📅 الجدولة', en: '📅 Schedule' },
      menu_reminders: { ar: '🔔 التذكيرات', en: '🔔 Reminders' },
      menu_permissions: { ar: '👮 الأدمن', en: '👮 Admin' },
      menu_stats: { ar: '📊 الإحصائيات', en: '📊 Stats' },
      menu_settings: { ar: '⚙️ الإعدادات', en: '⚙️ Settings' },
      menu_help: { ar: '❓ المساعدة', en: '❓ Help' },
      lang_switch: { ar: '🌐 اللغة', en: '🌐 Language' },
      menu_ministries: { ar: '🏛️ الوزارات', en: '🏛️ Ministries' }
    };

    const { buttonId, direction, fromRow, fromCol, toRow, toCol } = moveData;
    const buttonName = buttonNames[buttonId] ? buttonNames[buttonId][lang] : buttonId;

    // حساب الموضع الجديد
    const directionText = {
      up: lang === 'ar' ? '⬆️ للأعلى' : '⬆️ Up',
      down: lang === 'ar' ? '⬇️ للأسفل' : '⬇️ Down',
      left: lang === 'ar' ? '⬅️ لليسار' : '⬅️ Left',
      right: lang === 'ar' ? '➡️ لليمين' : '➡️ Right'
    };

    const embed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle(lang === 'ar' ? '🔄 تأكيد نقل الزر' : '🔄 Confirm Button Move')
      .setDescription(lang === 'ar'
        ? `**الزر:** ${buttonName}\n\n` +
          `**الاتجاه:** ${directionText[direction]}\n` +
          `**من:** صف ${fromRow + 1}، موضع ${fromCol + 1}\n` +
          `**إلى:** صف ${toRow + 1}، موضع ${toCol + 1}\n\n` +
          '**هل تريد تطبيق هذا التغيير؟**'
        : `**Button:** ${buttonName}\n\n` +
          `**Direction:** ${directionText[direction]}\n` +
          `**From:** Row ${fromRow + 1}, Position ${fromCol + 1}\n` +
          `**To:** Row ${toRow + 1}, Position ${toCol + 1}\n\n` +
          '**Do you want to apply this change?**')
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_button_move')
          .setLabel(lang === 'ar' ? '✅ موافقة' : '✅ Approve')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('reject_button_move')
          .setLabel(lang === 'ar' ? '❌ رفض' : '❌ Reject')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('owner_buttons')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row] };
  }

  // ============ قائمة تعديل النصوص المحسنة ============
  static createEditTextsMenu(userId, lang = 'en') {
    const isOwner = db.isOwner(userId);
    const defaultTexts = db.getDefaultTexts();
    const customTexts = db.getCustomTexts();

    // دمج النصوص الافتراضية والمخصصة
    const allTexts = { ...defaultTexts, ...customTexts };

    const textKeys = Object.keys(allTexts);
    
    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle(lang === 'ar' ? '✏️ تعديل النصوص' : '✏️ Edit Texts')
      .setDescription(lang === 'ar'
        ? '👇 **اختر النص الذي تريد تعديله من القائمة**\n\n' +
          'يمكنك تعديل جميع النصوص في البوت حسب رغبتك.'
        : '👇 **Select the text you want to edit from the list**\n\n' +
          'You can customize all bot texts as you wish.')
      .setTimestamp();

    // أسماء النصوص المعروضة
    const textLabels = {
      mainTitle: { ar: '📝 العنوان الرئيسي', en: '📝 Main Title' },
      welcomeMessage: { ar: '👋 رسالة الترحيب', en: '👋 Welcome Message' },
      allianceTitle: { ar: '🤝 عنوان التحالف', en: '🤝 Alliance Title' },
      membersTitle: { ar: '👥 عنوان الأعضاء', en: '👥 Members Title' },
      bookingsTitle: { ar: '📅 عنوان الحجوزات', en: '📅 Bookings Title' },
      settingsTitle: { ar: '⚙️ عنوان الإعدادات', en: '⚙️ Settings Title' },
      helpTitle: { ar: '❓ عنوان المساعدة', en: '❓ Help Title' },
      statsTitle: { ar: '📊 عنوان الإحصائيات', en: '📊 Stats Title' },
      permissionsTitle: { ar: '👮 عنوان الصلاحيات', en: '👮 Permissions Title' },
      remindersTitle: { ar: '🔔 عنوان التذكيرات', en: '🔔 Reminders Title' }
    };

    // إنشاء خيارات القائمة المنسدلة
    const selectOptions = textKeys.filter(key => textLabels[key]).map(key => {
      const label = textLabels[key] ? textLabels[key][lang] : key;
      const currentValue = allTexts[key] ? allTexts[key][lang] : '-';
      return {
        label: label.replace(/[^\w\s\u0600-\u06FF]/g, '').substring(0, 25),
        description: currentValue.substring(0, 50),
        value: key
      };
    });

    const selectMenu = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_text_to_edit')
          .setPlaceholder(lang === 'ar' ? '📌 اختر نصاً للتعديل...' : '📌 Select a text to edit...')
          .addOptions(selectOptions.slice(0, 25))
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('text_reset_all')
          .setLabel(lang === 'ar' ? '↩️ استعادة الافتراضي' : '↩️ Reset All')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('back_owner_admin')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [selectMenu, row2] };
  }

  // ============ ربط التحالف تلقائياً مع السيرفر ============
  static createGuildAllianceLinkMenu(guildId, lang = 'en') {
    const guildAlliance = db.getGuildAlliance(guildId);
    const hasAlliance = guildAlliance.name && guildAlliance.name !== '';

    const embed = new EmbedBuilder()
      .setColor(hasAlliance ? '#00ff00' : '#ffaa00')
      .setTitle(lang === 'ar' ? '🔗 ربط التحالف' : '🔗 Alliance Linking')
      .setDescription(hasAlliance
        ? (lang === 'ar'
          ? `✅ **التحالف مرتبط بنجاح!**\n\n` +
            `📛 **الاسم:** ${guildAlliance.name}\n` +
            `🏷️ **التاغ:** ${guildAlliance.tag || '-'}\n` +
            `👥 **الأعضاء:** ${guildAlliance.members.length}\n\n` +
            (guildAlliance.autoSync ? '🔄 المزامنة التلقائية مفعلة' : '⏸️ المزامنة التلقائية معطلة')
          : `✅ **Alliance linked successfully!**\n\n` +
            `📛 **Name:** ${guildAlliance.name}\n` +
            `🏷️ **Tag:** ${guildAlliance.tag || '-'}\n` +
            `👥 **Members:** ${guildAlliance.members.length}\n\n` +
            (guildAlliance.autoSync ? '🔄 Auto-sync enabled' : '⏸️ Auto-sync disabled'))
        : (lang === 'ar'
          ? '⚠️ **لم يتم تسجيل تحالف لهذا السيرفر بعد**\n\n' +
            'سجل تحالفك لربطه تلقائياً مع السيرفر.\n' +
            'سيتم تسجيل جميع أعضاء السيرفر تلقائياً.'
          : '⚠️ **No alliance registered for this server yet**\n\n' +
            'Register your alliance to link it automatically.\n' +
            'All server members will be registered automatically.'))
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('guild_alliance_register')
          .setLabel(lang === 'ar' ? '📝 تسجيل التحالف' : '📝 Register Alliance')
          .setStyle(hasAlliance ? ButtonStyle.Secondary : ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('guild_sync_members')
          .setLabel(lang === 'ar' ? '🔄 مزامنة الأعضاء' : '🔄 Sync Members')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasAlliance),
        new ButtonBuilder()
          .setCustomId('guild_toggle_autosync')
          .setLabel(lang === 'ar'
            ? (guildAlliance.autoSync ? '⏸️ إيقاف المزامنة' : '▶️ تفعيل المزامنة')
            : (guildAlliance.autoSync ? '⏸️ Disable Sync' : '▶️ Enable Sync'))
          .setStyle(guildAlliance.autoSync ? ButtonStyle.Secondary : ButtonStyle.Success)
          .setDisabled(!hasAlliance)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_alliance')
          .setLabel(lang === 'ar' ? '◀️ رجوع' : '◀️ Back')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }
}