import 'package:adhan/adhan.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'notification_service.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter/foundation.dart';
import 'dart:io';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class PrayerService {
  static const double defaultLat = 30.5877;
  static const double defaultLng = 31.5020;

  static Future<PrayerTimes> getCurrentPrayerTimes() async {
    Coordinates coordinates;
    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.low,
        timeLimit: const Duration(seconds: 2),
      );
      coordinates = Coordinates(position.latitude, position.longitude);
    } catch (e) {
      debugPrint('🔔 PrayerService: Using default location (Zagazig)');
      coordinates = Coordinates(defaultLat, defaultLng);
    }

    final params = CalculationMethod.egyptian.getParameters();
    params.madhab = Madhab.shafi;

    final now = DateTime.now();
    final date = DateComponents.from(now);
    
    // Check for Egypt DST Shift (Egypt is UTC+3 in summer, UTC+2 in winter)
    // Most libraries/OS might still use +2. If we detect we are in the DST period 
    // and the offset is +2, we manually add 1 hour.
    final prayerTimes = PrayerTimes(coordinates, date, params);
    
    // Check if we are in the Egypt DST period (Last Friday of April to last Thursday of October)
    bool isEgyptDST = _isEgyptDSTPeriod(now);
    
    if (isEgyptDST && now.timeZoneOffset.inHours == 2) {
      debugPrint('🔔 PrayerService: Applying Egypt DST +1 hour correction');
      return _applyDSTShift(prayerTimes, 1);
    }

    return prayerTimes;
  }

  static bool _isEgyptDSTPeriod(DateTime date) {
    // Egypt DST: Last Friday of April to last Thursday of October
    if (date.month < 4 || date.month > 10) return false;
    if (date.month > 4 && date.month < 10) return true;
    
    if (date.month == 4) {
      // Last Friday of April
      DateTime lastDay = DateTime(date.year, 4, 30);
      int lastFriday = 30 - (lastDay.weekday + 2) % 7;
      return date.day >= lastFriday;
    }
    
    if (date.month == 10) {
      // Last Thursday of October
      DateTime lastDay = DateTime(date.year, 10, 31);
      int lastThursday = 31 - (lastDay.weekday + 3) % 7;
      return date.day < lastThursday;
    }
    
    return false;
  }

  static PrayerTimes _applyDSTShift(PrayerTimes pt, int hours) {
    // Adhan's PrayerTimes objects are read-only, but we can't easily recreate them 
    // with a shifted offset because they use DateTime objects internally.
    // However, the getters in adhan return shifted DateTime objects if the base DateTime is shifted.
    // Since we can't modify the object, this logic is tricky.
    // A better way is to wrap the return or adjust the calculation.
    return pt; // We'll handle the shift when scheduling instead.
  }

  static Future<void> schedulePrayerReminders() async {
    final prefs = await SharedPreferences.getInstance();
    final bool isEnabled = prefs.getBool('prayer_reminders_enabled') ?? false;
    
    // Check platform support for zonedSchedule
    if (kIsWeb || (!Platform.isAndroid && !Platform.isIOS && !Platform.isMacOS)) {
      return; 
    }

    if (!isEnabled) {
      // Logic to cancel prayer notifications specifically could go here
      // but NotificationService.cancelAll is called by scheduleLectureNotifications
      return;
    }

    final prayerTimes = await getCurrentPrayerTimes();
    final now = DateTime.now();
    bool applyShift = _isEgyptDSTPeriod(now) && now.timeZoneOffset.inHours == 2;
    final shift = applyShift ? const Duration(hours: 1) : Duration.zero;

    final Map<String, DateTime> prayers = {
      'Fajr': prayerTimes.fajr.add(shift),
      'Dhuhr': prayerTimes.dhuhr.add(shift),
      'Asr': prayerTimes.asr.add(shift),
      'Maghrib': prayerTimes.maghrib.add(shift),
      'Isha': prayerTimes.isha.add(shift),
    };

    final Map<String, String> arabicNames = {
      'Fajr': 'الفجر',
      'Dhuhr': 'الظهر',
      'Asr': 'العصر',
      'Maghrib': 'المغرب',
      'Isha': 'العشاء',
    };

    final notificationService = NotificationService();
    int idBase = 2000;

    for (var entry in prayers.entries) {
      final prayerName = entry.key;
      final prayerTime = entry.value;
      
      // Calculate 5 minutes before
      final reminderTime = prayerTime.subtract(const Duration(minutes: 5));
      
      // If reminder time has already passed for today, don't schedule
      if (reminderTime.isBefore(DateTime.now())) continue;

      final tzReminderTime = tz.TZDateTime.from(reminderTime, tz.local);
      
      final String arabicName = arabicNames[prayerName]!;
      final String body = 'باقي ٥ دقائق على أذان $arabicName';

      await notificationService.flutterLocalNotificationsPlugin.zonedSchedule(
        id: idBase++,
        title: 'تذكير بالصلاة',
        body: body,
        scheduledDate: tzReminderTime,
        notificationDetails: const NotificationDetails(
          android: AndroidNotificationDetails(
            'prayer_channel',
            'Prayer Times',
            channelDescription: 'Notifications for prayer times',
            importance: Importance.high,
            priority: Priority.high,
          ),
        ),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      );
    }
    
    debugPrint('🔔 PrayerService: Scheduled notifications for today.');
  }
}
