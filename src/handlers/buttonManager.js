import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
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
          .setCustomId('menu_bookings')
          .setLabel(lang === 'ar' ? '📅 الحجوزات' : '📅 Bookings')
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
          .setCustomId('menu_ministries')
          .setLabel(lang === 'ar' ? '🏛️ الوزارات' : '🏛️ Ministries')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('menu_logs')
          .setLabel(lang === 'ar' ? '📜 السجلات' : '📜 Logs')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('menu_schedule')
          .setLabel(lang === 'ar' ? '📅 الجدولة' : '📅 Schedule')
          .setStyle(ButtonStyle.Success)
      );

    // Row 3: Management & Settings
    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_permissions')
          .setLabel(lang === 'ar' ? '🔐 الصلاحيات' : '🔐 Permissions')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('menu_reminders')
          .setLabel(lang === 'ar' ? '🔔 التذكيرات' : '🔔 Reminders')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('menu_stats')
          .setLabel(lang === 'ar' ? '📊 الإحصائيات' : '📊 Stats')
          .setStyle(ButtonStyle.Secondary)
      );

    // Row 4: Help & Settings
    const row4 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_settings')
          .setLabel(lang === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('menu_help')
          .setLabel(lang === 'ar' ? '❓ المساعدة' : '❓ Help')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('lang_switch')
          .setLabel(lang === 'ar' ? '🇺🇸 English' : '🇸🇦 العربية')
          .setStyle(ButtonStyle.Success)
      );

    return { embeds: [embed], components: [row1, row2, row3, row4] };
  }

  static createBookingsMenu(lang = 'en') {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(t(lang, 'bookings.title'))
      .setDescription(t(lang, 'bookings.description'))
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('booking_building')
          .setLabel(t(lang, 'bookings.building'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('booking_research')
          .setLabel(t(lang, 'bookings.research'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('booking_training')
          .setLabel(t(lang, 'bookings.training'))
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(t(lang, 'bookings.back'))
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
    
    const embed = new EmbedBuilder()
      .setColor('#ff00ff')
      .setTitle(t(lang, 'alliance.title'))
      .setDescription(t(lang, 'alliance.allianceInfo', {
        name: alliance.name || t(lang, 'alliance.notSet'),
        tag: alliance.tag || t(lang, 'alliance.notSet'),
        leader: alliance.leader ? `<@${alliance.leader}>` : t(lang, 'alliance.notSet'),
        count: alliance.members.length,
        description: alliance.description || t(lang, 'alliance.notSet')
      }))
      .setFooter({ 
        text: lang === 'ar' 
          ? 'استخدم الأزرار أدناه لإدارة التحالف' 
          : 'Use the buttons below to manage the alliance' 
      })
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('alliance_info')
          .setLabel(lang === 'ar' ? '📊 معلومات مفصلة' : '📊 Detailed Info')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('alliance_members')
          .setLabel(t(lang, 'alliance.members'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('alliance_ranks')
          .setLabel(lang === 'ar' ? '⭐ توزيع الرتب' : '⭐ Rank Distribution')
          .setStyle(ButtonStyle.Secondary)
      );
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('alliance_manage_menu')
          .setLabel(lang === 'ar' ? '⚙️ إدارة التحالف' : '⚙️ Manage Alliance')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('alliance_commands')
          .setLabel(lang === 'ar' ? '📜 قائمة الأوامر' : '📜 Commands List')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(t(lang, 'alliance.back'))
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  static createSettingsMenu(userId, lang = 'en') {
    const user = db.getUser(userId);
    const isOwner = db.isOwner(userId);
    
    const embed = new EmbedBuilder()
      .setColor('#ffff00')
      .setTitle(t(lang, 'settings.title'))
      .setDescription(t(lang, 'settings.description'))
      .addFields(
        { name: '🌐 اللغة الحالية', value: user.language === 'ar' ? 'العربية' : 'English', inline: true },
        { name: '🔔 التذكيرات', value: user.notifications ? 'مفعلة' : 'معطلة', inline: true }
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
          .setStyle(user.language === 'en' ? ButtonStyle.Success : ButtonStyle.Secondary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('settings_notifications')
          .setLabel(user.notifications ? '🔕 تعطيل التذكيرات' : '🔔 تفعيل التذكيرات')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(t(lang, 'settings.back'))
          .setStyle(ButtonStyle.Secondary)
      );

    const components = [row1, row2];

    // Add Owner Admin button if user is owner
    if (isOwner) {
      const ownerRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('menu_owner_admin')
            .setLabel(lang === 'ar' ? '👑 إدارة المالك' : '👑 Owner Admin')
            .setStyle(ButtonStyle.Danger)
        );
      components.splice(1, 0, ownerRow); // Insert before back button
    }

    return { embeds: [embed], components };
  }

  static createPermissionsMenu(lang = 'en') {
    const perms = db.getPermissions();
    
    let adminList = 'لا يوجد مشرفين';
    if (perms.admins.length > 0) {
      adminList = perms.admins.map(id => `<@${id}>`).join('\n');
    }

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(t(lang, 'permissions.title'))
      .setDescription(t(lang, 'permissions.description'))
      .addFields(
        { name: '👑 المالك', value: perms.owner ? `<@${perms.owner}>` : 'غير محدد', inline: false },
        { name: '👮 المشرفين', value: adminList, inline: false }
      )
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('perm_manage_admins')
          .setLabel(lang === 'ar' ? '👮 إدارة المشرفين' : '👮 Manage Admins')
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(t(lang, 'permissions.back'))
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  static createStatsMenu(lang = 'en') {
    const allBookings = db.getBookings();
    const alliance = db.getAlliance();
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
        ? 'إدارة جميع تذكيراتك الشخصية'
        : 'Manage all your personal reminders')
      .setTimestamp();

    if (reminders.length === 0) {
      embed.addFields({
        name: lang === 'ar' ? '📝 التذكيرات' : '📝 Reminders',
        value: lang === 'ar' ? 'لا توجد تذكيرات حالياً' : 'No reminders currently',
        inline: false
      });
    } else {
      const remindersList = reminders.map((r, i) => {
        const date = new Date(r.time).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
        return `**${i + 1}.** ${r.message}\n   ⏰ ${date}`;
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
          .setCustomId('reminder_view')
          .setLabel(lang === 'ar' ? '📋 عرض الكل' : '📋 View All')
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
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
          .setDisabled(perms.admins.length === 0),
        new ButtonBuilder()
          .setCustomId('admin_set_owner')
          .setLabel(lang === 'ar' ? '👑 تعيين مالك' : '👑 Set Owner')
          .setStyle(ButtonStyle.Primary)
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

  // Members Management Menu
  static createMembersMenu(userId, lang = 'en') {
    const alliance = db.getAlliance();
    const hasPermission = db.hasAlliancePermission(userId) || db.isAdmin(userId);
    
    let membersList = lang === 'ar' ? 'لا يوجد أعضاء' : 'No members';
    if (alliance.members.length > 0) {
      const displayMembers = alliance.members.slice(0, 10);
      membersList = displayMembers.map((m, i) => 
        `${i + 1}. <@${m.id}> - **${m.rank}**`
      ).join('\n');
      
      if (alliance.members.length > 10) {
        membersList += `\n\n${lang === 'ar' ? '...والمزيد' : '...and more'} (${alliance.members.length} ${lang === 'ar' ? 'عضو' : 'members'})`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle(lang === 'ar' ? '👥 إدارة الأعضاء' : '👥 Members Management')
      .setDescription(lang === 'ar'
        ? 'إدارة كاملة لأعضاء التحالف'
        : 'Complete alliance members management')
      .addFields({
        name: lang === 'ar' ? `📋 قائمة الأعضاء (${alliance.members.length})` : `📋 Members List (${alliance.members.length})`,
        value: membersList,
        inline: false
      })
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('member_add')
          .setLabel(lang === 'ar' ? '➕ إضافة عضو' : '➕ Add Member')
          .setEmoji('➕')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('member_remove')
          .setLabel(lang === 'ar' ? '➖ إزالة عضو' : '➖ Remove Member')
          .setEmoji('➖')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!hasPermission),
        new ButtonBuilder()
          .setCustomId('member_change_rank')
          .setLabel(lang === 'ar' ? '⭐ تغيير رتبة' : '⭐ Change Rank')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasPermission)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('member_list_all')
          .setLabel(lang === 'ar' ? '📋 عرض الكل' : '📋 View All')
          .setEmoji('📋')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('member_search')
          .setLabel(lang === 'ar' ? '🔍 بحث' : '🔍 Search')
          .setEmoji('🔍')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ القائمة الرئيسية' : '◀️ Main Menu')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
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
          .setCustomId('back_main')
          .setLabel(lang === 'ar' ? '◀️ القائمة الرئيسية' : '◀️ Main Menu')
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
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
  static createButtonLayoutMenu(userId, lang = 'en') {
    const isOwner = db.isOwner(userId);
    const layout = db.getButtonLayout();

    let description = lang === 'ar'
      ? '**تخصيص ترتيب الأزرار في القائمة الرئيسية**\n\n'
      : '**Customize button layout in main menu**\n\n';

    description += '**📋 ' + (lang === 'ar' ? 'الترتيب الحالي:' : 'Current Layout:') + '**\n\n';
    
    const buttonLabels = {
      menu_alliance: lang === 'ar' ? '🤝 التحالف' : '🤝 Alliance',
      menu_bookings: lang === 'ar' ? '📅 الحجوزات' : '📅 Bookings',
      menu_members: lang === 'ar' ? '👥 الأعضاء' : '👥 Members',
      menu_ministries: lang === 'ar' ? '🏛️ الوزارات' : '🏛️ Ministries',
      menu_logs: lang === 'ar' ? '📜 السجلات' : '📜 Logs',
      menu_schedule: lang === 'ar' ? '📅 الجدولة' : '📅 Schedule',
      menu_permissions: lang === 'ar' ? '🔐 الصلاحيات' : '🔐 Permissions',
      menu_reminders: lang === 'ar' ? '🔔 التذكيرات' : '🔔 Reminders',
      menu_stats: lang === 'ar' ? '📊 الإحصائيات' : '📊 Stats',
      menu_settings: lang === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings',
      menu_help: lang === 'ar' ? '❓ المساعدة' : '❓ Help',
      lang_switch: lang === 'ar' ? '🌐 اللغة' : '🌐 Language'
    };

    layout.rows.forEach((row, rowIndex) => {
      description += `**${lang === 'ar' ? 'الصف' : 'Row'} ${rowIndex + 1}:** `;
      description += row.map(btn => buttonLabels[btn] || btn).join(' | ');
      description += '\n';
    });

    description += '\n' + (lang === 'ar' 
      ? 'ℹ️ **قريباً:** سيتم إضافة نظام السحب والإفلات لتعديل الترتيب'
      : 'ℹ️ **Coming Soon:** Drag & drop system for reordering');

    const embed = new EmbedBuilder()
      .setColor('#9900ff')
      .setTitle(lang === 'ar' ? '🔧 تخصيص الأزرار' : '🔧 Button Customization')
      .setDescription(description)
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('layout_reset')
          .setLabel(lang === 'ar' ? '🔄 إعادة تعيين' : '🔄 Reset')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!isOwner),
        new ButtonBuilder()
          .setCustomId('layout_preview')
          .setLabel(lang === 'ar' ? '👁️ معاينة' : '👁️ Preview')
          .setStyle(ButtonStyle.Primary)
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
}
