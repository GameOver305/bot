import db from '../utils/database.js';
import { t } from '../utils/translations.js';
import { ButtonManager } from './buttonManager.js';

export async function handleModalSubmit(interaction) {
  const userId = interaction.user.id;
  const user = db.getUser(userId);
  const lang = user.language || 'en';
  const customId = interaction.customId;

  try {
    if (customId.startsWith('booking_modal_')) {
      const type = customId.replace('booking_modal_', '');
      await processBooking(interaction, type, lang);
    }
    else if (customId === 'alliance_modal_add_member') {
      await processAddMember(interaction, userId, lang);
    }
    else if (customId === 'alliance_modal_remove_member') {
      await processRemoveMember(interaction, userId, lang);
    }
    else if (customId === 'alliance_modal_change_rank') {
      await processChangeRank(interaction, userId, lang);
    }
    else if (customId === 'alliance_modal_set_info') {
      await processSetAllianceInfo(interaction, userId, lang);
    }
    else if (customId === 'alliance_modal_set_leader') {
      await processSetLeader(interaction, userId, lang);
    }
    else if (customId === 'reminder_modal_add') {
      await processAddReminder(interaction, userId, lang);
    }
    else if (customId === 'admin_modal_add') {
      await processAddAdmin(interaction, userId, lang);
    }
    else if (customId === 'admin_modal_remove') {
      await processRemoveAdmin(interaction, userId, lang);
    }
    else if (customId === 'admin_modal_set_owner') {
      await processSetOwner(interaction, userId, lang);
    }
    // New Modals
    else if (customId === 'log_channel_modal') {
      await processSetLogChannel(interaction, userId, lang);
    }
    else if (customId === 'ministry_modal_add') {
      await processAddMinistry(interaction, userId, lang);
    }
    else if (customId === 'schedule_activity_modal') {
      await processScheduleActivity(interaction, userId, lang);
    }
    else if (customId === 'scheduled_alert_modal') {
      await processScheduledAlert(interaction, userId, lang);
    }
    else if (customId === 'advanced_schedule_modal') {
      await processAdvancedSchedule(interaction, userId, lang);
    }
    // New Member Management Modals
    else if (customId === 'modal_member_add') {
      await processAddMemberNew(interaction, userId, lang);
    }
    else if (customId === 'modal_member_remove') {
      await processRemoveMemberNew(interaction, userId, lang);
    }
    else if (customId === 'modal_member_rank') {
      await processChangeRankNew(interaction, userId, lang);
    }
    else if (customId === 'modal_member_search') {
      await processMemberSearch(interaction, userId, lang);
    }
    // New Ministry Management Modals
    else if (customId === 'modal_ministry_delete') {
      await processDeleteMinistry(interaction, userId, lang);
    }
    else if (customId === 'modal_ministry_assign') {
      await processAssignMinister(interaction, userId, lang);
    }
    // Guild Management Modals
    else if (customId === 'modal_guild_add') {
      await processAddGuild(interaction, userId, lang);
    }
    else if (customId === 'modal_guild_remove') {
      await processRemoveGuild(interaction, userId, lang);
    }
    // Alliance Registration Modal
    else if (customId === 'modal_alliance_register') {
      await processAllianceRegister(interaction, userId, lang);
    }
    // Ministry Appointment Modals
    else if (customId.startsWith('modal_appointment_')) {
      const type = customId.replace('modal_appointment_', '');
      if (type === 'delete') {
        await processDeleteAppointment(interaction, userId, lang);
      } else {
        await processMinistryAppointment(interaction, type, userId, lang);
      }
    }
    // Reminder Edit/Time Modals
    else if (customId === 'modal_reminder_edit') {
      await processEditReminder(interaction, userId, lang);
    }
    else if (customId === 'modal_reminder_time') {
      await processSetReminderTime(interaction, userId, lang);
    }
    // Layout Management Modals
    else if (customId === 'modal_layout_move_up' || customId === 'modal_layout_move_down') {
      await processMoveButton(interaction, customId.includes('up') ? 'up' : 'down', userId, lang);
    }
    else if (customId === 'modal_layout_swap') {
      await processSwapButtons(interaction, userId, lang);
    }
    else if (customId === 'modal_layout_edit_labels') {
      await processEditLabels(interaction, userId, lang);
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
  const memberName = interaction.fields.getTextInputValue('member_name');
  const allianceName = interaction.fields.getTextInputValue('alliance_name');
  const durationStr = interaction.fields.getTextInputValue('duration');
  const startDateStr = interaction.fields.getTextInputValue('start_date');
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
    memberName: memberName,
    allianceName: allianceName,
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

// === Alliance Management Processors ===

async function processAddMember(interaction, userId, lang) {
  if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
    await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
    return;
  }

  let targetUserId = interaction.fields.getTextInputValue('user_id').trim();
  const rank = interaction.fields.getTextInputValue('rank').trim().toUpperCase();

  // Extract user ID from mention
  if (targetUserId.startsWith('<@') && targetUserId.endsWith('>')) {
    targetUserId = targetUserId.replace(/[<@!>]/g, '');
  }

  // Validate rank
  if (!['R1', 'R2', 'R3', 'R4', 'R5'].includes(rank)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ الرتبة غير صحيحة. استخدم: R1, R2, R3, R4, R5' : '❌ Invalid rank. Use: R1, R2, R3, R4, R5', 
      ephemeral: true 
    });
    return;
  }

  // Check if already member
  const alliance = db.getAlliance();
  if (alliance.members.find(m => m.id === targetUserId)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ العضو موجود بالفعل في التحالف' : '❌ Member already in alliance', 
      ephemeral: true 
    });
    return;
  }

  // Add member
  db.addAllianceMember(targetUserId, rank);
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم إضافة <@${targetUserId}> برتبة **${rank}**` 
      : `✅ Added <@${targetUserId}> with rank **${rank}**`, 
    ephemeral: true 
  });
}

async function processRemoveMember(interaction, userId, lang) {
  if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
    await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
    return;
  }

  let targetUserId = interaction.fields.getTextInputValue('user_id').trim();

  // Extract user ID from mention
  if (targetUserId.startsWith('<@') && targetUserId.endsWith('>')) {
    targetUserId = targetUserId.replace(/[<@!>]/g, '');
  }

  // Check if member exists
  const alliance = db.getAlliance();
  if (!alliance.members.find(m => m.id === targetUserId)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ العضو غير موجود في التحالف' : '❌ Member not in alliance', 
      ephemeral: true 
    });
    return;
  }

  // Remove member
  db.removeAllianceMember(targetUserId);
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم إزالة <@${targetUserId}> من التحالف` 
      : `✅ Removed <@${targetUserId}> from alliance`, 
    ephemeral: true 
  });
}

