import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { t } from '../utils/translations.js';
import db from '../utils/database.js';

export class ButtonManager {
  static createMainMenu(lang = 'ar') {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(t(lang, 'mainMenu.title'))
      .setDescription(t(lang, 'mainMenu.description'))
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_bookings')
          .setLabel(t(lang, 'mainMenu.bookings'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('menu_alliance')
          .setLabel(t(lang, 'mainMenu.alliance'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('menu_settings')
          .setLabel(t(lang, 'mainMenu.settings'))
          .setStyle(ButtonStyle.Secondary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('menu_permissions')
          .setLabel(t(lang, 'mainMenu.permissions'))
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('menu_stats')
          .setLabel(lang === 'ar' ? '📊 الإحصائيات' : '📊 Statistics')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('menu_help')
          .setLabel(t(lang, 'mainMenu.help'))
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  static createBookingsMenu(lang = 'ar') {
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

  static createBookingTypeMenu(type, lang = 'ar') {
    const bookings = db.getBookings(type);
    
    let description = t(lang, 'bookings.description');
    
    if (bookings.length === 0) {
      description += '\n\n' + t(lang, 'bookings.empty');
    } else {
      description += '\n\n**📋 الحجوزات الحالية:**\n';
      bookings.forEach((booking, index) => {
        const user = `<@${booking.userId}>`;
        const start = new Date(booking.startDate).toLocaleDateString('ar-EG');
        const end = new Date(booking.endDate).toLocaleDateString('ar-EG');
        description += `\n${index + 1}. ${user} - ${start} إلى ${end}`;
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

  static createAllianceMenu(lang = 'ar') {
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
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('alliance_info')
          .setLabel(t(lang, 'alliance.info'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('alliance_members')
          .setLabel(t(lang, 'alliance.members'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('alliance_manage')
          .setLabel(lang === 'ar' ? '⚙️ إدارة الأعضاء' : '⚙️ Manage Members')
          .setStyle(ButtonStyle.Success)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(t(lang, 'alliance.back'))
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row1, row2] };
  }

  static createSettingsMenu(userId, lang = 'ar') {
    const user = db.getUser(userId);
    
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

    return { embeds: [embed], components: [row1, row2] };
  }

  static createPermissionsMenu(lang = 'ar') {
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

  static createStatsMenu(lang = 'ar') {
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

  static createHelpMenu(lang = 'ar') {
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
}
