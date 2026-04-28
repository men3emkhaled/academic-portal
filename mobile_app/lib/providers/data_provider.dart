import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/notification_service.dart';

class DataProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<dynamic> _timetable = [];
  List<dynamic> _departmentTimetable = [];
  List<dynamic> _exams = [];
  Map<String, dynamic> _gradesData = {};
  List<dynamic> _tasks = [];
  List<dynamic> _officialTasks = [];
  List<dynamic> _quizzes = [];
  List<dynamic> _completedQuizzes = [];
  List<dynamic> _roadmapTracks = [];
  List<dynamic> _notifications = [];
  List<dynamic> _events = [];

  bool _isLoadingTimetable = false;
  bool _isLoadingGrades = false;
  bool _isLoadingExtra = false;

  // Polling for new grades
  Timer? _pollingTimer;
  Set<String> _knownGradeSignatures = {};
  bool _isFirstGradesFetch = true;

  List<dynamic> get timetable => _timetable;
  List<dynamic> get departmentTimetable => _departmentTimetable;
  List<dynamic> get exams => _exams;
  Map<String, dynamic> get gradesData => _gradesData;
  List<dynamic> get tasks => _tasks;
  List<dynamic> get officialTasks => _officialTasks;
  List<dynamic> get quizzes => _quizzes;
  List<dynamic> get completedQuizzes => _completedQuizzes;
  List<dynamic> get roadmapTracks => _roadmapTracks;
  List<dynamic> get notifications => _notifications;

  List<dynamic> get grades => (_gradesData['grades'] as List<dynamic>?) ?? [];
  Map<String, dynamic> get gradesSummary =>
      (_gradesData['summary'] as Map<String, dynamic>?) ?? {};
  List<dynamic> get events => _events;

  bool get isLoadingTimetable => _isLoadingTimetable;
  bool get isLoadingGrades => _isLoadingGrades;
  bool get isLoadingExtra => _isLoadingExtra;

  Future<void> fetchTimetable(dynamic departmentId) async {
    _isLoadingTimetable = true;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();

    if (prefs.containsKey('cache_my_timetable')) {
      try {
        _timetable = jsonDecode(prefs.getString('cache_my_timetable')!);
        NotificationService().scheduleLectureNotifications(_timetable);
      } catch (_) {}
    }
    if (departmentId != null &&
        prefs.containsKey('cache_dept_timetable_$departmentId')) {
      try {
        _departmentTimetable = jsonDecode(
          prefs.getString('cache_dept_timetable_$departmentId')!,
        );
      } catch (_) {}
    }
    if (departmentId != null &&
        prefs.containsKey('cache_exams_$departmentId')) {
      try {
        _exams = jsonDecode(prefs.getString('cache_exams_$departmentId')!);
      } catch (_) {}
    }

    try {
      final response1 = await _apiService.dio.get('/student/my-timetable');
      _timetable = response1.data ?? [];
      prefs.setString('cache_my_timetable', jsonEncode(_timetable));
      NotificationService().scheduleLectureNotifications(_timetable);

      if (departmentId != null) {
        final response2 = await _apiService.dio.get(
          '/timetable/department/$departmentId',
        );
        _departmentTimetable = response2.data ?? [];
        prefs.setString(
          'cache_dept_timetable_$departmentId',
          jsonEncode(_departmentTimetable),
        );

        try {
          final response3 = await _apiService.dio.get(
            '/exams',
            queryParameters: {'department_id': departmentId},
          );
          _exams = response3.data ?? [];
          prefs.setString('cache_exams_$departmentId', jsonEncode(_exams));
        } catch (e) {
          debugPrint('Error fetching exams: $e');
        }
      }
    } catch (e) {
      debugPrint('Error/Offline fetching timetable: $e');
    } finally {
      _isLoadingTimetable = false;
      notifyListeners();
    }
  }

  Future<void> fetchGrades() async {
    _isLoadingGrades = true;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();

    // Load cached grades and build initial signatures
    if (prefs.containsKey('cache_grades_data')) {
      try {
        _gradesData = jsonDecode(prefs.getString('cache_grades_data')!);
        if (_isFirstGradesFetch) {
          _knownGradeSignatures = _buildGradeSignatures(_gradesData);
        }
      } catch (_) {}
    }

    try {
      final response = await _apiService.dio.get('/grades/my-grades');
      final newData = response.data ?? {};

      // Compare to find newly added grades
      if (!_isFirstGradesFetch) {
        final newSignatures = _buildGradeSignatures(newData);
        final brandNew = newSignatures.difference(_knownGradeSignatures);

        // Extract unique course names from new grade signatures
        final Set<String> notifiedCourses = {};
        for (final sig in brandNew) {
          // signature format: "courseName|examType"
          final courseName = sig.split('|').first;
          if (notifiedCourses.add(courseName)) {
            NotificationService().showGradeNotification(courseName);
          }
        }
        _knownGradeSignatures = newSignatures;
      } else {
        _knownGradeSignatures = _buildGradeSignatures(newData);
        _isFirstGradesFetch = false;
      }

      _gradesData = newData;
      prefs.setString('cache_grades_data', jsonEncode(_gradesData));
    } catch (e) {
      debugPrint('Error/Offline fetching grades: $e');
    } finally {
      _isLoadingGrades = false;
      notifyListeners();
    }
  }

  /// Build a set of signatures like "CourseName|midterm" for each grade that has a score
  Set<String> _buildGradeSignatures(Map<String, dynamic> data) {
    final Set<String> sigs = {};
    final gradesList = (data['grades'] as List<dynamic>?) ?? [];
    for (final g in gradesList) {
      final name = g['course_name']?.toString() ?? '';
      if (g['midterm_score'] != null) sigs.add('$name|midterm');
      if (g['practical_score'] != null) sigs.add('$name|practical');
      if (g['oral_score'] != null) sigs.add('$name|oral');
    }
    return sigs;
  }

  Future<void> fetchExtraModules() async {
    _isLoadingExtra = true;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();

    try {
      if (prefs.containsKey('cache_tasks'))
        _tasks = jsonDecode(prefs.getString('cache_tasks')!);
      if (prefs.containsKey('cache_official_tasks'))
        _officialTasks = jsonDecode(prefs.getString('cache_official_tasks')!);
      if (prefs.containsKey('cache_quizzes'))
        _quizzes = jsonDecode(prefs.getString('cache_quizzes')!);
      if (prefs.containsKey('cache_completed_quizzes'))
        _completedQuizzes = jsonDecode(
          prefs.getString('cache_completed_quizzes')!,
        );
      if (prefs.containsKey('cache_roadmap_tracks'))
        _roadmapTracks = jsonDecode(prefs.getString('cache_roadmap_tracks')!);
      if (prefs.containsKey('cache_notifications'))
        _notifications = jsonDecode(prefs.getString('cache_notifications')!);
    } catch (_) {}

    try {
      final tasksRes = await _apiService.dio.get('/student/personal-tasks');
      _tasks = tasksRes.data ?? [];
      prefs.setString('cache_tasks', jsonEncode(_tasks));

      try {
        final officialRes = await _apiService.dio.get(
          '/official-tasks/my-tasks',
        );
        _officialTasks = officialRes.data ?? [];
        prefs.setString('cache_official_tasks', jsonEncode(_officialTasks));
      } catch (e) {
        debugPrint('Error fetching official tasks: $e');
      }

      final quizzesRes = await _apiService.dio.get('/student/my-quizzes');
      _quizzes = quizzesRes.data ?? [];
      prefs.setString('cache_quizzes', jsonEncode(_quizzes));

      final compQuizzesRes = await _apiService.dio.get(
        '/student/completed-quizzes',
      );
      _completedQuizzes = compQuizzesRes.data ?? [];
      prefs.setString('cache_completed_quizzes', jsonEncode(_completedQuizzes));

      final roadmapRes = await _apiService.dio.get('/roadmap/tracks');
      _roadmapTracks = roadmapRes.data ?? [];
      prefs.setString('cache_roadmap_tracks', jsonEncode(_roadmapTracks));

      final notifRes = await _apiService.dio.get(
        '/notifications/my-notifications',
      );
      _notifications = notifRes.data ?? [];
      prefs.setString('cache_notifications', jsonEncode(_notifications));

      await fetchEvents();
    } catch (e) {
      debugPrint('Error/Offline fetching extra modules: $e');
    } finally {
      _isLoadingExtra = false;
      notifyListeners();
    }
  }

  Future<void> fetchEvents() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.containsKey('cache_events')) {
      try {
        _events = jsonDecode(prefs.getString('cache_events')!);
      } catch (_) {}
    }

    try {
      final res = await _apiService.dio.get('/events/upcoming');
      _events = res.data ?? [];
      prefs.setString('cache_events', jsonEncode(_events));
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching events: $e');
    }
  }

  Future<void> markNotificationAsRead(dynamic id) async {
    try {
      await _apiService.dio.put('/notifications/$id/read');
      final index = _notifications.indexWhere((n) => n['id'] == id);
      if (index != -1) {
        // Create a new map for the notification to ensure provider state updates correctly
        final newNotification = Map<String, dynamic>.from(
          _notifications[index],
        );
        newNotification['is_read'] = 1;
        _notifications[index] = newNotification;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error marking notification read: $e');
    }
  }

  /// Start background polling for new grades (every 3 minutes)
  void startGradePolling() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(minutes: 3), (_) {
      fetchGrades();
    });
  }

  /// Stop background polling
  void stopGradePolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  void clearData() {
    stopGradePolling();
    _timetable = [];
    _departmentTimetable = [];
    _exams = [];
    _gradesData = {};
    _tasks = [];
    _officialTasks = [];
    _quizzes = [];
    _completedQuizzes = [];
    _roadmapTracks = [];
    _notifications = [];
    _events = [];
    _knownGradeSignatures = {};
    _isFirstGradesFetch = true;
    notifyListeners();
  }
}
