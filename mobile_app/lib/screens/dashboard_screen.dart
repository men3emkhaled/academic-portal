import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../theme.dart';
import '../l10n/tr.dart';
import 'ui_helpers.dart';
import 'study_timer_screen.dart';
import 'quran_prayer_screen.dart';
import 'course_hub_screen.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();

  Future<void> _toggleOfficialTask(dynamic task, bool isComplete) async {
    try {
      await _apiService.dio.patch('/official-tasks/${task['id']}/toggle', data: {
        'is_completed': !isComplete
      });
      if (mounted) {
         context.read<DataProvider>().fetchExtraModules();
         ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(!isComplete ? 'Task completed!' : 'Marked as incomplete')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to update task')));
    }
  }

  double _parseScore(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }



  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final dataProvider = context.watch<DataProvider>();
    final colors = Theme.of(context).extension<AppColors>()!;
    
    final List<dynamic> pendingOfficialTasks = dataProvider.officialTasks.where((t) => t['is_completed'] == 0 || t['is_completed'] == false).toList();
    final List<dynamic> pendingPersonalTasks = dataProvider.tasks.where((t) => t['is_completed'] == 0 || t['is_completed'] == false).toList();

    // Select most recent 3 notifications precisely as React did
    final DateTime threeDaysAgo = DateTime.now().subtract(const Duration(days: 3));
    final List<dynamic> recentNotifs = dataProvider.notifications.where((n) {
      final dt = DateTime.parse(n['created_at']);
      return dt.isAfter(threeDaysAgo);
    }).take(3).toList();

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
                // --- PROFILE HERO SECTION ---
                ClipRRect(
                  borderRadius: BorderRadius.circular(32),
                  child: Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                       color: colors.isDark ? const Color(0xFF111111) : Colors.white,
                       border: Border.all(color: colors.isDark ? Colors.white.withValues(alpha: 0.1) : const Color(0xFFE2E8F0)),
                       borderRadius: BorderRadius.circular(32),
                       boxShadow: colors.isDark
                         ? [const BoxShadow(color: Color(0x66000000), blurRadius: 40, offset: Offset(0, 12))]
                         : [const BoxShadow(color: Color(0x08000000), blurRadius: 4, offset: Offset(0, 1))],
                    ),
                    child: Stack(
                      children: [
                        Positioned(
                          top: -96, right: -96,
                          child: Container(
                             width: 256, height: 256,
                             decoration: BoxDecoration(
                               color: AppTheme.primaryBlue.withValues(alpha: 0.1),
                               shape: BoxShape.circle,
                             ),
                          ),
                        ),
                        Column(
                           crossAxisAlignment: CrossAxisAlignment.start,
                           children: [
                              Text(tr(context, 'student_profile'), style: TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 3.2)),
                              const SizedBox(height: 8),
                              GradientText(auth.studentName ?? '', fontSize: 30),
                              const SizedBox(height: 16),
                              Wrap(
                                spacing: 16, runSpacing: 12,
                                children: [
                                  _buildPill(LucideIcons.graduationCap, 'ID: ${auth.studentId ?? ''}', colors),
                                  _buildPill(LucideIcons.layers, '${tr(context, 'level_label')}: ${auth.studentLevel ?? ''}', colors),
                                  _buildPill(LucideIcons.users, '${tr(context, 'section_label')}: ${auth.studentSection ?? tr(context, 'not_assigned')}', colors, highlight: true),
                                 ],
                              ),
                           ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 40),

                // --- RECENT NOTIFICATIONS ---
                if (recentNotifs.isNotEmpty) ...[
                  Row(
                    children: [
                      Container(width: 3, height: 32, decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(99))),
                      const SizedBox(width: 12),
                      Expanded(child: Text(tr(context, 'recent_notifications'), style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: colors.textPrimary), overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  ...recentNotifs.map((n) {
                      final isRead = n['is_read'] == 1 || n['is_read'] == true;
                      Color color = AppTheme.primaryBlue;
                      IconData ico = LucideIcons.info;
                      String category = 'Info';
                      
                      final tL = (n['title'] ?? '').toString().toLowerCase();
                      final cL = (n['content'] ?? n['message'] ?? '').toString().toLowerCase();
                      
                      if (tL.contains('contest') || cL.contains('contest')) { color = Colors.yellowAccent; ico = LucideIcons.trophy; category = 'Event'; }
                      else if (tL.contains('grade') || cL.contains('grade')) { color = Colors.purpleAccent; ico = LucideIcons.trendingUp; category = 'Grades'; }
                      else if (tL.contains('security') || tL.contains('login') || cL.contains('login')) { color = Colors.orangeAccent; ico = LucideIcons.shieldCheck; category = 'Security'; }

                      return ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                             color: isRead ? (colors.isDark ? const Color(0x800D0D0D) : const Color(0xFFF9FAFB)) : (colors.isDark ? const Color(0xFF111111) : Colors.white),
                             borderRadius: BorderRadius.circular(24),
                             border: Border.all(color: isRead ? (colors.isDark ? Colors.white.withValues(alpha: 0.05) : const Color(0xFFE2E8F0)) : color.withValues(alpha: 0.2)),
                             boxShadow: isRead ? [] : [
                                BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 30, offset: const Offset(0, 8))
                             ]
                          ),
                          child: Stack(
                            children: [
                              if (!isRead)
                                Positioned(left: 0, top: 0, bottom: 0, child: Container(
                                  width: 4,
                                  decoration: BoxDecoration(
                                    color: color,
                                    borderRadius: const BorderRadius.only(topLeft: Radius.circular(24), bottomLeft: Radius.circular(24)),
                                    boxShadow: [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 12)],
                                  ),
                                )),
                              Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(24),
                              onTap: () async {
                                 if (!isRead) await context.read<DataProvider>().markNotificationAsRead(n['id']);
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(24),
                                child: Row(
                                   crossAxisAlignment: CrossAxisAlignment.start,
                                   children: [
                                      Container(
                                         width: 40, height: 40,
                                         decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
                                         child: Icon(ico, color: color, size: 20),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                         child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                               Text(n['title'] ?? '', style: TextStyle(fontWeight: isRead ? FontWeight.bold : FontWeight.w800, fontSize: 16, color: isRead ? colors.textSecondary : colors.textPrimary)),
                                               const SizedBox(height: 4),
                                               Text(category.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: color)),
                                               const SizedBox(height: 8),
                                               RenderContent(text: n['content'] ?? n['message'] ?? '', textStyle: TextStyle(color: colors.textSecondary, fontSize: 14, height: 1.5)),
                                               if (!isRead)
                                                  Align(
                                                    alignment: Alignment.centerRight,
                                                    child: GestureDetector(
                                                      onTap: () async { await context.read<DataProvider>().markNotificationAsRead(n['id']); },
                                                      child: Container(
                                                        margin: const EdgeInsets.only(top: 8),
                                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                        decoration: BoxDecoration(
                                                          color: AppTheme.primaryBlue.withValues(alpha: 0.1),
                                                          borderRadius: BorderRadius.circular(99),
                                                        ),
                                                        child: Text(tr(context, 'mark_as_read').toUpperCase(), style: TextStyle(color: AppTheme.primaryBlue.withValues(alpha: 0.8), fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.5)),
                                                      ),
                                                    ),
                                                  )
                                            ],
                                         )
                                      ),
                                      if (!isRead) Container(margin: const EdgeInsets.only(top: 8, left: 8), width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle, boxShadow: [BoxShadow(color: color.withValues(alpha: 0.5), blurRadius: 6)]))
                                   ],
                                )
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
                  const SizedBox(height: 40),
               ],

                // --- PENDING TASKS SECTION ---
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(width: 3, height: 32, decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(99))),
                        const SizedBox(width: 12),
                        Text('Pending Tasks', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: colors.textPrimary)),
                      ],
                    ),
                    TextButton(
                      onPressed: () {}, // Navigate to personal tasks if needed
                      child: Row(
                        children: [
                          Text('VIEW ALL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: colors.textSecondary)),
                          Icon(LucideIcons.chevronRight, size: 14, color: colors.textSecondary)
                        ],
                      ),
                    )
                  ],
                ),
                const SizedBox(height: 24),
                if (pendingOfficialTasks.isEmpty && pendingPersonalTasks.isEmpty)
                   Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(24), border: Border.all(color: colors.borderSubtle)),
                      child: Center(child: Text("No pending tasks found.", style: TextStyle(color: colors.textSecondary)))
                   )
                else ...[
                   ...pendingOfficialTasks.take(2).map((task) {
                      return Container(
                         margin: const EdgeInsets.only(bottom: 16),
                         padding: const EdgeInsets.all(20),
                         decoration: BoxDecoration(
                            color: colors.isDark ? const Color(0xFF111111) : Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: colors.borderSubtle),
                            boxShadow: colors.isDark ? [] : [const BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2))]
                         ),
                         child: Row(
                            children: [
                               GestureDetector(
                                  onTap: () => _toggleOfficialTask(task, false),
                                  child: Container(
                                     width: 28, height: 28,
                                     decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: colors.textHint, width: 2)),
                                  ),
                               ),
                               const SizedBox(width: 16),
                               Expanded(
                                  child: Column(
                                     crossAxisAlignment: CrossAxisAlignment.start,
                                     children: [
                                        Row(
                                           children: [
                                              Container(
                                                 padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                 decoration: BoxDecoration(color: AppTheme.primaryBlue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                                                 child: Text(task['course_name'] ?? 'Task', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.primaryBlue)),
                                              ),
                                              const SizedBox(width: 12),
                                              Text('OFFICIAL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.2)),
                                           ]
                                        ),
                                        const SizedBox(height: 8),
                                        Text(task['title'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: colors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                                     ],
                                  ),
                               ),
                               if (task['drive_link'] != null)
                                  IconButton(
                                     icon: Icon(LucideIcons.externalLink, size: 20, color: colors.textSecondary),
                                     onPressed: () => launchUrl(Uri.parse(task['drive_link'])),
                                  )
                            ]
                         )
                      );
                   }),
                   ...pendingPersonalTasks.take(2).map((task) {
                      return Container(
                         margin: const EdgeInsets.only(bottom: 16),
                         padding: const EdgeInsets.all(20),
                         decoration: BoxDecoration(
                            color: colors.isDark ? const Color(0xFF111111) : Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: colors.borderSubtle),
                            boxShadow: colors.isDark ? [] : [const BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2))]
                         ),
                         child: Row(
                            children: [
                               Container(
                                  width: 28, height: 28,
                                  decoration: BoxDecoration(color: colors.surfaceLight, shape: BoxShape.circle),
                                  child: Icon(LucideIcons.shieldCheck, size: 14, color: colors.textSecondary),
                               ),
                               const SizedBox(width: 16),
                               Expanded(
                                  child: Column(
                                     crossAxisAlignment: CrossAxisAlignment.start,
                                     children: [
                                        Text('PERSONAL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.2)),
                                        const SizedBox(height: 4),
                                        Text(task['title'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: colors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                                     ],
                                  ),
                               ),
                               Icon(LucideIcons.chevronRight, size: 20, color: colors.textSecondary)
                            ]
                         )
                      );
                   }),
                ],

               // --- MY COURSES SECTION ---
               const SizedBox(height: 40),
               Row(
                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
                 children: [
                   Row(
                     children: [
                       Container(width: 3, height: 32, decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(99))),
                       const SizedBox(width: 12),
                       Text('My Courses', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: colors.textPrimary)),
                     ],
                   ),
                   Text('${dataProvider.grades.length} COURSES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: colors.textSecondary)),
                 ],
               ),
               const SizedBox(height: 24),
               if (dataProvider.grades.isEmpty)
                   Container(
                      padding: const EdgeInsets.all(40),
                      decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(24), border: Border.all(color: colors.borderSubtle)),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(LucideIcons.bookOpen, size: 40, color: colors.textSecondary.withValues(alpha: 0.3)),
                            const SizedBox(height: 16),
                            Text("No enrolled courses found.", style: TextStyle(color: colors.textSecondary, fontWeight: FontWeight.bold, fontSize: 15)),
                          ],
                        ),
                      )
                   )
               else
                   ...dataProvider.grades.asMap().entries.map((entry) {
                       final idx = entry.key;
                       final grade = entry.value;
                       
                       // Emulate React's color cycle
                       final gradientColors = [
                          [const Color(0xFF34D399), const Color(0xFF14B8A6)], // emerald to teal
                          [const Color(0xFF60A5FA), const Color(0xFF6366F1)], // blue to indigo
                          [const Color(0xFFA78BFA), const Color(0xFFA855F7)], // violet to purple
                          [const Color(0xFFFBBF24), const Color(0xFFF97316)], // amber to orange
                          [const Color(0xFFFB7185), const Color(0xFFEC4899)], // rose to pink
                          [const Color(0xFF22D3EE), const Color(0xFF0EA5E9)], // cyan to sky
                       ];
                       final c = gradientColors[idx % gradientColors.length];

                       final total = _parseScore(grade['midterm_score']) + _parseScore(grade['practical_score']) + _parseScore(grade['oral_score']);
                       final maxScore = _parseScore(grade['max_score']);
                       final maxS = maxScore == 0 ? 100.0 : maxScore;
                       final percentage = (total / maxS).clamp(0.0, 1.0);
                       final hasScores = grade['midterm_score'] != null || grade['practical_score'] != null || grade['oral_score'] != null;

                       return Container(
                          margin: const EdgeInsets.only(bottom: 20),
                          decoration: BoxDecoration(
                             color: colors.isDark ? const Color(0xFF111111) : Colors.white,
                             borderRadius: BorderRadius.circular(32),
                             border: Border.all(color: colors.borderSubtle),
                             boxShadow: colors.isDark ? [] : [const BoxShadow(color: Color(0x0A000000), blurRadius: 12, offset: Offset(0, 4))]
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(32),
                              onTap: () {
                                 Navigator.push(context, MaterialPageRoute(builder: (_) => CourseHubScreen(course: grade)));
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(28),
                                child: Stack(
                                   clipBehavior: Clip.none,
                                   children: [
                                      Positioned(
                                         right: -10, top: -10,
                                         child: Container(width: 80, height: 80, decoration: BoxDecoration(color: c[0].withValues(alpha: 0.1), shape: BoxShape.circle))
                                      ),
                                      Column(
                                         crossAxisAlignment: CrossAxisAlignment.start,
                                         children: [
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Container(
                                                   width: 56, height: 56,
                                                   decoration: BoxDecoration(color: c[0].withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
                                                   child: Icon(LucideIcons.bookOpen, color: c[0], size: 24),
                                                ),
                                                Container(
                                                   width: 36, height: 36,
                                                   decoration: BoxDecoration(color: colors.surfaceLight, shape: BoxShape.circle),
                                                   child: Icon(LucideIcons.chevronRight, color: colors.textSecondary, size: 18),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 20),
                                            Text(grade['course_name'] ?? '', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20, color: colors.textPrimary)),
                                            const SizedBox(height: 20),
                                            
                                            if (hasScores) ...[
                                               Row(
                                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                  crossAxisAlignment: CrossAxisAlignment.end,
                                                  children: [
                                                     Column(
                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                        children: [
                                                           Text('CURRENT GRADE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.2)),
                                                           const SizedBox(height: 6),
                                                           RichText(text: TextSpan(
                                                              children: [
                                                                 TextSpan(text: total.toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), ''), style: TextStyle(fontWeight: FontWeight.w800, fontSize: 24, color: c[0])),
                                                                 TextSpan(text: ' / ${maxS.toStringAsFixed(0)}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: colors.textSecondary))
                                                              ]
                                                           ))
                                                        ],
                                                     ),
                                                     Container(
                                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                        decoration: BoxDecoration(color: c[0].withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                                                        child: Text('${(percentage * 100).toStringAsFixed(0)}%', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: c[0])),
                                                     )
                                                  ],
                                               ),
                                               const SizedBox(height: 16),
                                               Container(
                                                  height: 8, width: double.infinity,
                                                  decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(4)),
                                                  child: LayoutBuilder(
                                                     builder: (context, constraints) {
                                                        return Align(
                                                           alignment: Alignment.centerLeft,
                                                           child: AnimatedContainer(
                                                              duration: const Duration(milliseconds: 1000),
                                                              curve: Curves.easeOutCubic,
                                                              width: constraints.maxWidth * percentage,
                                                              decoration: BoxDecoration(
                                                                 gradient: LinearGradient(colors: c),
                                                                 borderRadius: BorderRadius.circular(4)
                                                              ),
                                                           ),
                                                        );
                                                     }
                                                  )
                                               )
                                            ] else ...[
                                               const SizedBox(height: 12),
                                               Container(height: 1, color: colors.divider),
                                               const SizedBox(height: 16),
                                               Row(
                                                  children: [
                                                     Icon(LucideIcons.info, size: 16, color: colors.textSecondary.withValues(alpha: 0.6)),
                                                     const SizedBox(width: 8),
                                                     Text('No scores posted yet', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: colors.textSecondary)),
                                                  ],
                                               )
                                            ]
                                         ],
                                      ),
                                   ]
                                )
                              )
                            )
                          ),
                       );
                    }),
                
                const SizedBox(height: 48),
                
                // --- MOBILE EXTRAS (Moved to bottom) ---
                Row(
                  children: [
                    Container(width: 3, height: 32, decoration: BoxDecoration(color: Colors.purpleAccent, borderRadius: BorderRadius.circular(99))),
                    const SizedBox(width: 12),
                    Expanded(child: Text('Mobile Extras', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: colors.textPrimary), overflow: TextOverflow.ellipsis)),
                  ],
                ),
                const SizedBox(height: 16),
                
                GestureDetector(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const StudyTimerScreen()),
                  ),
                  child: GlassContainer(
                    backgroundColor: colors.card,
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryBlue.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(LucideIcons.timer, color: AppTheme.primaryBlue, size: 24),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                tr(context, 'study_timer'),
                                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: colors.textPrimary),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                tr(context, 'study_timer_desc'),
                                style: TextStyle(fontSize: 12, color: colors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryBlue,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            tr(context, 'start_studying'),
                            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                GestureDetector(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const QuranPrayerScreen()),
                  ),
                  child: GlassContainer(
                    backgroundColor: colors.card,
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.purpleAccent.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(LucideIcons.bookOpen, color: Colors.purpleAccent, size: 24),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                tr(context, 'quran_and_prayer'),
                                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: colors.textPrimary),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                tr(context, 'quran_subtitle'),
                                style: TextStyle(fontSize: 12, color: colors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        Icon(LucideIcons.chevronRight, color: colors.textSecondary, size: 18),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                if (dataProvider.events.isNotEmpty)
                   SizedBox(
                     height: 180,
                     child: ListView.builder(
                       scrollDirection: Axis.horizontal,
                       itemCount: dataProvider.events.length,
                       itemBuilder: (context, index) {
                         final event = dataProvider.events[index];
                         final date = DateTime.parse(event['event_date']);
                         return Container(
                           width: 280,
                           margin: const EdgeInsets.only(right: 16),
                           child: GlassContainer(
                             backgroundColor: colors.card,
                             padding: const EdgeInsets.all(20),
                             child: Column(
                               crossAxisAlignment: CrossAxisAlignment.start,
                               children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                       Container(
                                         padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                         decoration: BoxDecoration(color: AppTheme.primaryBlue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                                         child: Text(event['category'] ?? 'Event', style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 10)),
                                       ),
                                       Icon(LucideIcons.calendar, color: colors.textSecondary, size: 16),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(event['title'] ?? '', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: colors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
                                  const Spacer(),
                                  Row(
                                    children: [
                                      Icon(LucideIcons.clock, color: Colors.purpleAccent, size: 14),
                                      const SizedBox(width: 6),
                                      Text('${date.day}/${date.month} - ${date.hour}:${date.minute.toString().padLeft(2, '0')}', style: TextStyle(color: colors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Icon(LucideIcons.mapPin, color: Colors.orangeAccent, size: 14),
                                      const SizedBox(width: 6),
                                      Expanded(child: Text(event['location'] ?? tr(context, 'event_location_tba'), style: TextStyle(color: colors.textSecondary, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                    ],
                                  ),
                               ],
                             ),
                           ),
                         );
                       },
                     ),
                   ),

                const SizedBox(height: 60) // Bottom padding for navbar
            ],
          ),
        )
      )
    );
  }

  Widget _buildPill(IconData i, String text, AppColors colors, {bool highlight = false}) {
     return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(20), border: Border.all(color: colors.borderSubtle)),
        child: Row(
           mainAxisSize: MainAxisSize.min,
           children: [
              Icon(i, size: 14, color: highlight ? colors.textPrimary : colors.textSecondary),
              const SizedBox(width: 6),
              Text(text, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: highlight ? colors.textPrimary : colors.textSecondary))
           ],
        )
     );
  }
}