async function processChangeRank(interaction, userId, lang) {
  if (!db.hasAlliancePermission(userId) && !db.isAdmin(userId)) {
    await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
    return;
  }

  let targetUserId = interaction.fields.getTextInputValue('user_id').trim();
  const newRank = interaction.fields.getTextInputValue('rank').trim().toUpperCase();

  // Extract user ID from mention
  if (targetUserId.startsWith('<@') && targetUserId.endsWith('>')) {
    targetUserId = targetUserId.replace(/[<@!>]/g, '');
  }

  // Validate rank
  if (!['R1', 'R2', 'R3', 'R4', 'R5'].includes(newRank)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ الرتبة غير صحيحة. استخدم: R1, R2, R3, R4, R5' : '❌ Invalid rank. Use: R1, R2, R3, R4, R5', 
      ephemeral: true 
    });
    return;
  }

  // Check if member exists
  const alliance = db.getAlliance();
  const member = alliance.members.find(m => m.id === targetUserId);
  if (!member) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ العضو غير موجود في التحالف' : '❌ Member not in alliance', 
      ephemeral: true 
    });
    return;
  }

  // Change rank
  db.changeAllianceRank(targetUserId, newRank);
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم تغيير رتبة <@${targetUserId}> من **${member.rank}** إلى **${newRank}**` 
      : `✅ Changed <@${targetUserId}> rank from **${member.rank}** to **${newRank}**`, 
    ephemeral: true 
  });
}

async function processSetAllianceInfo(interaction, userId, lang) {
  const isR5OrAdmin = (db.getAlliance().leader === userId) || db.isAdmin(userId);
  if (!isR5OrAdmin) {
    await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية R5 أو Admin فقط' : '❌ R5 or Admin only', ephemeral: true });
    return;
  }

  const name = interaction.fields.getTextInputValue('name')?.trim();
  const tag = interaction.fields.getTextInputValue('tag')?.trim();
  const description = interaction.fields.getTextInputValue('description')?.trim();

  const updates = {};
  if (name) updates.name = name;
  if (tag) updates.tag = tag;
  if (description) updates.description = description;

  if (Object.keys(updates).length === 0) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ يجب إدخال معلومة واحدة على الأقل' : '❌ Must provide at least one field', 
      ephemeral: true 
    });
    return;
  }

  db.setAllianceInfo(updates);
  
  let message = lang === 'ar' ? '✅ تم تحديث معلومات التحالف:\n' : '✅ Alliance info updated:\n';
  if (name) message += `• ${lang === 'ar' ? 'الاسم' : 'Name'}: ${name}\n`;
  if (tag) message += `• ${lang === 'ar' ? 'الوسم' : 'Tag'}: ${tag}\n`;
  if (description) message += `• ${lang === 'ar' ? 'الوصف' : 'Description'}: ${description}`;

  await interaction.reply({ content: message, ephemeral: true });
}

async function processSetLeader(interaction, userId, lang) {
  if (!db.isAdmin(userId)) {
    await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية Admin فقط' : '❌ Admin only', ephemeral: true });
    return;
  }

  let targetUserId = interaction.fields.getTextInputValue('user_id').trim();

  // Extract user ID from mention
  if (targetUserId.startsWith('<@') && targetUserId.endsWith('>')) {
    targetUserId = targetUserId.replace(/[<@!>]/g, '');
  }

  // Check if member exists
  const alliance = db.getAlliance();
  if (!alliance.members.find(m => m.id === targetUserId)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ العضو يجب أن يكون في التحالف أولاً' : '❌ Member must be in alliance first', 
      ephemeral: true 
    });
    return;
  }

  // Set leader and auto-promote to R5
  db.setAllianceLeader(targetUserId);
  db.changeAllianceRank(targetUserId, 'R5');
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم تعيين <@${targetUserId}> كقائد للتحالف (رتبة R5)` 
      : `✅ Set <@${targetUserId}> as alliance leader (R5 rank)`, 
    ephemeral: true 
  });
}

