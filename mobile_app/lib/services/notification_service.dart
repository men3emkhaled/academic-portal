import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter/foundation.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'dart:io';
import 'fcm_service.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._();
  factory NotificationService() => _instance;
  NotificationService._();

  // ── REUSE the same plugin instance from FCMService ──
  FlutterLocalNotificationsPlugin get flutterLocalNotificationsPlugin =>
      FCMService.localNotificationsPlugin;

  Future<void> init() async {
    tz.initializeTimeZones();

    try {
      // ✅ Set the local timezone name (e.g. "Africa/Cairo")
      final TimezoneInfo timeZone = await FlutterTimezone.getLocalTimezone();
      final String identifier = timeZone.identifier;
      tz.setLocalLocation(tz.getLocation(identifier));
      debugPrint('🔔 NotificationService: Local timezone set to $identifier');
    } catch (e) {
      debugPrint('⚠️ NotificationService: Could not get local timezone, defaulting to UTC: $e');
    }

    // No need to call initialize() again — FCMService already did it.
    // Just request additional permissions if needed.
    if (Platform.isAndroid) {
      await flutterLocalNotificationsPlugin
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
          ?.requestExactAlarmsPermission();
    }
  }

  Future<void> scheduleLectureNotifications(List<dynamic> timetable) async {
    // 1. Check platform support for zonedSchedule
    if (kIsWeb || (!Platform.isAndroid && !Platform.isIOS && !Platform.isMacOS)) {
      return; // Platform doesn't support zoned local notifications yet.
    }

    // 2. Clear previous lecture reminders only (leave others alone)
    // We could either cancel by a range of IDs or just cancelAll if that's the intention, 
    // but the user wants lecture + prayer notifications to coexist.
    // For now, let's keep it simple: we cancel only the IDs we might have used.
    for (int i = 1000; i < 2000; i++) {
      await flutterLocalNotificationsPlugin.cancel(id: i);
    }

    if (timetable.isEmpty) return;

    int idTracker = 1000;

    for (final entry in timetable) {
      if (entry['day_of_week'] == null || entry['start_time'] == null || entry['course_name'] == null) continue;

      final int dayIndex = _getDayIndex(entry['day_of_week']);
      if (dayIndex == -1) continue;

      try {
        final String timeStr = entry['start_time'].toString().trim();
        final RegExp timeRegex = RegExp(r'(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?', caseSensitive: false);
        final match = timeRegex.firstMatch(timeStr);

        if (match == null) continue;

        int hour = int.parse(match.group(1)!);
        int minute = int.parse(match.group(2)!);
        final String? amPm = match.group(4);

        if (amPm != null) {
          if (amPm.toUpperCase() == 'PM' && hour < 12) hour += 12;
          if (amPm.toUpperCase() == 'AM' && hour == 12) hour = 0;
        }

        // ── USE SYSTEM CLOCK FOR CALCULATION ──
        final now = DateTime.now();
        // Create a DateTime object based on the DEVICE'S current clock
        DateTime lectureDateTime = DateTime(now.year, now.month, now.day, hour, minute);
        
        // Find the next occurrence of this weekday
        while (lectureDateTime.weekday != dayIndex) {
          lectureDateTime = lectureDateTime.add(const Duration(days: 1));
        }

        // Notification 15 mins before
        DateTime notifyDateTime = lectureDateTime.subtract(const Duration(minutes: 15));

        // If it already passed for this week's occurrence, move to next week
        if (notifyDateTime.isBefore(now)) {
          notifyDateTime = notifyDateTime.add(const Duration(days: 7));
        }

        // Convert the system DateTime moment to TZDateTime for the notification plugin
        // This preserves the exact 'moment' in time from the device's clock.
        final tzScheduledDate = tz.TZDateTime.from(notifyDateTime, tz.local);

        final room = entry['location'] ?? 'Classroom';
        await flutterLocalNotificationsPlugin.zonedSchedule(
          id: idTracker++,
          title: 'Lecture in 15 Minutes!',
          body: '${entry['course_name']} starts at ${entry['start_time']} in $room',
          scheduledDate: tzScheduledDate,
          notificationDetails: const NotificationDetails(
            android: AndroidNotificationDetails(
              'lecture_channel', 
              'Lectures',
              channelDescription: 'Notifications for upcoming lectures',
              importance: Importance.high,
              priority: Priority.high,
            ),
          ),
          androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
          matchDateTimeComponents: DateTimeComponents.dayOfWeekAndTime,
        );
      } catch (e) {
        debugPrint('Error scheduling notification: $e');
      }
    }
  }

  /// Show an instant notification in the device status bar
  Future<void> showInstantNotification({
    required int id,
    required String title,
    required String body,
    String channelId = 'general_channel',
    String channelName = 'General',
  }) async {
    await flutterLocalNotificationsPlugin.show(
      id: id,
      title: title,
      body: body,
      notificationDetails: NotificationDetails(
        android: AndroidNotificationDetails(
          channelId,
          channelName,
          channelDescription: 'General app notifications',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
    );
  }

  /// Show a grade notification in the status bar
  Future<void> showGradeNotification(String courseName) async {
    await showInstantNotification(
      id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title: '📊 درجات جديدة!',
      body: 'درجات مادة $courseName جاهزة - افتح التطبيق لمشاهدتها',
      channelId: 'grades_channel',
      channelName: 'Grades',
    );
  }

  int _getDayIndex(String dayString) {
    switch (dayString.trim().toLowerCase()) {
      case 'monday': return DateTime.monday;
      case 'tuesday': return DateTime.tuesday;
      case 'wednesday': return DateTime.wednesday;
      case 'thursday': return DateTime.thursday;
      case 'friday': return DateTime.friday;
      case 'saturday': return DateTime.saturday;
      case 'sunday': return 7; // Sunday is 7 in adhan/DateTime for some systems, but let's be careful
      default: return -1;
    }
  }

  bool _isEgyptDSTPeriod(DateTime date) {
    if (date.month < 4 || date.month > 10) return false;
    if (date.month > 4 && date.month < 10) return true;
    if (date.month == 4) {
      DateTime lastDay = DateTime(date.year, 4, 30);
      int lastFriday = 30 - (lastDay.weekday + 2) % 7;
      return date.day >= lastFriday;
    }
    if (date.month == 10) {
      DateTime lastDay = DateTime(date.year, 10, 31);
      int lastThursday = 31 - (lastDay.weekday + 3) % 7;
      return date.day < lastThursday;
    }
    return false;
  }

  tz.TZDateTime _nextInstanceOfDayAndTime(int weekday, int hour, int minute, {int subtractMinutes = 0}) {
    tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    // Start from the lecture time
    tz.TZDateTime lectureDate = tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
    
    // Find the next matching weekday (starting from today)
    while (lectureDate.weekday != weekday) {
      lectureDate = lectureDate.add(const Duration(days: 1));
    }

    // The actual notification fires `subtractMinutes` before the lecture
    tz.TZDateTime notificationDate = lectureDate.subtract(Duration(minutes: subtractMinutes));
    
    // If the notification time has already passed this week, skip to next week
    if (notificationDate.isBefore(now)) {
      lectureDate = lectureDate.add(const Duration(days: 7));
      notificationDate = lectureDate.subtract(Duration(minutes: subtractMinutes));
    }

    return notificationDate;
  }
}
