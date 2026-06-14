import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../theme.dart';
import 'ui_helpers.dart';

class TimetableTab extends StatefulWidget {
  const TimetableTab({super.key});

  @override
  State<TimetableTab> createState() => _TimetableTabState();
}

class _TimetableTabState extends State<TimetableTab> {
  String _selectedDay = '';
  DateTime? _weekStart;
  String _viewMode = 'my-section'; // my-section | all-sections
  String _scheduleType = 'lectures'; // lectures | exams
  late ScrollController _dayScrollController;

  final List<Map<String, String>> _days = [
    {'id': 'Sunday', 'short': 'Sun'},
    {'id': 'Monday', 'short': 'Mon'},
    {'id': 'Tuesday', 'short': 'Tue'},
    {'id': 'Wednesday', 'short': 'Wed'},
    {'id': 'Thursday', 'short': 'Thu'},
    {'id': 'Friday', 'short': 'Fri'},
    {'id': 'Saturday', 'short': 'Sat'},
  ];

  @override
  void initState() {
    super.initState();
    final today = DateTime.now();
    final todayDayIndex = today.weekday == 7 ? 0 : today.weekday;
    _selectedDay = _days[todayDayIndex]['id']!;
    _weekStart = _getStartOfWeek(today);

    _dayScrollController = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_dayScrollController.hasClients) {
        final offset = todayDayIndex * 88.0;
        final maxScroll = _dayScrollController.position.maxScrollExtent;
        _dayScrollController.animateTo(
          offset.clamp(0.0, maxScroll),
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _dayScrollController.dispose();
    super.dispose();
  }

  DateTime _getStartOfWeek(DateTime date) {
    int day = date.weekday;
    if (day == 7) day = 0; 
    return date.subtract(Duration(days: day));
  }

  bool _isLectureCompleted(dynamic entry) {
    if (entry['start_time'] == null) return false;
    final now = DateTime.now();
    final parts = entry['start_time'].split(':');
    final lectureStart = DateTime(now.year, now.month, now.day, int.parse(parts[0]), int.parse(parts[1]));
    return now.isAfter(lectureStart.add(const Duration(minutes: 10)));
  }

  bool _isLectureNow(dynamic entry) {
    if (entry['start_time'] == null || entry['end_time'] == null) return false;
    final now = DateTime.now();
    final startParts = entry['start_time'].split(':');
    final endParts = entry['end_time'].split(':');
    final start = DateTime(now.year, now.month, now.day, int.parse(startParts[0]), int.parse(startParts[1]));
    final end = DateTime(now.year, now.month, now.day, int.parse(endParts[0]), int.parse(endParts[1]));
    return now.isAfter(start) && now.isBefore(end);
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

  String _formatTime(String? time) {
    if (time == null) return '—';
    final parts = time.split(':');
    int hour = int.parse(parts[0]);
    int minute = int.parse(parts[1]);

    final ampm = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour == 0) hour = 12;
    
    final minuteStr = minute.toString().padLeft(2, '0');
    return '$hour:$minuteStr $ampm';
  }

  @override
  Widget build(BuildContext context) {
    final dp = context.watch<DataProvider>();
    final auth = context.watch<AuthProvider>();
    final colors = Theme.of(context).extension<AppColors>()!;
    final section = auth.studentSection ?? '?';
    final deptId = auth.student?['department_id'];

    // If no exams in DB, force lectures view
    final effectiveScheduleType = dp.exams.isEmpty ? 'lectures' : _scheduleType;


    List<dynamic> activeTimetable = [];
    if (_viewMode == 'my-section') {
      activeTimetable = dp.timetable;
    } else {
      activeTimetable = dp.departmentTimetable;
    }

    var dayEntries = activeTimetable.where((t) => t['day_of_week'] == _selectedDay).toList();

    if (_viewMode == 'all-sections') {
      final Map<String, Map<String, dynamic>> grouped = {};
      for (final e in dayEntries) {
        final key = '${e['course_name']}_${e['type']}_${e['start_time']}_${e['location']}';
        if (grouped.containsKey(key)) {
          final existing = grouped[key]!['section']?.toString() ?? '';
          final newSec = e['section']?.toString() ?? '';
          if (newSec.isNotEmpty) {
             final existingList = existing.split(', ');
             if (!existingList.contains(newSec)) {
               grouped[key]!['section'] = existing.isEmpty ? newSec : '$existing, $newSec';
             }
          }
        } else {
          grouped[key] = Map<String, dynamic>.from(e);
        }
      }
      dayEntries = grouped.values.toList();
      dayEntries.sort((a, b) => (a['start_time'] ?? '').compareTo(b['start_time'] ?? ''));
    }

    final isToday = _selectedDay == _days[DateTime.now().weekday == 7 ? 0 : DateTime.now().weekday]['id'];

    int weekNumber = _weekStart == null ? 0 : ((_weekStart!.difference(DateTime(DateTime.now().year, 1, 1)).inDays) / 7).ceil();

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
             Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                     GradientText(_selectedDay, fontSize: 36),
                     Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(color: colors.card, borderRadius: BorderRadius.circular(32), border: Border.all(color: colors.borderSubtle)),
                        child: Row(
                           children: [
                              _buildModeBtn('My Section', 'my-section', _viewMode == 'my-section', colors),
                              _buildModeBtn('All', 'all-sections', _viewMode == 'all-sections', colors, disabled: deptId == null),
                           ],
                        )
                     )
                  ],
                )
             ),
             Padding(
                 padding: const EdgeInsets.symmetric(horizontal: 24),
                 child: Align(alignment: Alignment.centerLeft, child: Text('WEEK $weekNumber', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2, color: AppTheme.primaryBlue))),
              ),
              
              if (dp.exams.isNotEmpty)
              Padding(
                 padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                 child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(color: colors.card, borderRadius: BorderRadius.circular(32), border: Border.all(color: colors.borderSubtle)),
                    child: Row(
                       children: [
                          Expanded(child: _buildModeBtn('Lectures', 'lectures', _scheduleType == 'lectures', colors, onTap: () => setState(() => _scheduleType = 'lectures'))),
                          Expanded(child: _buildModeBtn('Exams', 'exams', _scheduleType == 'exams', colors, onTap: () => setState(() => _scheduleType = 'exams'))),
                       ],
                    )
                 )
              ),

              
              if (effectiveScheduleType == 'lectures') ...[
              // --- HORIZONTAL DAY SELECTOR ---
              Container(
                height: 105,
                margin: const EdgeInsets.symmetric(vertical: 16),
                child: ListView.builder(
                  controller: _dayScrollController,
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  itemCount: _days.length,
                  itemBuilder: (context, i) {
                    final d = _days[i];
                    final isActive = _selectedDay == d['id'];
                    final dateDay = _weekStart != null ? _weekStart!.add(Duration(days: i)).day.toString() : '';

                    return GestureDetector(
                      onTap: () => setState(() => _selectedDay = d['id']!),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        width: 76,
                        margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                        decoration: BoxDecoration(
                          color: isActive ? AppTheme.primaryBlue : colors.card,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: isActive ? AppTheme.primaryBlue : colors.borderSubtle,
                            width: 1.2,
                          ),
                          boxShadow: isActive
                              ? [
                                  BoxShadow(
                                    color: AppTheme.primaryBlue.withValues(alpha: 0.35),
                                    blurRadius: 16,
                                    offset: const Offset(0, 6),
                                  )
                                ]
                              : [
                                  BoxShadow(
                                    color: colors.cardShadow.withValues(alpha: 0.04),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  )
                                ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              d['short']!.toUpperCase(),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: isActive ? Colors.black : colors.textSecondary,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              dateDay,
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: isActive ? Colors.black : colors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

             Expanded(
                child: dp.isLoadingTimetable 
                  ? const Center(child: CircularProgressIndicator())
                  : dayEntries.isEmpty 
                     ? Center(
                         child: GlassContainer(
                            backgroundColor: colors.surfaceLight,
                            child: Column(
                               mainAxisSize: MainAxisSize.min,
                               children: [
                                  Icon(LucideIcons.coffee, size: 48, color: colors.textHint),
                                  const SizedBox(height: 16),
                                  Text('Holiday - No Classes', style: TextStyle(fontSize: 18, color: colors.textSecondary, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Text('Enjoy your day off!', style: TextStyle(color: colors.textHint))
                               ],
                            )
                         )
                     )
                     : ListView.builder(
                         padding: const EdgeInsets.symmetric(horizontal: 24),
                         itemCount: dayEntries.length,
                         itemBuilder: (ctx, i) {
                            final e = dayEntries[i];
                            final isNow = _isLectureNow(e) && isToday;
                            final isFin = _isLectureCompleted(e) && isToday;

                            return AnimatedOpacity(
                               duration: const Duration(milliseconds: 300),
                               opacity: isFin && !isNow ? 0.6 : 1.0,
                               child: Container(
                                  margin: const EdgeInsets.only(bottom: 16),
                                  decoration: BoxDecoration(
                                     borderRadius: BorderRadius.circular(32),
                                     boxShadow: isNow ? [BoxShadow(color: AppTheme.primaryBlue.withValues(alpha: 0.2), blurRadius: 20)] : [],
                                     border: Border.all(color: isNow ? AppTheme.primaryBlue : Colors.transparent, width: isNow ? 2 : 0)
                                  ),
                                  child: GlassContainer(
                                     margin: EdgeInsets.zero,
                                     backgroundColor: colors.card,
                                     borderColor: isNow ? AppTheme.primaryBlue.withValues(alpha: 0.3) : colors.borderSubtle,
                                     child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                           Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                 Expanded(
                                                    child: Column(
                                                       crossAxisAlignment: CrossAxisAlignment.start,
                                                       children: [
                                                          Container(
                                                             padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                                             decoration: BoxDecoration(color: (e['type'] == 'Lecture' ? AppTheme.primary : Colors.purpleAccent).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)),
                                                             child: Text((e['type'] ?? 'Lecture').toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: (e['type'] == 'Lecture' ? AppTheme.primary : Colors.purpleAccent), letterSpacing: 1.5)),
                                                          ),
                                                          const SizedBox(height: 12),
                                                          GradientText(e['course_name'] ?? '', fontSize: 24),
                                                          if (_viewMode == 'all-sections' && e['section'] != null)
                                                             Padding(
                                                                padding: const EdgeInsets.only(top: 8.0),
                                                                child: Container(
                                                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                                                  decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: colors.textHint)),
                                                                  child: Text('Sec: ${e['section']}', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary)),
                                                                )
                                                             )
                                                       ],
                                                    )
                                                 ),
                                                 Column(
                                                    crossAxisAlignment: CrossAxisAlignment.end,
                                                    children: [
                                                       if (isNow)
                                                          Container(
                                                             padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                             decoration: BoxDecoration(color: AppTheme.primaryBlue.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.primaryBlue.withValues(alpha: 0.5))),
                                                             child: Row(
                                                                children: [
                                                                   Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppTheme.primaryBlue, shape: BoxShape.circle)),
                                                                   const SizedBox(width: 6),
                                                                   const Text('LIVE NOW', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppTheme.primaryBlue, letterSpacing: 1.2)),
                                                                ]
                                                             )
                                                          )
                                                       else if (isFin)
                                                          Container(
                                                             padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                             decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: colors.borderSubtle)),
                                                             child: Text('✓ FINISHED', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: colors.textSecondary, letterSpacing: 1.2))
                                                          )
                                                       else ...[
                                                          Text(_formatTime(e['start_time']).split(' ')[0], style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: colors.textPrimary)),
                                                          Text(_formatTime(e['start_time']).split(' ')[1], style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 2)),
                                                       ],
                                                       if (e['is_quiz'] == true || e['is_quiz'] == 1)
                                                         Padding(
                                                           padding: const EdgeInsets.only(top: 8),
                                                           child: Container(
                                                             padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                             decoration: BoxDecoration(
                                                               color: Colors.amber.withValues(alpha: 0.15),
                                                               borderRadius: BorderRadius.circular(12),
                                                               border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
                                                             ),
                                                             child: const Row(
                                                               mainAxisSize: MainAxisSize.min,
                                                               children: [
                                                                 Icon(LucideIcons.clipboardList, size: 12, color: Colors.amber),
                                                                 SizedBox(width: 4),
                                                                 Text('QUIZ', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.amber, letterSpacing: 1.2)),
                                                               ],
                                                             ),
                                                           ),
                                                         ),
                                                    ]
                                                 )
                                              ]
                                           ),
                                           
                                           const SizedBox(height: 16),
                                           Container(height: 1, color: colors.divider),
                                           const SizedBox(height: 16),

                                           Row(
                                              children: [
                                                 if (e['instructor'] != null) ...[
                                                    Icon(LucideIcons.user, size: 14, color: AppTheme.primaryBlue),
                                                    const SizedBox(width: 4),
                                                    Text(e['instructor'], style: TextStyle(fontSize: 12, color: colors.textSecondary, fontWeight: FontWeight.bold)),
                                                    const SizedBox(width: 16),
                                                 ],
                                                 if (e['location'] != null) ...[
                                                    Icon(LucideIcons.mapPin, size: 14, color: Colors.orangeAccent),
                                                    const SizedBox(width: 4),
                                                    Text(e['location'], style: TextStyle(fontSize: 12, color: colors.textSecondary, fontWeight: FontWeight.bold)),
                                                 ]
                                              ],
                                           )
                                        ],
                                     )
                                  )
                               )
                            );
                         }
                     )
             )
              ] else ...[
                 Expanded(
                    child: dp.isLoadingTimetable
                      ? const Center(child: CircularProgressIndicator())
                      : dp.exams.isEmpty
                         ? Center(
                             child: GlassContainer(
                                backgroundColor: colors.surfaceLight,
                                child: Column(
                                   mainAxisSize: MainAxisSize.min,
                                   children: [
                                      Icon(LucideIcons.clipboardList, size: 48, color: colors.textHint),
                                      const SizedBox(height: 16),
                                      Text('No Exams Scheduled', style: TextStyle(fontSize: 18, color: colors.textSecondary, fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 4),
                                      Text('Check back later for updates', style: TextStyle(color: colors.textHint))
                                   ],
                                )
                             )
                         )
                         : ListView.builder(
                             physics: const BouncingScrollPhysics(),
                             padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                             itemCount: dp.exams.length,
                             itemBuilder: (context, index) {
                                final exam = dp.exams[index];
                                final isPractical = exam['exam_type'] == 'Practical';
                                final typeColor = isPractical ? Colors.orangeAccent : Colors.redAccent;
                                
                                DateTime examDate = DateTime.parse(exam['exam_date']);
                                String dayName = _days[examDate.weekday == 7 ? 0 : examDate.weekday]['id']!;
                                String dateStr = "${examDate.year}-${examDate.month.toString().padLeft(2, '0')}-${examDate.day.toString().padLeft(2, '0')}";
                                
                                return Padding(
                                   padding: const EdgeInsets.only(bottom: 16),
                                   child: GlassContainer(
                                      backgroundColor: colors.surfaceLight,
                                      child: Column(
                                         crossAxisAlignment: CrossAxisAlignment.start,
                                         children: [
                                            Container(
                                               padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                               decoration: BoxDecoration(color: typeColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)),
                                               child: Text((exam['exam_type'] ?? '').toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: typeColor, letterSpacing: 1.5)),
                                            ),
                                            const SizedBox(height: 12),
                                            GradientText(exam['course_name'] ?? '', fontSize: 24),
                                            const SizedBox(height: 16),
                                            Container(height: 1, color: colors.divider),
                                            const SizedBox(height: 16),
                                            Row(
                                               children: [
                                                  Icon(LucideIcons.calendar, size: 14, color: AppTheme.primaryBlue),
                                                  const SizedBox(width: 8),
                                                  Column(
                                                     crossAxisAlignment: CrossAxisAlignment.start,
                                                     children: [
                                                        Text('DAY & DATE', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.5)),
                                                        Text('$dayName, $dateStr', style: TextStyle(fontSize: 12, color: colors.textPrimary, fontWeight: FontWeight.bold)),
                                                     ],
                                                  ),
                                                  const SizedBox(width: 24),
                                                  Icon(LucideIcons.coffee, size: 14, color: AppTheme.primaryBlue),
                                                  const SizedBox(width: 8),
                                                  Column(
                                                     crossAxisAlignment: CrossAxisAlignment.start,
                                                     children: [
                                                        Text('TIME', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.5)),
                                                        Text('${_formatTime(exam['start_time'])} - ${_formatTime(exam['end_time'])}', style: TextStyle(fontSize: 12, color: colors.textPrimary, fontWeight: FontWeight.bold)),
                                                     ],
                                                  ),
                                               ],
                                            )
                                         ],
                                      )
                                   )
                                );
                             }
                         )
                 )
              ]
           ],
        )
      )
    );
  }

  Widget _buildModeBtn(String text, String mode, bool isActive, AppColors colors, {bool disabled = false, VoidCallback? onTap}) {
     return GestureDetector(
        onTap: onTap ?? () { if (!disabled) setState(() => _viewMode = mode); },
        child: AnimatedContainer(
           duration: const Duration(milliseconds: 200),
           alignment: Alignment.center,
           padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
           decoration: BoxDecoration(color: isActive ? AppTheme.primaryBlue : Colors.transparent, borderRadius: BorderRadius.circular(24)),
           child: Text(text.toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: isActive ? Colors.black : (disabled ? colors.textHint : colors.textSecondary), letterSpacing: 1.2))
        )
     );
  }
}
