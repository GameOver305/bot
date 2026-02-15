export const translations = {
  ar: {
    // Main Menu
    mainMenu: {
      title: '🎮 لوحة التحكم الرئيسية',
      description: 'مرحباً بك! اختر أحد الخيارات أدناه',
      bookings: '📅 نظام الحجوزات',
      alliance: '🤝 نظام التحالف',
      settings: '⚙️ الإعدادات',
      permissions: '🛡️ الصلاحيات',
      help: '❓ المساعدة'
    },
    
    // Bookings
    bookings: {
      title: '📅 نظام الحجوزات',
      description: 'اختر نوع الحجز',
      building: '🏗️ مواعيد البناء',
      research: '🔬 مواعيد الأبحاث',
      training: '⚔️ مواعيد التدريب',
      view: '📋 عرض الحجوزات',
      add: '➕ إضافة حجز',
      remove: '🗑️ حذف حجز',
      back: '◀️ رجوع',
      conflict: '❌ هناك تعارض مع حجز آخر في هذا الموعد',
      success: '✅ تم إضافة الحجز بنجاح',
      removed: '✅ تم حذف الحجز بنجاح',
      empty: 'لا توجد حجوزات حالياً',
      details: 'المستخدم: {user}\nالبداية: {start}\nالنهاية: {end}\nالمدة: {duration} يوم'
    },

    // Alliance
    alliance: {
      title: '🤝 نظام التحالف',
      description: 'إدارة معلومات التحالف',
      info: '📊 معلومات التحالف',
      members: '👥 إدارة الأعضاء',
      ranks: '⭐ نظام الرتب',
      addMember: '➕ إضافة عضو',
      removeMember: '➖ إزالة عضو',
      changeRank: '🔄 تغيير الرتبة',
      noPermission: '❌ ليس لديك صلاحية لتنفيذ هذا الإجراء',
      memberAdded: '✅ تم إضافة العضو بنجاح',
      memberRemoved: '✅ تم إزالة العضو بنجاح',
      rankChanged: '✅ تم تغيير الرتبة بنجاح',
      allianceInfo: '**اسم التحالف:** {name}\n**الوسم:** {tag}\n**القائد:** {leader}\n**عدد الأعضاء:** {count}\n**الوصف:** {description}',
      notSet: 'غير محدد',
      back: '◀️ رجوع'
    },

    // Settings
    settings: {
      title: '⚙️ الإعدادات',
      description: 'تخصيص تجربتك',
      language: '🌐 اللغة',
      notifications: '🔔 التذكيرات',
      reminderTimes: '⏰ أوقات التذكير',
      languageChanged: '✅ تم تغيير اللغة إلى {lang}',
      notificationsToggled: '✅ تم {status} التذكيرات',
      enabled: 'تفعيل',
      disabled: 'تعطيل',
      back: '◀️ رجوع'
    },

    // Permissions
    permissions: {
      title: '🛡️ نظام الصلاحيات',
      description: 'إدارة صلاحيات المستخدمين',
      admins: '👮 المشرفين',
      addAdmin: '➕ إضافة مشرف',
      removeAdmin: '➖ إزالة مشرف',
      ownerOnly: '❌ هذا الأمر متاح للمالك فقط',
      adminAdded: '✅ تم إضافة {user} كمشرف',
      adminRemoved: '✅ تم إزالة {user} من المشرفين',
      back: '◀️ رجوع'
    },

    // Reminders
    reminders: {
      title: '🔔 تذكير بالحجز',
      message: '⏰ تذكير: لديك حجز في {type}\n**البداية:** {start}\n**المتبقي:** {remaining}',
      types: {
        building: 'مواعيد البناء',
        research: 'مواعيد الأبحاث',
        training: 'مواعيد التدريب'
      }
    },

    // Common
    common: {
      success: '✅ تم بنجاح',
      error: '❌ حدث خطأ',
      cancel: '❌ إلغاء',
      confirm: '✅ تأكيد',
      back: '◀️ رجوع',
      next: '▶️ التالي',
      loading: '⏳ جاري التحميل...',
      notFound: '❌ لم يتم العثور على البيانات'
    }
  },

  en: {
    // Main Menu
    mainMenu: {
      title: '🎮 Main Control Panel',
      description: 'Welcome! Choose one of the options below',
      bookings: '📅 Booking System',
      alliance: '🤝 Alliance System',
      settings: '⚙️ Settings',
      permissions: '🛡️ Permissions',
      help: '❓ Help'
    },
    
    // Bookings
    bookings: {
      title: '📅 Booking System',
      description: 'Choose booking type',
      building: '🏗️ Building Schedule',
      research: '🔬 Research Schedule',
      training: '⚔️ Training Schedule',
      view: '📋 View Bookings',
      add: '➕ Add Booking',
      remove: '🗑️ Remove Booking',
      back: '◀️ Back',
      conflict: '❌ There is a conflict with another booking',
      success: '✅ Booking added successfully',
      removed: '✅ Booking removed successfully',
      empty: 'No bookings available',
      details: 'User: {user}\nStart: {start}\nEnd: {end}\nDuration: {duration} days'
    },

    // Alliance
    alliance: {
      title: '🤝 Alliance System',
      description: 'Manage alliance information',
      info: '📊 Alliance Info',
      members: '👥 Manage Members',
      ranks: '⭐ Rank System',
      addMember: '➕ Add Member',
      removeMember: '➖ Remove Member',
      changeRank: '🔄 Change Rank',
      noPermission: '❌ You don\'t have permission',
      memberAdded: '✅ Member added successfully',
      memberRemoved: '✅ Member removed successfully',
      rankChanged: '✅ Rank changed successfully',
      allianceInfo: '**Alliance Name:** {name}\n**Tag:** {tag}\n**Leader:** {leader}\n**Members:** {count}\n**Description:** {description}',
      notSet: 'Not set',
      back: '◀️ Back'
    },

    // Settings
    settings: {
      title: '⚙️ Settings',
      description: 'Customize your experience',
      language: '🌐 Language',
      notifications: '🔔 Reminders',
      reminderTimes: '⏰ Reminder Times',
      languageChanged: '✅ Language changed to {lang}',
      notificationsToggled: '✅ Notifications {status}',
      enabled: 'enabled',
      disabled: 'disabled',
      back: '◀️ Back'
    },

    // Permissions
    permissions: {
      title: '🛡️ Permission System',
      description: 'Manage user permissions',
      admins: '👮 Administrators',
      addAdmin: '➕ Add Admin',
      removeAdmin: '➖ Remove Admin',
      ownerOnly: '❌ Owner only command',
      adminAdded: '✅ {user} added as admin',
      adminRemoved: '✅ {user} removed from admins',
      back: '◀️ Back'
    },

    // Reminders
    reminders: {
      title: '🔔 Booking Reminder',
      message: '⏰ Reminder: You have a booking in {type}\n**Start:** {start}\n**Remaining:** {remaining}',
      types: {
        building: 'Building Schedule',
        research: 'Research Schedule',
        training: 'Training Schedule'
      }
    },

    // Common
    common: {
      success: '✅ Success',
      error: '❌ Error occurred',
      cancel: '❌ Cancel',
      confirm: '✅ Confirm',
      back: '◀️ Back',
      next: '▶️ Next',
      loading: '⏳ Loading...',
      notFound: '❌ Data not found'
    }
  }
};

// Get translation with variable replacement
export function t(lang, key, vars = {}) {
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') return key;
  
  // Replace variables
  for (const [varKey, varValue] of Object.entries(vars)) {
    value = value.replace(`{${varKey}}`, varValue);
  }
  
  return value;
}

export default translations;
