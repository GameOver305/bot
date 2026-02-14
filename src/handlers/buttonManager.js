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
          .setStyle(ButtonStyle.Primary)
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
          .setStyle(ButtonStyle.Primary)
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

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_main')
          .setLabel(t(lang, 'permissions.back'))
          .setStyle(ButtonStyle.Secondary)
      );

    return { embeds: [embed], components: [row] };
  }
}