// === Reminders Processors ===

async function processAddReminder(interaction, userId, lang) {
  const message = interaction.fields.getTextInputValue('message').trim();
  const timeStr = interaction.fields.getTextInputValue('time').trim();

  // Validate time format
  const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
  if (!timeRegex.test(timeStr)) {
    await interaction.reply({ 
      content: lang === 'ar' 
        ? '❌ تنسيق الوقت غير صحيح. استخدم: YYYY-MM-DD HH:MM (مثال: 2024-02-20 15:30)' 
        : '❌ Invalid time format. Use: YYYY-MM-DD HH:MM (example: 2024-02-20 15:30)', 
      ephemeral: true 
    });
    return;
  }

  const reminderTime = new Date(timeStr);
  if (isNaN(reminderTime.getTime())) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ تاريخ غير صحيح' : '❌ Invalid date', 
      ephemeral: true 
    });
    return;
  }

  if (reminderTime < new Date()) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ الوقت يجب أن يكون في المستقبل' : '❌ Time must be in the future', 
      ephemeral: true 
    });
    return;
  }

  // Add reminder
  const reminderId = `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  db.addReminder(userId, {
    id: reminderId,
    message,
    time: reminderTime.toISOString(),
    createdAt: new Date().toISOString()
  });

  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم إضافة التذكير:\n📝 ${message}\n⏰ ${reminderTime.toLocaleString('ar-EG')}` 
      : `✅ Reminder added:\n📝 ${message}\n⏰ ${reminderTime.toLocaleString('en-US')}`, 
    ephemeral: true 
  });
}

// === Admin Management Processors ===

async function processAddAdmin(interaction, userId, lang) {
  if (!db.isOwner(userId)) {
    await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية المالك فقط' : '❌ Owner only', ephemeral: true });
    return;
  }

  let targetUserId = interaction.fields.getTextInputValue('user_id').trim();

  // Extract user ID from mention
  if (targetUserId.startsWith('<@') && targetUserId.endsWith('>')) {
    targetUserId = targetUserId.replace(/[<@!>]/g, '');
  }

  // Check if already admin
  if (db.isAdmin(targetUserId)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ المستخدم مشرف بالفعل' : '❌ User is already an admin', 
      ephemeral: true 
    });
    return;
  }

  // Add admin
  db.addAdmin(targetUserId);
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم إضافة <@${targetUserId}> كمشرف` 
      : `✅ Added <@${targetUserId}> as admin`, 
    ephemeral: true 
  });
}

async function processRemoveAdmin(interaction, userId, lang) {
  if (!db.isOwner(userId)) {
    await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية المالك فقط' : '❌ Owner only', ephemeral: true });
    return;
  }

  let targetUserId = interaction.fields.getTextInputValue('user_id').trim();

  // Extract user ID from mention
  if (targetUserId.startsWith('<@') && targetUserId.endsWith('>')) {
    targetUserId = targetUserId.replace(/[<@!>]/g, '');
  }

  // Check if is admin
  if (!db.isAdmin(targetUserId)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ المستخدم ليس مشرفاً' : '❌ User is not an admin', 
      ephemeral: true 
    });
    return;
  }

  // Remove admin
  db.removeAdmin(targetUserId);
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم إزالة <@${targetUserId}> من المشرفين` 
      : `✅ Removed <@${targetUserId}> from admins`, 
    ephemeral: true 
  });
}

async function processSetOwner(interaction, userId, lang) {
  if (!db.isOwner(userId)) {
    await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية المالك فقط' : '❌ Owner only', ephemeral: true });
    return;
  }

  let targetUserId = interaction.fields.getTextInputValue('user_id').trim();

  // Extract user ID from mention
  if (targetUserId.startsWith('<@') && targetUserId.endsWith('>')) {
    targetUserId = targetUserId.replace(/[<@!>]/g, '');
  }

  // Set new owner
  db.setOwner(targetUserId);
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم تعيين <@${targetUserId}> كمالك جديد للبوت` 
      : `✅ Set <@${targetUserId}> as new bot owner`, 
    ephemeral: true 
  });
}

// === New Modal Processors ===

async function processSetLogChannel(interaction, userId, lang) {
  if (!db.checkPermission(userId, 'admin')) {
    await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
    return;
  }

  let channelId = interaction.fields.getTextInputValue('channel_id').trim();

  // Extract channel ID from mention
  if (channelId.startsWith('<#') && channelId.endsWith('>')) {
    channelId = channelId.replace(/[<#>]/g, '');
  }

  // Save log channel
  db.setLogChannel(interaction.guildId, channelId);
  db.addAllianceLog('set_log_channel', userId, { channelId });
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم تعيين <#${channelId}> كقناة للسجلات` 
      : `✅ Set <#${channelId}> as log channel`, 
    ephemeral: true 
  });
}

