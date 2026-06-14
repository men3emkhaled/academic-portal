import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';
import 'package:lucide_icons_flutter/lucide_icons.dart';
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
import 'package:qr_flutter/qr_flutter.dart';
import '../services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  bool _isProfileRevealed = false;

  void _showIDCardModal(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final colors = Theme.of(context).extension<AppColors>()!;
    final student = auth.student;
    if (student == null) return;

    final avatarUrl = student['avatar_url']?.toString() ?? '';
    final name = student['name']?.toString() ?? '';
    final studentId = student['id']?.toString() ?? '';
    final level = student['level']?.toString() ?? '';
    final section = student['section']?.toString() ?? '';
    final department = student['department_name']?.toString() ?? 'Artificial Intelligence';

    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: GlassContainer(
          backgroundColor: colors.card,
          borderColor: AppTheme.primaryBlue.withValues(alpha: 0.4),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'ZAGAZIG NATIONAL UNIVERSITY',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: colors.textPrimary,
                      letterSpacing: 1,
                    ),
                  ),
                  const Icon(LucideIcons.shieldCheck, color: AppTheme.primaryBlue, size: 16),
                ],
              ),
              const SizedBox(height: 4),
              const Divider(color: AppTheme.primaryBlue, thickness: 1),
              const SizedBox(height: 16),
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: colors.borderSubtle, width: 2),
                  image: avatarUrl.isNotEmpty
                      ? DecorationImage(image: NetworkImage(avatarUrl), fit: BoxFit.cover)
                      : null,
                ),
                child: avatarUrl.isEmpty
                    ? Icon(LucideIcons.user, size: 50, color: colors.textSecondary)
                    : null,
              ),
              const SizedBox(height: 16),
              Text(
                name,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: colors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'ZNU-$studentId',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryBlue,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: _buildModalInfoBox('LEVEL', level, colors),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildModalInfoBox('SECTION', section, colors),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: colors.surfaceLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: colors.borderSubtle),
                ),
                child: Column(
                  children: [
                    Text(
                      'DEPARTMENT',
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: colors.textHint,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      department,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: colors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: QrImageView(
                  data: 'ZNU-$studentId',
                  version: QrVersions.auto,
                  size: 100.0,
                  eyeStyle: const QrEyeStyle(
                    eyeShape: QrEyeShape.square,
                    color: Colors.black,
                  ),
                  dataModuleStyle: const QrDataModuleStyle(
                    dataModuleShape: QrDataModuleShape.square,
                    color: Colors.black,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: () => Navigator.pop(ctx),
                child: Text(
                  'CLOSE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: colors.textSecondary,
                    letterSpacing: 2,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModalInfoBox(String label, String value, AppColors colors) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: colors.surfaceLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.borderSubtle),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 8,
              fontWeight: FontWeight.bold,
              color: colors.textHint,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              color: colors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

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
                Stack(
                  children: [
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
                            Positioned(
                              top: 0,
                              right: 0,
                              child: GestureDetector(
                                onTap: () => _showIDCardModal(context),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFF8B5CF6), Color(0xFFD4A3FF)],
                                    ),
                                    borderRadius: BorderRadius.circular(16),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF8B5CF6).withValues(alpha: 0.4),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(LucideIcons.creditCard, size: 14, color: Colors.black),
                                      SizedBox(width: 6),
                                      Text(
                                        'ID Card',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w900,
                                          color: Colors.black,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ],
                                  ),
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
                    if (!_isProfileRevealed)
                      Positioned.fill(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(32),
                          child: BackdropFilter(
                            filter: ImageFilter.blur(sigmaX: 16.0, sigmaY: 16.0),
                            child: Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: colors.isDark
                                      ? [
                                          const Color(0xFF130F26).withValues(alpha: 0.88),
                                          const Color(0xFF23123A).withValues(alpha: 0.88),
                                        ]
                                      : [
                                          const Color(0xFFF5F0FF).withValues(alpha: 0.88),
                                          const Color(0xFFFAF0FF).withValues(alpha: 0.88),
                                        ],
                                ),
                                borderRadius: BorderRadius.circular(32),
                                border: Border.all(
                                  color: const Color(0xFF8B5CF6).withValues(alpha: colors.isDark ? 0.35 : 0.5),
                                  width: 1.5,
                                ),
                              ),
                              child: LayoutBuilder(
                                builder: (context, constraints) {
                                  final h = constraints.maxHeight;
                                  final w = constraints.maxWidth;
                                  // Scale everything based on available height
                                  final iconPad = (h * 0.07).clamp(6.0, 14.0);
                                  final iconSize = (h * 0.1).clamp(14.0, 22.0);
                                  final gap1 = (h * 0.05).clamp(2.0, 10.0);
                                  final gap2 = (h * 0.03).clamp(2.0, 6.0);
                                  final gap3 = (h * 0.08).clamp(6.0, 18.0);
                                  final sliderW = (w * 0.7).clamp(160.0, 260.0);
                                  final titleFontSize = (h * 0.06).clamp(8.0, 11.0);
                                  final subtitleFontSize = (h * 0.07).clamp(9.0, 12.0);
                                  return Stack(
                                    children: [
                                      Positioned(
                                        top: -40,
                                        left: -40,
                                        child: Container(
                                          width: 120,
                                          height: 120,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: const Color(0xFF8B5CF6).withValues(alpha: 0.12),
                                          ),
                                        ),
                                      ),
                                      Positioned(
                                        bottom: -40,
                                        right: -40,
                                        child: Container(
                                          width: 120,
                                          height: 120,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: const Color(0xFFD4A3FF).withValues(alpha: 0.12),
                                          ),
                                        ),
                                      ),
                                      Center(
                                        child: Padding(
                                          padding: EdgeInsets.symmetric(horizontal: 24, vertical: gap1),
                                          child: Column(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Container(
                                                padding: EdgeInsets.all(iconPad),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                                                  shape: BoxShape.circle,
                                                  border: Border.all(
                                                    color: const Color(0xFF8B5CF6).withValues(alpha: 0.3),
                                                    width: 1.0,
                                                  ),
                                                ),
                                                child: Icon(
                                                  LucideIcons.lock,
                                                  size: iconSize,
                                                  color: colors.isDark ? const Color(0xFFD4A3FF) : const Color(0xFF8B5CF6),
                                                ),
                                              ),
                                              SizedBox(height: gap1),
                                              Text(
                                                tr(context, 'secure_profile_title'),
                                                style: TextStyle(
                                                  fontSize: titleFontSize,
                                                  fontWeight: FontWeight.w900,
                                                  letterSpacing: 2.0,
                                                  color: colors.isDark ? const Color(0xFFE9D5FF) : const Color(0xFF6B21A8),
                                                ),
                                              ),
                                              SizedBox(height: gap2),
                                              Text(
                                                tr(context, 'secure_profile_subtitle'),
                                                style: TextStyle(
                                                  fontSize: subtitleFontSize,
                                                  color: colors.textSecondary.withValues(alpha: 0.8),
                                                ),
                                                textAlign: TextAlign.center,
                                              ),
                                              SizedBox(height: gap3),
                                              SwipeToOpenButton(
                                                width: sliderW,
                                                text: tr(context, 'swipe_unlock_profile'),
                                                arText: tr(context, 'swipe_unlock_profile'),
                                                onSwipe: () {
                                                  setState(() {
                                                    _isProfileRevealed = true;
                                                  });
                                                },
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),

                const SizedBox(height: 40),

                // --- PENDING TASKS COUNTER CARD ---
                Builder(
                  builder: (context) {
                    final totalPending = pendingOfficialTasks.length + pendingPersonalTasks.length;
                    return GestureDetector(
                      onTap: () {
                        TabSwitchNotification(7).dispatch(context); // Switch to Tasks tab
                      },
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(28),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2CFC7D),
                          borderRadius: BorderRadius.circular(28),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF2CFC7D).withValues(alpha: 0.3),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            )
                          ],
                        ),
                        child: Stack(
                          children: [
                            Positioned(
                              right: -20,
                              bottom: -20,
                              child: Icon(
                                LucideIcons.checkCircle2,
                                size: 100,
                                color: Colors.black.withValues(alpha: 0.08),
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text(
                                      'PENDING TASKS',
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w900,
                                        color: Colors.black,
                                        fontStyle: FontStyle.italic,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: Colors.black,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Row(
                                        children: [
                                          Text(
                                            'VIEW ALL',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w900,
                                              color: Color(0xFF2CFC7D),
                                            ),
                                          ),
                                          SizedBox(width: 4),
                                          Icon(
                                            LucideIcons.chevronRight,
                                            size: 10,
                                            color: Color(0xFF2CFC7D),
                                          )
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  '$totalPending',
                                  style: const TextStyle(
                                    fontSize: 64,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.black,
                                    height: 1,
                                  ),
                                ),
                              ],
                            )
                          ],
                        ),
                      ),
                    );
                  }
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

                // --- QUICK ACTIONS ROW ---
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StudyTimerScreen())),
                        child: Container(
                          height: 120,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Color(0xFF7C3AED), Color(0xFFA855F7)],
                            ),
                            borderRadius: BorderRadius.circular(28),
                            boxShadow: [BoxShadow(color: Color(0x667C3AED), blurRadius: 20, offset: Offset(0, 8))],
                          ),
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Positioned(
                                right: -16, bottom: -16,
                                child: Container(
                                  width: 80, height: 80,
                                  decoration: BoxDecoration(color: Color(0x157C3AED), shape: BoxShape.circle),
                                ),
                              ),
                              Positioned(
                                right: 16, bottom: 16,
                                child: Container(
                                  width: 48, height: 48,
                                  decoration: BoxDecoration(color: Color(0x26FFFFFF), shape: BoxShape.circle),
                                  child: const Icon(LucideIcons.timer, color: Colors.white, size: 22),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(20),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: const [
                                    Text('STUDY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white70, letterSpacing: 2)),
                                    SizedBox(height: 4),
                                    Text('Timer', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const QuranPrayerScreen())),
                        child: Container(
                          height: 120,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Color(0xFF0F766E), Color(0xFF14B8A6)],
                            ),
                            borderRadius: BorderRadius.circular(28),
                            boxShadow: [BoxShadow(color: Color(0x660F766E), blurRadius: 20, offset: Offset(0, 8))],
                          ),
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Positioned(
                                right: -16, bottom: -16,
                                child: Container(
                                  width: 80, height: 80,
                                  decoration: BoxDecoration(color: Color(0x150F766E), shape: BoxShape.circle),
                                ),
                              ),
                              Positioned(
                                right: 16, bottom: 16,
                                child: Container(
                                  width: 48, height: 48,
                                  decoration: BoxDecoration(color: Color(0x26FFFFFF), shape: BoxShape.circle),
                                  child: const Icon(LucideIcons.bookOpen, color: Colors.white, size: 22),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(20),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: const [
                                    Text('QURAN &', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white70, letterSpacing: 2)),
                                    SizedBox(height: 4),
                                    Text('Prayer', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

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

class SwipeToOpenButton extends StatefulWidget {
  final VoidCallback onSwipe;
  final String? text;
  final String? arText;
  final double width;
  const SwipeToOpenButton({
    super.key,
    required this.onSwipe,
    this.text,
    this.arText,
    this.width = 155.0,
  });

  @override
  State<SwipeToOpenButton> createState() => _SwipeToOpenButtonState();
}

class _SwipeToOpenButtonState extends State<SwipeToOpenButton> with SingleTickerProviderStateMixin {
  double _dragPosition = 0.0;
  late AnimationController _controller;
  bool _isFinished = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final text = isRtl ? (widget.arText ?? 'اسحب للفتح') : (widget.text ?? 'Swipe to open');
    final double maxDrag = widget.width - 4.0 - 38.0;

    return Container(
      width: widget.width,
      height: 44,
      decoration: BoxDecoration(
        color: const Color(0xFF8B5CF6).withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: const Color(0xFF8B5CF6).withValues(alpha: 0.35),
          width: 1.5,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Background text
            AnimatedOpacity(
              duration: const Duration(milliseconds: 150),
              opacity: (1.0 - (_dragPosition / maxDrag)).clamp(0.0, 1.0),
              child: Padding(
                padding: EdgeInsets.only(
                  left: isRtl ? 0 : 36.0,
                  right: isRtl ? 36.0 : 0,
                ),
                child: Text(
                  text,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFFD4A3FF),
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),

            // Slider thumb
            Positioned(
              left: isRtl ? null : _dragPosition + 2,
              right: isRtl ? _dragPosition + 2 : null,
              top: 2,
              bottom: 2,
              child: GestureDetector(
                onHorizontalDragUpdate: (details) {
                  if (_isFinished) return;
                  setState(() {
                    final delta = isRtl ? -details.delta.dx : details.delta.dx;
                    _dragPosition += delta;
                    if (_dragPosition < 0) _dragPosition = 0;
                    if (_dragPosition > maxDrag) _dragPosition = maxDrag;
                  });
                },
                onHorizontalDragEnd: (details) {
                  if (_isFinished) return;
                  if (_dragPosition >= maxDrag) {
                    HapticFeedback.mediumImpact();
                    widget.onSwipe();
                    setState(() {
                      _isFinished = true;
                    });
                    // Reset position after short delay so it can be swiped again if dialog is closed
                    Future.delayed(const Duration(milliseconds: 500), () {
                      if (mounted) {
                        setState(() {
                          _dragPosition = 0.0;
                          _isFinished = false;
                        });
                      }
                    });
                  } else {
                    // Animate back to start
                    final double start = _dragPosition;
                    _controller.reset();
                    final Animation<double> animation = Tween<double>(begin: start, end: 0.0).animate(
                      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
                    );
                    animation.addListener(() {
                      setState(() {
                        _dragPosition = animation.value;
                      });
                    });
                    _controller.forward();
                  }
                },
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF8B5CF6), Color(0xFFD4A3FF)],
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF8B5CF6).withValues(alpha: 0.45),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      LucideIcons.lock,
                      size: 16,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
