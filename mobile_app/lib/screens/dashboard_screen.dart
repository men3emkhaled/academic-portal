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

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {

  double _parseScore(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }

  Color _getGradeColor(dynamic score, dynamic max) {
      if (score == null) return Colors.grey;
      double sc = _parseScore(score);
      double m = _parseScore(max);
      if (m == 0.0) m = 100.0;
      double percentage = (sc / m) * 100;
      if (percentage >= 50) return Colors.greenAccent;
      return Colors.redAccent;
  }

  String _formatScore(dynamic score) {
      if (score == null) return '-';
      double val = _parseScore(score);
      return val.toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '');
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final dataProvider = context.watch<DataProvider>();
    final colors = Theme.of(context).extension<AppColors>()!;
    
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
                Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 500),
                    child: GlassContainer(
                      backgroundColor: colors.card,
                      borderRadius: 32,
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Positioned(
                            top: -80, right: -40,
                            child: Container(width: 160, height: 160, decoration: BoxDecoration(color: AppTheme.primaryBlue.withValues(alpha: 0.15), shape: BoxShape.circle))
                          ),
                          Column(
                             crossAxisAlignment: CrossAxisAlignment.start,
                             children: [
                                Text(tr(context, 'student_profile'), style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 2)),
                                const SizedBox(height: 8),
                                GradientText(context.read<AuthProvider>().studentName ?? '', fontSize: 28),
                                const SizedBox(height: 16),
                                Wrap(
                                  spacing: 8, runSpacing: 8,
                                  children: [
                                    _buildPill(LucideIcons.graduationCap, '${tr(context, 'id_label')}: ${context.read<AuthProvider>().studentId ?? ''}', colors),
                                    _buildPill(LucideIcons.layers, '${tr(context, 'level_label')}: ${context.read<AuthProvider>().studentLevel ?? ''}', colors),
                                    _buildPill(LucideIcons.users, '${tr(context, 'section_label')}: ${context.read<AuthProvider>().studentSection ?? tr(context, 'not_assigned')}', colors, highlight: true),
                                   ],
                                ),
                             ],
                          )
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // --- STUDY TIMER CARD ---
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
                                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: colors.textPrimary),
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

                // --- QURAN & PRAYER CARD ---
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
                                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: colors.textPrimary),
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

                const SizedBox(height: 24),

                // --- UPCOMING EVENTS ---
                Row(
                  children: [
                    Container(width: 6, height: 24, decoration: const BoxDecoration(color: Colors.purpleAccent, borderRadius: BorderRadius.all(Radius.circular(3)))),
                    const SizedBox(width: 12),
                    Expanded(child: Text(tr(context, 'upcoming_events'), style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: colors.textPrimary), overflow: TextOverflow.ellipsis)),
                  ],
                ),
                const SizedBox(height: 16),
                if (dataProvider.events.isEmpty)
                   GlassContainer(
                      backgroundColor: colors.card,
                      child: Center(child: Text(tr(context, 'no_upcoming_events'), style: TextStyle(color: colors.textSecondary, fontSize: 13)))
                   )
                else
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
                                  Text(event['title'] ?? '', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: colors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
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

                const SizedBox(height: 24),

                // --- RECENT NOTIFICATIONS ---
                if (recentNotifs.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Container(width: 6, height: 24, decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(3))),
                      const SizedBox(width: 12),
                      Expanded(child: Text(tr(context, 'recent_notifications'), style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: colors.textPrimary), overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ...recentNotifs.map((n) {
                      final isRead = n['is_read'] == 1 || n['is_read'] == true;
                      Color color = AppTheme.primaryBlue;
                      IconData ico = LucideIcons.info;
                      final tL = (n['title'] ?? '').toString().toLowerCase();
                      if (tL.contains('grade')) { color = Colors.purpleAccent; ico = LucideIcons.trendingUp; }
                      else if (tL.contains('security') || tL.contains('login')) { color = Colors.orangeAccent; ico = LucideIcons.shield; }
                      else if (tL.contains('contest')) { color = Colors.yellowAccent; ico = LucideIcons.trophy; }

                      return GestureDetector(
                        onTap: () async {
                           if (!isRead) {
                             await context.read<DataProvider>().markNotificationAsRead(n['id']);
                           }
                        },
                        child: GlassContainer(
                           backgroundColor: colors.card,
                           borderColor: isRead ? Colors.transparent : color.withValues(alpha: 0.3),
                           child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                 Container(
                                    width: 48, height: 48,
                                    decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(16)),
                                    child: Icon(ico, color: color),
                                 ),
                                 const SizedBox(width: 16),
                                 Expanded(
                                    child: Column(
                                       crossAxisAlignment: CrossAxisAlignment.start,
                                       children: [
                                          Text(n['title'] ?? '', style: TextStyle(fontWeight: isRead ? FontWeight.bold : FontWeight.w900, fontSize: 16, color: isRead ? colors.textSecondary : colors.textPrimary)),
                                          const SizedBox(height: 6),
                                          RenderContent(text: n['content'] ?? n['message'] ?? '', textStyle: TextStyle(color: colors.textSecondary, fontSize: 13, height: 1.4)),
                                       ],
                                    )
                                 ),
                                 if (!isRead) Container(margin: const EdgeInsets.only(top: 8, left: 8), width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle, boxShadow: [BoxShadow(color: color.withValues(alpha: 0.5), blurRadius: 6)]))
                              ],
                           )
                        ),
                      );
                  }),
               ],

               // --- YOUR GRADES MINI-VIEW ---
               const SizedBox(height: 24),
               Row(
                 children: [
                   Container(width: 6, height: 24, decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(3))),
                   const SizedBox(width: 12),
                   Expanded(child: Text(tr(context, 'grades'), style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: colors.textPrimary), overflow: TextOverflow.ellipsis)),
                 ],
               ),
               const SizedBox(height: 16),
               if (dataProvider.grades.isEmpty)
                   GlassContainer(
                      backgroundColor: colors.surfaceLight,
                      borderColor: colors.borderSubtle,
                      child: Center(child: Text("No enrolled courses found.", style: TextStyle(color: colors.textSecondary)))
                   )
               else
                   ...dataProvider.grades.map((grade) {
                      final total = _parseScore(grade['midterm_score']) + _parseScore(grade['practical_score']) + _parseScore(grade['oral_score']);
                      return GlassContainer(
                         backgroundColor: colors.card,
                         child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                               Text(grade['course_name'] ?? '', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: colors.textPrimary)),
                               const SizedBox(height: 4),
                               Text(tr(context, 'course'), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: colors.textSecondary)),
                               const SizedBox(height: 16),
                               Row(
                                 children: [
                                   _buildScoreBox(tr(context, 'midterm'), grade['midterm_score'], grade['midterm_max'], colors),
                                   const SizedBox(width: 8),
                                   _buildScoreBox(tr(context, 'practical'), grade['practical_score'], grade['practical_max'], colors),
                                   const SizedBox(width: 8),
                                   _buildScoreBox(tr(context, 'oral'), grade['oral_score'], grade['oral_max'], colors),
                                 ],
                               ),
                               const SizedBox(height: 16),
                               Container(height: 1, color: colors.divider),
                               const SizedBox(height: 12),
                               Row(
                                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                 children: [
                                    Text(tr(context, 'total'), style: TextStyle(color: colors.textSecondary, fontSize: 12)),
                                    RichText(text: TextSpan(
                                       children: [
                                          TextSpan(text: total.toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), ''), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.primaryBlue)),
                                          TextSpan(text: ' / ${grade['max_score']}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: colors.textSecondary))
                                       ]
                                    ))
                                 ],
                               )
                            ],
                         )
                      );
                   }),
               
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

  Widget _buildScoreBox(String lbl, dynamic sc, dynamic m, AppColors colors) {
     return Expanded(
       child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(color: colors.scoreBoxBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: colors.borderSubtle)),
          child: Column(
             children: [
                Text(lbl, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.2)),
                const SizedBox(height: 8),
                Text(_formatScore(sc), style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: _getGradeColor(sc, m)))
             ],
          )
       )
     );
  }
}