async function processAddMinistry(interaction, userId, lang) {
  if (!db.checkPermission(userId, 'admin')) {
    await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
    return;
  }

  const name = interaction.fields.getTextInputValue('ministry_name').trim();
  const description = interaction.fields.getTextInputValue('ministry_description').trim();

  if (!name || !description) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ يجب ملء جميع الحقول' : '❌ All fields required', 
      ephemeral: true 
    });
    return;
  }

  // Add ministry
  const ministry = db.addMinistry(name, description);
  db.addAllianceLog('add_ministry', userId, { ministryId: ministry.id, name });
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم إضافة وزارة "${name}"` 
      : `✅ Added ministry "${name}"`, 
    ephemeral: true 
  });
}

async function processScheduleActivity(interaction, userId, lang) {
  if (!db.checkPermission(userId, 'admin')) {
    await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
    return;
  }

  const activityName = interaction.fields.getTextInputValue('activity_name').trim();
  const timeStr = interaction.fields.getTextInputValue('activity_time').trim();

  // Validate time format
  const timeRegex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/;
  if (!timeRegex.test(timeStr)) {
    await interaction.reply({ 
      content: lang === 'ar' 
        ? '❌ تنسيق الوقت غير صحيح. استخدم: YYYY-MM-DD HH:MM' 
        : '❌ Invalid time format. Use: YYYY-MM-DD HH:MM', 
      ephemeral: true 
    });
    return;
  }

  const time = new Date(timeStr.replace(' ', 'T')).toISOString();
  
  // Add schedule (using ministries system)
  db.addMinistrySchedule(null, activityName, time, false);
  db.addAllianceLog('schedule_activity', userId, { activity: activityName, time });
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم جدولة "${activityName}" في ${timeStr}` 
      : `✅ Scheduled "${activityName}" at ${timeStr}`, 
    ephemeral: true 
  });
}

async function processScheduledAlert(interaction, userId, lang) {
  if (!db.checkPermission(userId, 'admin')) {
    await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
    return;
  }

  const message = interaction.fields.getTextInputValue('alert_message').trim();
  const timeStr = interaction.fields.getTextInputValue('alert_time').trim();
  const repeatStr = interaction.fields.getTextInputValue('alert_repeat')?.trim() || '0';

  // Validate time format
  const timeRegex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/;
  if (!timeRegex.test(timeStr)) {
    await interaction.reply({ 
      content: lang === 'ar' 
        ? '❌ تنسيق الوقت غير صحيح. استخدم: YYYY-MM-DD HH:MM' 
        : '❌ Invalid time format. Use: YYYY-MM-DD HH:MM', 
      ephemeral: true 
    });
    return;
  }

  const repeatHours = parseInt(repeatStr) || 0;
  const time = new Date(timeStr.replace(' ', 'T')).toISOString();
  const repeat = repeatHours > 0;
  const repeatInterval = repeatHours > 0 ? repeatHours * 60 * 60 * 1000 : null;
  
  // Add scheduled alert
  db.addMinistrySchedule(null, message, time, repeat);
  db.addAllianceLog('create_alert', userId, { message, time, repeat });
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم إنشاء تنبيه${repeat ? ' متكرر' : ''} في ${timeStr}` 
      : `✅ Created ${repeat ? 'recurring ' : ''}alert at ${timeStr}`, 
    ephemeral: true 
  });
}

async function processAdvancedSchedule(interaction, userId, lang) {
  if (!db.checkPermission(userId, 'admin')) {
    await interaction.reply({ content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', ephemeral: true });
    return;
  }

  const activity = interaction.fields.getTextInputValue('schedule_activity').trim();
  const timeStr = interaction.fields.getTextInputValue('schedule_time').trim();
  const intervalStr = interaction.fields.getTextInputValue('schedule_interval')?.trim() || '0';

  // Validate time format
  const timeRegex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/;
  if (!timeRegex.test(timeStr)) {
    await interaction.reply({ 
      content: lang === 'ar' 
        ? '❌ تنسيق الوقت غير صحيح. استخدم: YYYY-MM-DD HH:MM' 
        : '❌ Invalid time format. Use: YYYY-MM-DD HH:MM', 
      ephemeral: true 
    });
    return;
  }

  const intervalHours = parseInt(intervalStr) || 0;
  const time = new Date(timeStr.replace(' ', 'T')).toISOString();
  const repeat = intervalHours > 0;
  const repeatInterval = intervalHours > 0 ? intervalHours * 60 * 60 * 1000 : null;
  
  // Create activity and schedule
  const activityData = db.addAdvancedActivity(activity, '', 0);
  db.addScheduledBooking(activityData.id, time, userId, repeat, repeatInterval);
  db.addAllianceLog('schedule_advanced', userId, { activity, time, repeat });
  
  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم جدولة "${activity}"${repeat ? ` بتكرار كل ${intervalHours} ساعة` : ''}` 
      : `✅ Scheduled "${activity}"${repeat ? ` repeating every ${intervalHours} hours` : ''}`, 
    ephemeral: true 
  });
}

