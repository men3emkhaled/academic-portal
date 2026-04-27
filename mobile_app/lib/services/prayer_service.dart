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

    final date = DateComponents.from(DateTime.now());
    return PrayerTimes(coordinates, date, params);
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
    final Map<String, DateTime> prayers = {
      'Fajr': prayerTimes.fajr,
      'Dhuhr': prayerTimes.dhuhr,
      'Asr': prayerTimes.asr,
      'Maghrib': prayerTimes.maghrib,
      'Isha': prayerTimes.isha,
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
