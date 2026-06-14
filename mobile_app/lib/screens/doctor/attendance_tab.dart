import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../theme.dart';
import '../../services/api_service.dart';
import '../ui_helpers.dart';
import 'modals/attendance_records_modal.dart';

class DoctorAttendanceTab extends StatefulWidget {
  const DoctorAttendanceTab({super.key});

  @override
  State<DoctorAttendanceTab> createState() => _DoctorAttendanceTabState();
}

class _DoctorAttendanceTabState extends State<DoctorAttendanceTab> {
  final ApiService _apiService = ApiService();
  List<dynamic> _courses = [];
  dynamic _selectedCourse;
  List<dynamic> _sessions = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    setState(() => _isLoading = true);
    try {
      final res = await _apiService.dio.get('/doctor/courses');
      setState(() {
        _courses = res.data ?? [];
        if (_courses.isNotEmpty) {
          _selectedCourse = _courses.first;
          _fetchSessions(_selectedCourse['id']);
        } else {
          _isLoading = false;
        }
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchSessions(dynamic courseId) async {
    setState(() => _isLoading = true);
    try {
      final res =
          await _apiService.dio.get('/doctor/attendance/$courseId/sessions');
      setState(() {
        _sessions = res.data ?? [];
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _createSession() async {
    if (_selectedCourse == null) return;
    try {
      await _apiService.dio.post('/doctor/attendance/sessions',
          data: {'courseId': _selectedCourse['id']});
      _fetchSessions(_selectedCourse['id']);
    } catch (_) {}
  }

  void _openSessionRecords(dynamic session) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (context, scrollController) => AttendanceRecordsModal(
          session: session,
          scrollController: scrollController,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const GradientText('Attendance Tracker', fontSize: 28),
            const SizedBox(height: 20),

            // Course selector dropdown
            if (_courses.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: colors.card,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: colors.borderSubtle),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<dynamic>(
                    value: _selectedCourse,
                    dropdownColor: colors.card,
                    isExpanded: true,
                    style: TextStyle(
                        color: colors.textPrimary,
                        fontWeight: FontWeight.bold),
                    items: _courses.map((course) {
                      return DropdownMenuItem<dynamic>(
                        value: course,
                        child: Text(course['name'] ?? ''),
                      );
                    }).toList(),
                    onChanged: (val) {
                      setState(() => _selectedCourse = val);
                      _fetchSessions(val['id']);
                    },
                  ),
                ),
              ),
            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Sessions',
                  style: TextStyle(
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: _createSession,
                  icon: const Icon(LucideIcons.plus,
                      size: 16, color: Colors.black),
                  label: const Text('New Session',
                      style: TextStyle(
                          color: Colors.black, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: CircularProgressIndicator(color: AppTheme.primary),
                ),
              )
            else if (_sessions.isEmpty)
              GlassContainer(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Text(
                    'No sessions created for this course.',
                    style: TextStyle(
                        color: colors.textSecondary, fontSize: 13),
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _sessions.length,
                itemBuilder: (context, index) {
                  final session = _sessions[index];
                  return GlassContainer(
                    padding: const EdgeInsets.all(18),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color:
                                AppTheme.primary.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(LucideIcons.calendar,
                              color: AppTheme.primary, size: 20),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                session['title'] ?? 'Lecture Session',
                                style: TextStyle(
                                  color: colors.textPrimary,
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                session['date'] != null
                                    ? DateTime.parse(session['date'])
                                        .toLocal()
                                        .toString()
                                        .substring(0, 10)
                                    : 'Today',
                                style: TextStyle(
                                    color: colors.textSecondary,
                                    fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(LucideIcons.scan,
                              color: AppTheme.primary),
                          onPressed: () => _openSessionRecords(session),
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