// === New Member Management Processors ===

async function processAddMemberNew(interaction, userId, lang) {
  // Check permissions
  if (!db.hasAlliancePermission(userId, ['R4', 'R5'])) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ يجب أن تكون R4 أو R5' : '❌ Must be R4 or R5', 
      ephemeral: true 
    });
    return;
  }

  const userInput = interaction.fields.getTextInputValue('member_user').trim();
  const rank = interaction.fields.getTextInputValue('member_rank').trim().toUpperCase();

  // Validate rank
  if (!['R1', 'R2', 'R3', 'R4', 'R5'].includes(rank)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ الرتبة غير صحيحة. استخدم: R1, R2, R3, R4, R5' : '❌ Invalid rank. Use: R1, R2, R3, R4, R5', 
      ephemeral: true 
    });
    return;
  }

  // Extract user ID from mention or direct ID
  const mentionMatch = userInput.match(/^<@!?(\d+)>$/);
  const targetUserId = mentionMatch ? mentionMatch[1] : userInput;

  if (!/^\d+$/.test(targetUserId)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ معرّف المستخدم غير صحيح' : '❌ Invalid user ID', 
      ephemeral: true 
    });
    return;
  }

  // Add member
  const result = db.addMember(targetUserId, rank);
  db.addAllianceLog('member_add', userId, { targetUserId, rank });

  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تمت إضافة <@${targetUserId}> برتبة ${rank}` 
      : `✅ Added <@${targetUserId}> with rank ${rank}`, 
    ephemeral: true 
  });
}

async function processRemoveMemberNew(interaction, userId, lang) {
  // Check permissions
  if (!db.hasAlliancePermission(userId, ['R4', 'R5'])) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ يجب أن تكون R4 أو R5' : '❌ Must be R4 or R5', 
      ephemeral: true 
    });
    return;
  }

  const userInput = interaction.fields.getTextInputValue('member_user').trim();

  // Extract user ID from mention or direct ID
  const mentionMatch = userInput.match(/^<@!?(\d+)>$/);
  const targetUserId = mentionMatch ? mentionMatch[1] : userInput;

  if (!/^\d+$/.test(targetUserId)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ معرّف المستخدم غير صحيح' : '❌ Invalid user ID', 
      ephemeral: true 
    });
    return;
  }

  // Remove member
  const result = db.removeMember(targetUserId);
  if (!result.success) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ العضو غير موجود' : '❌ Member not found', 
      ephemeral: true 
    });
    return;
  }

  db.addAllianceLog('member_remove', userId, { targetUserId });

  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تمت إزالة <@${targetUserId}>` 
      : `✅ Removed <@${targetUserId}>`, 
    ephemeral: true 
  });
}

async function processChangeRankNew(interaction, userId, lang) {
  // Check permissions
  if (!db.hasAlliancePermission(userId, ['R4', 'R5'])) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ يجب أن تكون R4 أو R5' : '❌ Must be R4 or R5', 
      ephemeral: true 
    });
    return;
  }

  const userInput = interaction.fields.getTextInputValue('member_user').trim();
  const rank = interaction.fields.getTextInputValue('member_rank').trim().toUpperCase();

  // Validate rank
  if (!['R1', 'R2', 'R3', 'R4', 'R5'].includes(rank)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ الرتبة غير صحيحة. استخدم: R1, R2, R3, R4, R5' : '❌ Invalid rank. Use: R1, R2, R3, R4, R5', 
      ephemeral: true 
    });
    return;
  }

  // Extract user ID from mention or direct ID
  const mentionMatch = userInput.match(/^<@!?(\d+)>$/);
  const targetUserId = mentionMatch ? mentionMatch[1] : userInput;

  if (!/^\d+$/.test(targetUserId)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ معرّف المستخدم غير صحيح' : '❌ Invalid user ID', 
      ephemeral: true 
    });
    return;
  }

  // Change rank
  const result = db.changeMemberRank(targetUserId, rank);
  if (!result.success) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ العضو غير موجود' : '❌ Member not found', 
      ephemeral: true 
    });
    return;
  }

  db.addAllianceLog('member_rank_change', userId, { targetUserId, rank });

  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم تغيير رتبة <@${targetUserId}> إلى ${rank}` 
      : `✅ Changed <@${targetUserId}> rank to ${rank}`, 
    ephemeral: true 
  });
}

async function processMemberSearch(interaction, userId, lang) {
  const query = interaction.fields.getTextInputValue('search_query').trim().toLowerCase();
  const alliance = db.getAlliance();
  const { EmbedBuilder } = await import('discord.js');

  if (!alliance.members || alliance.members.length === 0) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ لا يوجد أعضاء' : '❌ No members', 
      ephemeral: true 
    });
    return;
  }

  // Try to match by ID first
  const byId = alliance.members.filter(m => m.id.includes(query));
  
  if (byId.length === 0) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ لم يتم العثور على نتائج' : '❌ No results found', 
      ephemeral: true 
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(lang === 'ar' ? `🔍 نتائج البحث (${byId.length})` : `🔍 Search Results (${byId.length})`)
    .setColor('#3498db')
    .setTimestamp();

  const results = byId.slice(0, 10).map((m, i) => {
    const joinDate = new Date(m.joinedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
    return `${i + 1}. <@${m.id}> - ${m.rank} - ${joinDate}`;
  }).join('\n');

  embed.setDescription(results);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// === New Ministry Management Processors ===

async function processDeleteMinistry(interaction, userId, lang) {
  if (!db.checkPermission(userId, 'admin')) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', 
      ephemeral: true 
    });
    return;
  }

  const name = interaction.fields.getTextInputValue('ministry_name').trim();
  const result = db.deleteMinistry(name);

  if (!result.success) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ الوزارة غير موجودة' : '❌ Ministry not found', 
      ephemeral: true 
    });
    return;
  }

  db.addAllianceLog('ministry_delete', userId, { name });

  await interaction.reply({ 
    content: lang === 'ar' ? `✅ تم حذف وزارة "${name}"` : `✅ Deleted ministry "${name}"`, 
    ephemeral: true 
  });
}

async function processAssignMinister(interaction, userId, lang) {
  if (!db.checkPermission(userId, 'admin')) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ صلاحية الأدمن فقط' : '❌ Admin only', 
      ephemeral: true 
    });
    return;
  }

  const name = interaction.fields.getTextInputValue('ministry_name').trim();
  const userInput = interaction.fields.getTextInputValue('minister_user').trim();

  // Extract user ID from mention or direct ID
  const mentionMatch = userInput.match(/^<@!?(\d+)>$/);
  const ministerId = mentionMatch ? mentionMatch[1] : userInput;

  if (!/^\d+$/.test(ministerId)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ معرّف المستخدم غير صحيح' : '❌ Invalid user ID', 
      ephemeral: true 
    });
    return;
  }

  const result = db.assignMinister(name, ministerId);

  if (!result.success) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ الوزارة غير موجودة' : '❌ Ministry not found', 
      ephemeral: true 
    });
    return;
  }

  db.addAllianceLog('ministry_assign', userId, { name, ministerId });

  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم تعيين <@${ministerId}> وزيراً لـ "${name}"` 
      : `✅ Assigned <@${ministerId}> as minister of "${name}"`, 
    ephemeral: true 
  });
}

// Process Add Guild
async function processAddGuild(interaction, userId, lang) {
  if (!db.isOwner(userId)) {
    await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
    return;
  }

  const guildId = interaction.fields.getTextInputValue('guild_id').trim();
  const guildName = interaction.fields.getTextInputValue('guild_name').trim();

  // Validate guild ID format
  if (!/^\d{17,20}$/.test(guildId)) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ معرّف السيرفر غير صحيح (يجب أن يكون 17-20 رقم)' : '❌ Invalid server ID (must be 17-20 digits)', 
      ephemeral: true 
    });
    return;
  }

  const result = db.addGuild(guildId, guildName);

  if (!result.success) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ السيرفر مسجل مسبقاً' : '❌ Server already registered', 
      ephemeral: true 
    });
    return;
  }

  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم تسجيل السيرفر "${guildName}" بنجاح!\n🆔 معرف: ${guildId}` 
      : `✅ Server "${guildName}" registered successfully!\n🆔 ID: ${guildId}`, 
    ephemeral: true 
  });
}

// Process Remove Guild
async function processRemoveGuild(interaction, userId, lang) {
  if (!db.isOwner(userId)) {
    await interaction.reply({ content: lang === 'ar' ? '❌ ليس لديك صلاحية' : '❌ No permission', ephemeral: true });
    return;
  }

  const guildId = interaction.fields.getTextInputValue('guild_id').trim();

  const result = db.removeGuild(guildId);

  if (!result.success) {
    await interaction.reply({ 
      content: lang === 'ar' ? '❌ السيرفر غير موجود في القائمة' : '❌ Server not found in list', 
      ephemeral: true 
    });
    return;
  }

  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم إزالة السيرفر "${result.guild.name}" من القائمة` 
      : `✅ Server "${result.guild.name}" removed from list`, 
    ephemeral: true 
  });
}

// Process Alliance Register
async function processAllianceRegister(interaction, userId, lang) {
  const isR5OrAdmin = db.isAdmin(userId) || db.isOwner(userId) || (db.getAlliance().leader === userId);
  
  if (!isR5OrAdmin) {
    await interaction.reply({ content: t(lang, 'alliance.noPermission'), ephemeral: true });
    return;
  }

  const name = interaction.fields.getTextInputValue('alliance_name').trim();
  const tag = interaction.fields.getTextInputValue('alliance_tag').trim();
  const desc = interaction.fields.getTextInputValue('alliance_desc')?.trim() || '';

  // Update alliance info
  const alliance = db.getAlliance();
  alliance.name = name;
  alliance.tag = tag;
  alliance.description = desc;
  
  // Set current user as leader if no leader exists
  if (!alliance.leader) {
    alliance.leader = userId;
  }

  db.updateAlliance(alliance);
  db.addAllianceLog('alliance_register', userId, { name, tag });

  await interaction.reply({ 
    content: lang === 'ar' 
      ? `✅ تم تسجيل التحالف بنجاح!\n\n🏰 **الاسم:** ${name}\n🏷️ **التاق:** ${tag}\n📝 **الوصف:** ${desc || 'لا يوجد'}` 
      : `✅ Alliance registered successfully!\n\n🏰 **Name:** ${name}\n🏷️ **Tag:** ${tag}\n📝 **Description:** ${desc || 'None'}`, 
    ephemeral: true 
  });
}


// Ministry Appointment Processing
async function processMinistryAppointment(interaction, type, userId, lang) {
  const memberName = interaction.fields.getTextInputValue('appointment_member');
  const memberId = interaction.fields.getTextInputValue('appointment_member_id');
  const dateInput = interaction.fields.getTextInputValue('appointment_date'); // format: day/month
  const time = interaction.fields.getTextInputValue('appointment_time');
  
  const ministryNames = {
    building: lang === 'ar' ? 'البناء' : 'Building',
    research: lang === 'ar' ? 'البحث' : 'Research',
    training: lang === 'ar' ? 'التدريب' : 'Training'
  };

  // Parse day/month format
  const dateParts = dateInput.split('/');
  if (dateParts.length !== 2) {
    return await interaction.reply({
      content: lang === 'ar' ? '❌ صيغة التاريخ غير صحيحة. استخدم: يوم/شهر' : '❌ Invalid date format. Use: day/month',
      ephemeral: true
    });
  }

  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]);
  const now = new Date();
  const year = now.getFullYear();
  
  // Validate time format
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-3]0$/;
  if (!timeRegex.test(time)) {
    return await interaction.reply({
      content: lang === 'ar' ? '❌ الوقت غير صحيح. استخدم: 00:00, 00:30, 01:00...' : '❌ Invalid time. Use: 00:00, 00:30, 01:00...',
      ephemeral: true
    });
  }

  const date = `${day}/${month}/${year}`;
  const alliance = db.getAlliance();
  
  const bookings = db.getBookings('ministry') || [];
  bookings.push({
    id: Date.now(),
    ministry: ministryNames[type],
    type: type,
    date: date,
    time: time,
    memberName: memberName,
    memberId: memberId,
    allianceName: alliance.name || '',
    userId: userId,
    userName: interaction.user.username,
    createdAt: new Date().toISOString()
  });
  
  db.saveBookings('ministry', bookings);
  
  await interaction.reply({
    content: lang === 'ar' 
      ? `✅ تم حجز موعد ${ministryNames[type]}\n👤 ${memberName}\n📅 ${date} الساعة ${time}`
      : `✅ Booked ${ministryNames[type]}\n👤 ${memberName}\n📅 ${date} at ${time}`,
    ephemeral: true
  });
}

async function processDeleteAppointment(interaction, userId, lang) {
  const id = parseInt(interaction.fields.getTextInputValue('appointment_id'));
  const bookings = db.getBookings('ministry') || [];
  
  if (id < 1 || id > bookings.length) {
    return await interaction.reply({
      content: lang === 'ar' ? '❌ رقم غير صحيح' : '❌ Invalid number',
      ephemeral: true
    });
  }
  
  const removed = bookings.splice(id - 1, 1)[0];
  db.saveBookings('ministry', bookings);
  
  await interaction.reply({
    content: lang === 'ar' 
      ? `✅ تم حذف موعد ${removed.ministry}`
      : `✅ Deleted ${removed.ministry} appointment`,
    ephemeral: true
  });
}

async function processEditReminder(interaction, userId, lang) {
  const id = parseInt(interaction.fields.getTextInputValue('reminder_id'));
  const message = interaction.fields.getTextInputValue('reminder_message');
  
  const reminders = db.getReminders(userId);
  if (id < 1 || id > reminders.length) {
    return await interaction.reply({
      content: lang === 'ar' ? '❌ رقم غير صحيح' : '❌ Invalid number',
      ephemeral: true
    });
  }
  
  reminders[id - 1].message = message;
  db.saveReminders(userId, reminders);
  
  await interaction.reply({
    content: lang === 'ar' ? '✅ تم تحديث التذكير' : '✅ Reminder updated',
    ephemeral: true
  });
}

async function processSetReminderTime(interaction, userId, lang) {
  const id = parseInt(interaction.fields.getTextInputValue('reminder_id'));
  const beforeTime = interaction.fields.getTextInputValue('reminder_before');
  
  const validTimes = ['5m', '15m', '30m', '1h', '1d'];
  if (!validTimes.includes(beforeTime)) {
    return await interaction.reply({
      content: lang === 'ar' 
        ? '❌ وقت غير صالح. استخدم: 5m, 15m, 30m, 1h, 1d'
        : '❌ Invalid time. Use: 5m, 15m, 30m, 1h, 1d',
      ephemeral: true
    });
  }
  
  const reminders = db.getReminders(userId);
  if (id < 1 || id > reminders.length) {
    return await interaction.reply({
      content: lang === 'ar' ? '❌ رقم غير صحيح' : '❌ Invalid number',
      ephemeral: true
    });
  }
  
  reminders[id - 1].notifyBefore = beforeTime;
  db.saveReminders(userId, reminders);
  
  await interaction.reply({
    content: lang === 'ar' ? `✅ تم ضبط التنبيه قبل ${beforeTime}` : `✅ Alert set ${beforeTime} before`,
    ephemeral: true
  });
}

async function processMoveButton(interaction, direction, userId, lang) {
  const row = parseInt(interaction.fields.getTextInputValue('row_number'));
  const btn = parseInt(interaction.fields.getTextInputValue('button_index'));
  
  let layout = db.getButtonLayout(userId) || getDefaultLayout();
  
  if (row < 1 || row > layout.length || btn < 1 || btn > (layout[row-1]?.length || 0)) {
    return await interaction.reply({
      content: lang === 'ar' ? '❌ موضع غير صحيح' : '❌ Invalid position',
      ephemeral: true
    });
  }
  
  const targetRow = direction === 'up' ? row - 2 : row;
  if (targetRow < 0 || targetRow >= layout.length) {
    return await interaction.reply({
      content: lang === 'ar' ? '❌ لا يمكن النقل' : '❌ Cannot move',
      ephemeral: true
    });
  }
  
  const button = layout[row-1].splice(btn-1, 1)[0];
  layout[targetRow].push(button);
  
  db.saveButtonLayout(userId, layout);
  
  await interaction.reply({
    content: lang === 'ar' ? '✅ تم نقل الزر' : '✅ Button moved',
    ephemeral: true
  });
}

async function processSwapButtons(interaction, userId, lang) {
  const pos1 = interaction.fields.getTextInputValue('position1').split(',');
  const pos2 = interaction.fields.getTextInputValue('position2').split(',');
  
  if (pos1.length !== 2 || pos2.length !== 2) {
    return await interaction.reply({
      content: lang === 'ar' ? '❌ صيغة غير صحيحة' : '❌ Invalid format',
      ephemeral: true
    });
  }
  
  const [r1, b1] = pos1.map(Number);
  const [r2, b2] = pos2.map(Number);
  
  let layout = db.getButtonLayout(userId) || getDefaultLayout();
  
  if (!layout[r1-1]?.[b1-1] || !layout[r2-1]?.[b2-1]) {
    return await interaction.reply({
      content: lang === 'ar' ? '❌ موضع غير صحيح' : '❌ Invalid position',
      ephemeral: true
    });
  }
  
  const temp = layout[r1-1][b1-1];
  layout[r1-1][b1-1] = layout[r2-1][b2-1];
  layout[r2-1][b2-1] = temp;
  
  db.saveButtonLayout(userId, layout);
  
  await interaction.reply({
    content: lang === 'ar' ? '✅ تم تبديل الأزرار' : '✅ Buttons swapped',
    ephemeral: true
  });
}

// Button number to ID mapping
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

async function processEditLabels(interaction, userId, lang) {
  const buttonInput = interaction.fields.getTextInputValue('button_id');
  const labelAr = interaction.fields.getTextInputValue('label_ar');
  const labelEn = interaction.fields.getTextInputValue('label_en');
  
  // Convert number to button ID
  const buttonNum = parseInt(buttonInput);
  const buttonId = buttonNumberMap[buttonNum] || buttonInput;
  
  if (!buttonNumberMap[buttonNum] && !buttonInput.startsWith('menu_')) {
    return await interaction.reply({
      content: lang === 'ar' ? '❌ رقم الزر غير صحيح (1-11)' : '❌ Invalid button number (1-11)',
      ephemeral: true
    });
  }
  
  let labels = db.getCustomLabels(userId) || {};
  labels[buttonId] = { ar: labelAr, en: labelEn };
  db.saveCustomLabels(userId, labels);
  
  await interaction.reply({
    content: lang === 'ar' 
      ? `✅ تم تحديث نص الزر (${buttonNum}: ${labelAr})`
      : `✅ Label updated (${buttonNum}: ${labelEn})`,
    ephemeral: true
  });
}

function getDefaultLayout() {
  return [
    ['menu_alliance', 'menu_ministry_appointments', 'menu_members'],
    ['menu_logs', 'menu_schedule', 'menu_reminders'],
    ['menu_permissions', 'menu_stats', 'menu_settings'],
    ['menu_help', 'switch_language']
  ];
}
