import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/data_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../providers/locale_provider.dart';
import '../services/api_service.dart';
import '../theme.dart';
import 'ui_helpers.dart';
import 'quiz_screen.dart';
import 'quiz_result_screen.dart';

// --- QUIZZES TAB ---
class QuizzesTab extends StatefulWidget {
  const QuizzesTab({super.key});
  @override
  State<QuizzesTab> createState() => _QuizzesTabState();
}

class _QuizzesTabState extends State<QuizzesTab> {
  String _activeTab = 'available';
  String _searchTerm = '';
  bool _filterActive = false;

  void _startOrResume(dynamic quiz) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => QuizScreen(
          quizId: quiz['id'],
          resumeAttemptId: quiz['resume_attempt_id'],
        ),
      ),
    ).then((_) {
      if (mounted) context.read<DataProvider>().fetchExtraModules();
    });
  }

  void _viewResults(dynamic quiz) {
    if (quiz['attempt_id'] != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => QuizResultScreen(
            quizId: quiz['id'],
            attemptId: quiz['attempt_id'],
          ),
        ),
      );
    }
  }

  Map<String, dynamic> _getQuizAvailability(dynamic quiz) {
    final now = DateTime.now();
    final startDate = quiz['start_date'] != null
        ? DateTime.tryParse(quiz['start_date'])
        : null;
    final endDate = quiz['end_date'] != null
        ? DateTime.tryParse(quiz['end_date'])
        : null;
    final attemptsCount = quiz['attempts_count'] ?? 0;
    final maxAttempts = quiz['max_attempts'] ?? 1;

    if (quiz['is_published'] != null &&
        (quiz['is_published'] == 0 || quiz['is_published'] == false))
      return {'available': false, 'reason': 'Not published'};
    if (startDate != null && now.isBefore(startDate))
      return {
        'available': false,
        'reason': 'Starts ${startDate.toLocal().toString().split(' ')[0]}',
      };
    if (endDate != null && now.isAfter(endDate))
      return {'available': false, 'reason': 'Quiz has ended'};
    if (attemptsCount >= maxAttempts)
      return {'available': false, 'reason': 'No attempts left'};
    return {'available': true, 'reason': null};
  }

  double _parseScore(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }

  @override
  Widget build(BuildContext context) {
    final dataProvider = context.watch<DataProvider>();
    final colors = Theme.of(context).extension<AppColors>()!;
    if (dataProvider.isLoadingExtra) {
      return Scaffold(
        backgroundColor: colors.background,
        body: const Center(
          child: CircularProgressIndicator(color: AppTheme.primaryBlue),
        ),
      );
    }

    final quizzes = dataProvider.quizzes;
    final completedQuizzes = dataProvider.completedQuizzes;

    final filteredQuizzes = quizzes.where((q) {
      final String title = (q['title'] ?? '').toString().toLowerCase();
      final String course = (q['course_name'] ?? '').toString().toLowerCase();
      final matches =
          title.contains(_searchTerm.toLowerCase()) ||
          course.contains(_searchTerm.toLowerCase());

      if (!_filterActive) return matches;
      final att = q['attempts'] as List<dynamic>? ?? [];
      return matches && att.isEmpty;
    }).toList();

    final filteredCompleted = completedQuizzes.where((q) {
      return (q['quiz_title'] ?? '').toString().toLowerCase().contains(
            _searchTerm.toLowerCase(),
          ) ||
          (q['course_name'] ?? '').toString().toLowerCase().contains(
            _searchTerm.toLowerCase(),
          );
    }).toList();

    final completedCount = completedQuizzes.length;
    final pendingCount = quizzes
        .where((q) => (q['attempts'] as List<dynamic>? ?? []).isEmpty)
        .length;

    double avgScore = 0;
    if (completedQuizzes.isNotEmpty) {
      double sum = 0;
      int len = 0;
      for (var c in completedQuizzes) {
        sum += _parseScore(c['percentage']);
        len++;
      }
      if (len > 0) avgScore = sum / len;
    }

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: GradientText('My Quizzes', fontSize: 36),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  _buildTabBtn(
                    'Available (${quizzes.length})',
                    'available',
                    LucideIcons.helpCircle,
                    colors,
                  ),
                  const SizedBox(width: 12),
                  _buildTabBtn(
                    'Completed ($completedCount)',
                    'completed',
                    LucideIcons.checkCircle,
                    colors,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (_activeTab == 'available')
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  children: [
                    Expanded(
                      child: GlassContainer(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 4,
                        ),
                        backgroundColor: colors.card,
                        child: Row(
                          children: [
                            Icon(
                              LucideIcons.search,
                              color: colors.textSecondary,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextField(
                                style: TextStyle(color: colors.textPrimary),
                                onChanged: (v) =>
                                    setState(() => _searchTerm = v),
                                decoration: InputDecoration(
                                  border: InputBorder.none,
                                  hintText: 'Search quizzes...',
                                  hintStyle: TextStyle(
                                    color: colors.textSecondary,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    GestureDetector(
                      onTap: () =>
                          setState(() => _filterActive = !_filterActive),
                      child: GlassContainer(
                        backgroundColor: _filterActive
                            ? AppTheme.primaryBlue.withValues(alpha: 0.15)
                            : colors.card,
                        borderColor: _filterActive
                            ? AppTheme.primaryBlue.withValues(alpha: 0.4)
                            : colors.borderSubtle,
                        padding: const EdgeInsets.all(14),
                        child: Icon(
                          LucideIcons.zap,
                          color: _filterActive
                              ? AppTheme.primaryBlue
                              : colors.textSecondary,
                          size: 20,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),
            Expanded(
              child: _activeTab == 'available'
                  ? _buildAvailableList(
                      filteredQuizzes,
                      completedCount,
                      pendingCount,
                      avgScore,
                      colors,
                    )
                  : _buildCompletedList(filteredCompleted, colors),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBtn(
    String label,
    String val,
    IconData icon,
    AppColors colors,
  ) {
    bool isActive = _activeTab == val;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() {
          _activeTab = val;
          _searchTerm = '';
        }),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? AppTheme.primaryBlue : colors.card,
            borderRadius: BorderRadius.circular(16),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: AppTheme.primaryBlue.withValues(alpha: 0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : [],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 16,
                color: isActive ? Colors.black : colors.textSecondary,
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: isActive ? Colors.black : colors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvailableList(
    List<dynamic> list,
    int comp,
    int pend,
    double avg,
    AppColors colors,
  ) {
    if (list.isEmpty)
      return Center(
        child: Text(
          'No quizzes available.',
          style: TextStyle(color: colors.textSecondary),
        ),
      );

    final mainQuiz = list[0];
    final sideQuizzes = list.length > 1 ? list.sublist(1) : [];
    final availability = _getQuizAvailability(mainQuiz);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      children: [
        Row(
          children: [
            Expanded(
              child: GlassContainer(
                padding: const EdgeInsets.all(16),
                backgroundColor: colors.card,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(LucideIcons.barChart2, color: AppTheme.primaryBlue, size: 24),
                    const SizedBox(height: 8),
                    Text('AVG SCORE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.2)),
                    const SizedBox(height: 4),
                    Text('${avg.toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '')}%', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: colors.textPrimary)),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: GlassContainer(
                padding: const EdgeInsets.all(16),
                backgroundColor: colors.card,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(LucideIcons.checkCircle, color: Colors.greenAccent, size: 24),
                    const SizedBox(height: 8),
                    Text('COMPLETED', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.2)),
                    const SizedBox(height: 4),
                    Text('$comp Completed', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: colors.textPrimary)),
                    Text('$pend Pending', style: TextStyle(fontSize: 11, color: colors.textHint, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        GlassContainer(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          backgroundColor: colors.card,
          child: Row(
            children: [
              const Icon(LucideIcons.refreshCw, color: Colors.green, size: 16),
              const SizedBox(width: 8),
              Text(
                'Sync status:',
                style: TextStyle(fontSize: 12, color: colors.textSecondary, fontWeight: FontWeight.bold),
              ),
              const SizedBox(width: 4),
              const Text(
                'Synced with Server',
                style: TextStyle(fontSize: 12, color: Colors.green, fontWeight: FontWeight.w900),
              ),
              const Spacer(),
              Text(
                'Just Now',
                style: TextStyle(fontSize: 10, color: colors.textHint),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Stack(
          clipBehavior: Clip.none,
          children: [
            Positioned(
              right: -30,
              top: -30,
              child: ImageFiltered(
                imageFilter: ImageFilter.blur(sigmaX: 40, sigmaY: 40),
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryBlue.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),
            GlassContainer(
              margin: EdgeInsets.zero,
              backgroundColor: colors.card,
              borderColor: AppTheme.primaryBlue.withValues(alpha: 0.2),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryBlue.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppTheme.primaryBlue.withValues(alpha: 0.2),
                      ),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          LucideIcons.zap,
                          color: AppTheme.primaryBlue,
                          size: 14,
                        ),
                        SizedBox(width: 4),
                        Text(
                          'FEATURED QUIZ',
                          style: TextStyle(
                            color: AppTheme.primaryBlue,
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    mainQuiz['title'] ?? '',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 28,
                      color: colors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      _buildBadge(
                        LucideIcons.clock,
                        '${mainQuiz['time_limit_minutes'] ?? 0} min',
                      ),
                      _buildBadge(
                        LucideIcons.refreshCw,
                        '${mainQuiz['attempts_count'] ?? 0}/${mainQuiz['max_attempts'] ?? 1} attempts',
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  availability['available'] == true
                      ? GestureDetector(
                          onTap: () => _startOrResume(mainQuiz),
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryBlue,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryBlue.withValues(
                                    alpha: 0.4,
                                  ),
                                  blurRadius: 20,
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Start Quiz',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    color: Colors.black,
                                    fontSize: 16,
                                  ),
                                ),
                                SizedBox(width: 8),
                                Icon(
                                  LucideIcons.arrowRight,
                                  color: Colors.black,
                                  size: 20,
                                ),
                              ],
                            ),
                          ),
                        )
                      : Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            color: colors.surfaceLight,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: colors.borderSubtle),
                          ),
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                LucideIcons.info,
                                color: colors.textSecondary,
                                size: 16,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                availability['reason'] ?? 'N/A',
                                style: TextStyle(
                                  color: colors.textSecondary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Text(
          'YOUR STATS',
          style: TextStyle(
            color: colors.textSecondary,
            fontWeight: FontWeight.bold,
            fontSize: 11,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 12),
        GlassContainer(
          margin: EdgeInsets.zero,
          child: Column(
            children: [
              _buildStatRow(
                LucideIcons.checkCircle,
                'Completed',
                comp.toString(),
                colors.textSecondary,
                colors.textPrimary,
              ),
              const SizedBox(height: 12),
              _buildStatRow(
                LucideIcons.helpCircle,
                'Pending',
                pend.toString(),
                AppTheme.primaryBlue,
                AppTheme.primaryBlue,
              ),
              const SizedBox(height: 12),
              _buildStatRow(
                LucideIcons.zap,
                'Avg Score',
                '${avg.toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '')}%',
                Colors.orangeAccent,
                Colors.orangeAccent,
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        if (sideQuizzes.isNotEmpty)
          Text(
            'MORE QUIZZES',
            style: TextStyle(
              color: colors.textSecondary,
              fontWeight: FontWeight.bold,
              fontSize: 11,
              letterSpacing: 1.5,
            ),
          ),
        if (sideQuizzes.isNotEmpty) const SizedBox(height: 12),
        ...sideQuizzes.map((q) {
          final av = _getQuizAvailability(q);
          return GlassContainer(
            margin: const EdgeInsets.only(bottom: 12),
            backgroundColor: colors.card,
            borderColor: colors.borderSubtle,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  q['title'] ?? '',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                    color: colors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  q['course_name'] ?? '',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    color: AppTheme.primaryBlue.withValues(alpha: 0.8),
                  ),
                ),
                const SizedBox(height: 16),
                Container(height: 1, color: colors.divider),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(
                          LucideIcons.refreshCw,
                          color: colors.textSecondary,
                          size: 14,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${q['attempts_count'] ?? 0}/${q['max_attempts'] ?? 1} attempts',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            color: colors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    av['available'] == true
                        ? GestureDetector(
                            onTap: () => _startOrResume(q),
                            child: Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryBlue.withValues(
                                  alpha: 0.15,
                                ),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                LucideIcons.play,
                                color: AppTheme.primaryBlue,
                                size: 20,
                              ),
                            ),
                          )
                        : Row(
                            children: [
                              Icon(
                                LucideIcons.clock,
                                size: 14,
                                color: colors.textHint,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                av['reason'] ?? '',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: colors.textHint,
                                ),
                              ),
                            ],
                          ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildStatRow(
    IconData ico,
    String lbl,
    String val,
    Color cLbl,
    Color cVal,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cLbl.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cLbl.withValues(alpha: 0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(ico, color: cLbl, size: 16),
              const SizedBox(width: 8),
              Text(
                lbl,
                style: TextStyle(
                  color: cLbl,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          Text(
            val,
            style: TextStyle(
              color: cVal,
              fontWeight: FontWeight.w900,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(IconData ico, String txt) {
    final colors = Theme.of(context).extension<AppColors>()!;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: colors.surfaceLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colors.borderSubtle),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(ico, color: AppTheme.primaryBlue, size: 14),
          const SizedBox(width: 8),
          Text(
            txt,
            style: TextStyle(
              color: colors.textSecondary,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompletedList(List<dynamic> list, AppColors colors) {
    if (list.isEmpty)
      return Center(
        child: Text(
          'No completed quizzes yet.',
          style: TextStyle(color: colors.textSecondary),
        ),
      );
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      itemCount: list.length,
      itemBuilder: (ctx, i) {
        final q = list[i];
        final double percValue = _parseScore(q['percentage']);
        final String perc = percValue
            .toStringAsFixed(1)
            .replaceAll(RegExp(r'\.0$'), '');
        final passed = percValue >= _parseScore(q['passing_score'] ?? 50);
        final c = passed ? Colors.greenAccent : Colors.redAccent;
        return GlassContainer(
          backgroundColor: colors.card,
          borderColor: colors.borderSubtle,
          child: Row(
            children: [
              Container(
                width: 54,
                height: 54,
                child: GestureDetector(
                  onTap: () => _viewResults(q),
                  child: Icon(LucideIcons.checkCircle, color: c, size: 30),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      q['quiz_title'] ?? '',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                        color: colors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      q['course_name'] ?? '',
                      style: TextStyle(
                        color: AppTheme.primaryBlue.withValues(alpha: 0.8),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          LucideIcons.calendar,
                          size: 12,
                          color: colors.textHint,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          q['completed_at'] != null
                              ? DateTime.parse(
                                  q['completed_at'],
                                ).toLocal().toString().split(' ')[0]
                              : 'N/A',
                          style: TextStyle(
                            fontSize: 10,
                            color: colors.textHint,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '$perc%',
                    style: TextStyle(
                      color: c,
                      fontWeight: FontWeight.w900,
                      fontSize: 24,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'SCORE: ${_parseScore(q['score']).toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '')}/${_parseScore(q['total_points']).toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '')}',
                    style: TextStyle(
                      fontSize: 10,
                      color: colors.textSecondary,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

// --- TASKS TAB ---
class TasksTab extends StatefulWidget {
  const TasksTab({super.key});
  @override
  State<TasksTab> createState() => _TasksTabState();
}

class _TasksTabState extends State<TasksTab> {
  final TextEditingController _titleCtl = TextEditingController();
  final TextEditingController _descCtl = TextEditingController();
  dynamic _editingTask;

  void _toggle(dynamic t, bool st) {
    final dp = context.read<DataProvider>();
    final idx = dp.tasks.indexWhere((x) => x['id'] == t['id']);
    if (idx != -1) {
      dp.tasks[idx] = Map<String, dynamic>.from(dp.tasks[idx])
        ..['is_completed'] = st ? 1 : 0;
      dp.notifyListeners();
    }
    ApiService().dio
        .patch(
          '/student/personal-tasks/${t['id']}/toggle',
          data: {'is_completed': st},
        )
        .then((_) => null)
        .catchError((_) {
          if (mounted && idx != -1) {
            dp.tasks[idx] = Map<String, dynamic>.from(dp.tasks[idx])
              ..['is_completed'] = st ? 0 : 1;
            dp.notifyListeners();
          }
        });
  }

  void _toggleOfficial(dynamic t, bool st) {
    final dp = context.read<DataProvider>();
    final idx = dp.officialTasks.indexWhere((x) => x['id'] == t['id']);
    if (idx != -1) {
      dp.officialTasks[idx] = Map<String, dynamic>.from(dp.officialTasks[idx])
        ..['is_completed'] = st ? 1 : 0;
      dp.notifyListeners();
    }
    ApiService().dio
        .patch('/official-tasks/${t['id']}/toggle', data: {'is_completed': st})
        .then((_) => null)
        .catchError((_) {
          if (mounted && idx != -1) {
            dp.officialTasks[idx] = Map<String, dynamic>.from(
              dp.officialTasks[idx],
            )..['is_completed'] = st ? 0 : 1;
            dp.notifyListeners();
          }
        });
  }

  Future<void> _del(dynamic t) async {
    await ApiService().dio.delete('/student/personal-tasks/${t['id']}');
    if (mounted) context.read<DataProvider>().fetchExtraModules();
  }

  Future<void> _saveTask() async {
    if (_titleCtl.text.trim().isEmpty) return;
    if (_editingTask != null) {
      await ApiService().dio.put(
        '/student/personal-tasks/${_editingTask['id']}',
        data: {
          'title': _titleCtl.text.trim(),
          'description': _descCtl.text.trim(),
          'is_completed': _editingTask['is_completed'] ?? 0,
          'order_index': _editingTask['order_index'] ?? 0,
        },
      );
    } else {
      await ApiService().dio.post(
        '/student/personal-tasks',
        data: {'title': _titleCtl.text.trim(), 'description': _descCtl.text.trim()},
      );
    }
    _titleCtl.clear();
    _descCtl.clear();
    _editingTask = null;
    if (mounted) {
      Navigator.pop(context);
      context.read<DataProvider>().fetchExtraModules();
    }
  }

  void _showForm({dynamic task}) {
    if (task != null) {
      _editingTask = task;
      _titleCtl.text = task['title'] ?? '';
      _descCtl.text = task['description'] ?? '';
    } else {
      _editingTask = null;
      _titleCtl.clear();
      _descCtl.clear();
    }
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          left: 16,
          right: 16,
          top: 16,
        ),
        child: GlassContainer(
          backgroundColor: Theme.of(context).extension<AppColors>()!.card,
          borderColor: AppTheme.primaryBlue.withValues(alpha: 0.3),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _editingTask != null ? 'Edit Task' : 'New Task',
                style: const TextStyle(
                  color: AppTheme.primaryBlue,
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _titleCtl,
                style: TextStyle(
                  color: Theme.of(context).extension<AppColors>()!.textPrimary,
                ),
                decoration: InputDecoration(
                  hintText: 'Task title',
                  hintStyle: TextStyle(
                    color: Theme.of(context).extension<AppColors>()!.textHint,
                  ),
                  filled: true,
                  fillColor: Theme.of(
                    context,
                  ).extension<AppColors>()!.surfaceLight,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _descCtl,
                minLines: 2,
                maxLines: 4,
                style: TextStyle(
                  color: Theme.of(context).extension<AppColors>()!.textPrimary,
                ),
                decoration: InputDecoration(
                  hintText: 'Description (optional)',
                  hintStyle: TextStyle(
                    color: Theme.of(context).extension<AppColors>()!.textHint,
                  ),
                  filled: true,
                  fillColor: Theme.of(
                    context,
                  ).extension<AppColors>()!.surfaceLight,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: Theme.of(
                              context,
                            ).extension<AppColors>()!.borderSubtle,
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          'Cancel',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(
                              context,
                            ).extension<AppColors>()!.textPrimary,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: GestureDetector(
                      onTap: _saveTask,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryBlue,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primaryBlue.withValues(
                                alpha: 0.4,
                              ),
                              blurRadius: 15,
                            ),
                          ],
                        ),
                        alignment: Alignment.center,
                        child: const Text(
                          'Save Task',
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            color: Colors.black,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dp = context.watch<DataProvider>();
    final colors = Theme.of(context).extension<AppColors>()!;
    final tasks = dp.tasks;
    final officialTasks = dp.officialTasks;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(
                        LucideIcons.checkSquare,
                        color: AppTheme.primaryBlue,
                        size: 32,
                      ),
                      SizedBox(width: 12),
                      GradientText('My Tasks'),
                    ],
                  ),
                  GestureDetector(
                    onTap: _showForm,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryBlue,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryBlue.withValues(alpha: 0.4),
                            blurRadius: 12,
                          ),
                        ],
                      ),
                      child: const Text(
                        '+ Add Task',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          color: Colors.black,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: dp.isLoadingExtra
                  ? const Center(child: CircularProgressIndicator())
                  : (tasks.isEmpty && officialTasks.isEmpty)
                  ? Center(
                      child: Text(
                        'No tasks yet.\nCreate your first task!',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: colors.textSecondary),
                      ),
                    )
                  : ListView(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 8,
                      ),
                      children: [
                        if (officialTasks.isNotEmpty) ...[
                          Text(
                            'OFFICIAL COURSE TASKS',
                            style: TextStyle(
                              color: colors.textHint,
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                              letterSpacing: 1.5,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ...officialTasks.map((t) {
                            final done =
                                t['is_completed'] == 1 ||
                                t['is_completed'] == true;
                            return AnimatedOpacity(
                              duration: const Duration(milliseconds: 300),
                              opacity: done ? 0.6 : 1.0,
                              child: GlassContainer(
                                margin: const EdgeInsets.only(bottom: 12),
                                backgroundColor: colors.card,
                                borderColor: done
                                    ? Colors.transparent
                                    : AppTheme.primaryBlue.withValues(
                                        alpha: 0.3,
                                      ),
                                padding: const EdgeInsets.all(16),
                                borderRadius: 24,
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    GestureDetector(
                                      onTap: () => _toggleOfficial(t, !done),
                                      child: Container(
                                        margin: const EdgeInsets.only(
                                          top: 2,
                                          right: 16,
                                        ),
                                        child: Icon(
                                          done
                                              ? LucideIcons.checkCircle
                                              : LucideIcons.bookOpen,
                                          color: done
                                              ? AppTheme.primaryBlue
                                              : AppTheme.primaryBlue.withValues(
                                                  alpha: 0.7,
                                                ),
                                          size: 28,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 6,
                                                      vertical: 2,
                                                    ),
                                                decoration: BoxDecoration(
                                                  color: AppTheme.primaryBlue
                                                      .withValues(alpha: 0.1),
                                                  borderRadius:
                                                      BorderRadius.circular(6),
                                                ),
                                                child: Text(
                                                  t['course_name'] ?? '',
                                                  style: const TextStyle(
                                                    color: AppTheme.primaryBlue,
                                                    fontSize: 8,
                                                    fontWeight: FontWeight.w900,
                                                  ),
                                                ),
                                              ),
                                              if (t['deadline'] != null) ...[
                                                const SizedBox(width: 8),
                                                Text(
                                                  'Due: ${DateTime.parse(t['deadline']).toLocal().toString().split(' ')[0]}',
                                                  style: TextStyle(
                                                    color: colors.textHint,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ],
                                            ],
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            t['title'] ?? '',
                                            style: TextStyle(
                                              fontWeight: FontWeight.w900,
                                              fontSize: 16,
                                              color: colors.textPrimary,
                                              decoration: done
                                                  ? TextDecoration.lineThrough
                                                  : null,
                                            ),
                                          ),
                                          if (t['description'] != null &&
                                              t['description']
                                                  .toString()
                                                  .isNotEmpty)
                                            Padding(
                                              padding: const EdgeInsets.only(
                                                top: 4,
                                              ),
                                              child: Text(
                                                t['description'],
                                                style: TextStyle(
                                                  color: colors.textSecondary,
                                                  fontSize: 13,
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                    ),
                                    if (t['drive_link'] != null &&
                                        t['drive_link'].toString().isNotEmpty)
                                      GestureDetector(
                                        onTap: () async {
                                          final url = Uri.parse(
                                            t['drive_link'],
                                          );
                                          await launchUrl(
                                            url,
                                            mode:
                                                LaunchMode.externalApplication,
                                          );
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: AppTheme.primaryBlue
                                                .withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                          ),
                                          child: const Icon(
                                            LucideIcons.externalLink,
                                            color: AppTheme.primaryBlue,
                                            size: 18,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            );
                          }),
                          const SizedBox(height: 16),
                        ],
                        if (tasks.isNotEmpty) ...[
                          Text(
                            'PERSONAL TASKS',
                            style: TextStyle(
                              color: colors.textHint,
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                              letterSpacing: 1.5,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ...tasks.map((t) {
                            final done =
                                t['is_completed'] == 1 ||
                                t['is_completed'] == true;
                            return AnimatedOpacity(
                              duration: const Duration(milliseconds: 300),
                              opacity: done ? 0.5 : 1.0,
                              child: GlassContainer(
                                margin: const EdgeInsets.only(bottom: 12),
                                backgroundColor: colors.card,
                                borderColor: done
                                    ? Colors.transparent
                                    : colors.borderSubtle,
                                padding: const EdgeInsets.all(16),
                                borderRadius: 24,
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    GestureDetector(
                                      onTap: () => _toggle(t, !done),
                                      child: Container(
                                        margin: const EdgeInsets.only(
                                          top: 2,
                                          right: 16,
                                        ),
                                        child: Icon(
                                          done
                                              ? LucideIcons.checkCircle
                                              : LucideIcons.circle,
                                          color: done
                                              ? AppTheme.primaryBlue
                                              : colors.textSecondary,
                                          size: 28,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            t['title'] ?? '',
                                            style: TextStyle(
                                              fontWeight: FontWeight.w900,
                                              fontSize: 16,
                                              color: colors.textPrimary,
                                              decoration: done
                                                  ? TextDecoration.lineThrough
                                                  : null,
                                            ),
                                          ),
                                          if (t['description'] != null &&
                                              t['description']
                                                  .toString()
                                                  .isNotEmpty)
                                            Padding(
                                              padding: const EdgeInsets.only(
                                                top: 6,
                                              ),
                                              child: Text(
                                                t['description'],
                                                style: TextStyle(
                                                  color: colors.textSecondary,
                                                  fontSize: 13,
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        GestureDetector(
                                          onTap: () => _showForm(task: t),
                                          child: Padding(
                                            padding: const EdgeInsets.all(8.0),
                                            child: Icon(
                                              LucideIcons.edit3,
                                              color: colors.textSecondary,
                                              size: 20,
                                            ),
                                          ),
                                        ),
                                        GestureDetector(
                                          onTap: () => _del(t),
                                          child: const Padding(
                                            padding: EdgeInsets.all(8.0),
                                            child: Icon(
                                              LucideIcons.trash,
                                              color: Colors.redAccent,
                                              size: 20,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }),
                        ],
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

// --- ROADMAP TAB ---
class RoadmapTab extends StatefulWidget {
  const RoadmapTab({super.key});
  @override
  State<RoadmapTab> createState() => _RoadmapTabState();
}

class _RoadmapTabState extends State<RoadmapTab> {
  dynamic _selectedTrackId;
  List<dynamic> _tasks = [];
  Map<String, dynamic> _progress = {};
  bool _loading = false;

  void _load(dynamic t) async {
    setState(() {
      _selectedTrackId = t['id'];
      _loading = true;
    });
    try {
      final res = await ApiService().dio.get('/roadmap/progress/${t['id']}');
      if (mounted)
        setState(() {
          _tasks = res.data['tasks'] ?? [];
          _progress = {
            'percentage': res.data['percentage'] ?? 0,
            'completed': res.data['completed_tasks'] ?? 0,
            'total': res.data['total_tasks'] ?? 0,
          };
          _loading = false;
        });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _toggle(dynamic t, bool st) {
    final idx = _tasks.indexWhere((x) => x['task_id'] == t['task_id']);
    if (idx == -1) return;

    setState(() {
      _tasks[idx] = Map<String, dynamic>.from(_tasks[idx])
        ..['is_completed'] = st ? 1 : 0;
      final completed = _tasks
          .where((x) => x['is_completed'] == 1 || x['is_completed'] == true)
          .length;
      final total = _tasks.length;
      final pct = total > 0 ? ((completed / total) * 100).round() : 0;
      _progress = {'percentage': pct, 'completed': completed, 'total': total};
    });

    ApiService().dio
        .post(
          '/roadmap/toggle-task',
          data: {'taskId': t['task_id'], 'isCompleted': st},
        )
        .catchError((_) {
          if (mounted)
            setState(() {
              _tasks[idx] = Map<String, dynamic>.from(_tasks[idx])
                ..['is_completed'] = st ? 0 : 1;
            });
        });
  }

  @override
  Widget build(BuildContext context) {
    final dp = context.watch<DataProvider>();
    final colors = Theme.of(context).extension<AppColors>()!;
    final tracks = dp.roadmapTracks;
    if (tracks.isNotEmpty && _selectedTrackId == null)
      WidgetsBinding.instance.addPostFrameCallback((_) => _load(tracks[0]));

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: GradientText('Career Roadmap'),
            ),
            if (tracks.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: GlassContainer(
                  backgroundColor: colors.card,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryBlue.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(
                          LucideIcons.crosshair,
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Active Track',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryBlue,
                                letterSpacing: 1.2,
                              ),
                            ),
                            DropdownButtonHideUnderline(
                              child: DropdownButton<dynamic>(
                                value:
                                    tracks.any(
                                      (t) => t['id'] == _selectedTrackId,
                                    )
                                    ? _selectedTrackId
                                    : null,
                                dropdownColor: colors.card,
                                isExpanded: true,
                                icon: Icon(
                                  LucideIcons.chevronDown,
                                  color: colors.textSecondary,
                                ),
                                style: TextStyle(
                                  color: colors.textPrimary,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 16,
                                ),
                                items: tracks
                                    .map(
                                      (t) => DropdownMenuItem<dynamic>(
                                        value: t['id'],
                                        child: Text(t['name'] ?? ''),
                                      ),
                                    )
                                    .toList(),
                                onChanged: (v) {
                                  if (v != null) {
                                    final track = tracks.firstWhere(
                                      (t) => t['id'] == v,
                                      orElse: () => null,
                                    );
                                    if (track != null) _load(track);
                                  }
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            if (_selectedTrackId != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: GlassContainer(
                  backgroundColor: AppTheme.primaryBlue.withValues(alpha: 0.05),
                  borderColor: AppTheme.primaryBlue.withValues(alpha: 0.3),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'YOUR PROGRESS',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryBlue,
                                  letterSpacing: 1,
                                ),
                              ),
                              Text(
                                '${_progress['percentage'] ?? 0}%',
                                style: const TextStyle(
                                  fontSize: 40,
                                  fontWeight: FontWeight.w900,
                                  color: AppTheme.primaryBlue,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            '${_progress['completed'] ?? 0} of ${_progress['total'] ?? 0} Done',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: colors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value:
                              ((_progress['percentage'] ?? 0) as num)
                                  .toDouble() /
                              100.0,
                          minHeight: 12,
                          backgroundColor: colors.scoreBoxBg,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            AppTheme.primaryBlue,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 8),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      itemCount: _tasks.length,
                      itemBuilder: (ctx, i) {
                        final t = _tasks[i];
                        final done =
                            t['is_completed'] == 1 || t['is_completed'] == true;
                        return AnimatedOpacity(
                          duration: const Duration(milliseconds: 300),
                          opacity: done ? 0.6 : 1.0,
                          child: GlassContainer(
                            padding: const EdgeInsets.all(20),
                            backgroundColor: colors.card,
                            borderColor: done
                                ? Colors.transparent
                                : colors.borderSubtle,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                GestureDetector(
                                  onTap: () => _toggle(t, !done),
                                  child: Container(
                                    margin: const EdgeInsets.only(
                                      right: 16,
                                      top: 2,
                                    ),
                                    child: Icon(
                                      done
                                          ? LucideIcons.checkCircle
                                          : LucideIcons.circle,
                                      color: done
                                          ? AppTheme.primaryBlue
                                          : colors.textSecondary,
                                      size: 28,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        t['title'] ?? '',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w900,
                                          fontSize: 16,
                                          color: colors.textPrimary,
                                          decoration: done
                                              ? TextDecoration.lineThrough
                                              : null,
                                        ),
                                      ),
                                      if (t['description'] != null &&
                                          t['description']
                                              .toString()
                                              .isNotEmpty)
                                        Padding(
                                          padding: const EdgeInsets.only(
                                            top: 4,
                                          ),
                                          child: Text(
                                            t['description'],
                                            style: TextStyle(
                                              fontSize: 13,
                                              color: colors.textSecondary,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                Text(
                                  '#${i + 1}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    color: colors.textHint,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

// --- NOTIFICATIONS TAB ---
class NotificationsTab extends StatelessWidget {
  const NotificationsTab({super.key});

  Future<void> _read(BuildContext ctx, dynamic n) async {
    await ApiService().dio.put('/notifications/${n['id']}/read');
    ctx.read<DataProvider>().fetchExtraModules();
  }

  Future<void> _readAll(BuildContext ctx) async {
    await ApiService().dio.put('/notifications/read-all');
    ctx.read<DataProvider>().fetchExtraModules();
  }

  String _formatDate(BuildContext context, String iso) {
    try {
      final isAr = context.read<LocaleProvider>().languageCode == 'ar';
      final date = DateTime.parse(iso).toLocal();
      final diff = DateTime.now().difference(date);
      if (isAr) {
        if (diff.inMinutes < 1) return 'الآن';
        if (diff.inMinutes < 60) return 'منذ ${diff.inMinutes} دقيقة';
        if (diff.inHours < 24) return 'منذ ${diff.inHours} ساعة';
        if (diff.inDays == 1) return 'أمس';
        if (diff.inDays < 7) return 'منذ ${diff.inDays} أيام';
        return '${date.year}/${date.month}/${date.day}';
      } else {
        if (diff.inMinutes < 1) return 'Just now';
        if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
        if (diff.inHours < 24) return '${diff.inHours}h ago';
        if (diff.inDays == 1) return 'Yesterday';
        if (diff.inDays < 7) return '${diff.inDays} days ago';
        return '${date.year}/${date.month}/${date.day}';
      }
    } catch (_) {
      return '';
    }
  }

  Map<String, dynamic> _getStyle(String title, String content) {
    final tL = title.toLowerCase();
    final cL = content.toLowerCase();
    
    final isGrade = tL.contains('grade') || cL.contains('grade') || tL.contains('score') || cL.contains('score') ||
                     tL.contains('درجات') || cL.contains('درجات') || tL.contains('درجة') || cL.contains('درجة');
    final isSecurity = tL.contains('security') || cL.contains('security') || tL.contains('login') || cL.contains('login') ||
                       tL.contains('password') || cL.contains('password') || tL.contains('أمان') || cL.contains('دخول') ||
                       tL.contains('كلمة المرور') || cL.contains('كلمة المرور');
    final isEvent = tL.contains('contest') || cL.contains('contest') || tL.contains('event') || cL.contains('event') ||
                    tL.contains('مسابقة') || cL.contains('مسابقة') || tL.contains('فعالية') || cL.contains('فعالية');
                    
    if (isGrade) {
      return {
        'icon': LucideIcons.trendingUp,
        'color': const Color(0xFF3B82F6), // Blue
        'category_en': 'Grades Release',
        'category_ar': 'نزول الدرجات',
      };
    } else if (isSecurity) {
      return {
        'icon': LucideIcons.shieldCheck,
        'color': const Color(0xFFF43F5E), // Rose Red
        'category_en': 'Security Alert',
        'category_ar': 'تنبيه أمان',
      };
    } else if (isEvent) {
      return {
        'icon': LucideIcons.trophy,
        'color': const Color(0xFF10B981), // Emerald Green
        'category_en': 'Contest & Events',
        'category_ar': 'مسابقات وفعاليات',
      };
    } else {
      return {
        'icon': LucideIcons.info,
        'color': const Color(0xFF10B981), // Emerald Green
        'category_en': 'System Info',
        'category_ar': 'تحديث النظام',
      };
    }
  }

  @override
  Widget build(BuildContext context) {
    final dp = context.watch<DataProvider>();
    final colors = Theme.of(context).extension<AppColors>()!;
    final notifs = dp.notifications;
    final isAr = context.read<LocaleProvider>().languageCode == 'ar';
    final unreadCount = notifs.where((n) => n['is_read'] != 1 && n['is_read'] != true).length;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Stack(
          children: [
            // Background Decor (Gradient Bubbles)
            Positioned(
              top: -80,
              right: -80,
              child: ImageFiltered(
                imageFilter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                child: Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    color: const Color(0xFF8B5CF6).withOpacity(0.06), // purple
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 40,
              left: -60,
              child: ImageFiltered(
                imageFilter: ImageFilter.blur(sigmaX: 70, sigmaY: 70),
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2CFC7D).withOpacity(0.04), // bright green
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),

            // Scrollable Content
            CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // Hero header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 28, 24, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFF2CFC7D),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              isAr ? 'تنبيهات النظام' : 'SYSTEM ALERTS',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                                color: colors.textHint,
                                letterSpacing: 2.5,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(
                              child: Text(
                                isAr ? 'الإشعارات' : 'Notification',
                                style: TextStyle(
                                  fontSize: 32,
                                  fontWeight: FontWeight.w900,
                                  color: colors.textPrimary,
                                  letterSpacing: -1,
                                ),
                              ),
                            ),
                            if (unreadCount > 0)
                              GestureDetector(
                                onTap: () => _readAll(context),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF2CFC7D),
                                    borderRadius: BorderRadius.circular(20),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF2CFC7D).withOpacity(0.3),
                                        blurRadius: 12,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: Text(
                                    isAr ? 'تحديد الكل كمقروء' : 'MARK ALL READ',
                                    style: const TextStyle(
                                      color: Colors.black,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // Bento Statistics Card
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                    child: GlassContainer(
                      backgroundColor: colors.card,
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isAr 
                              ? 'تنبيهات حالة النظام، نزول درجات المواد، والإعلانات الرسمية.'
                              : 'Grades, announcements, and system updates.',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: colors.textSecondary,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Container(
                            height: 1,
                            color: colors.borderSubtle,
                          ),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '$unreadCount',
                                      style: const TextStyle(
                                        fontSize: 32,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF2CFC7D),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      isAr ? 'غير مقروء' : 'UNREAD',
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w900,
                                        color: colors.textHint,
                                        letterSpacing: 1.5,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                width: 1,
                                height: 50,
                                color: colors.borderSubtle,
                              ),
                              const SizedBox(width: 24),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${notifs.length}',
                                      style: TextStyle(
                                        fontSize: 32,
                                        fontWeight: FontWeight.w900,
                                        color: colors.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      isAr ? 'الإجمالي' : 'TOTAL',
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w900,
                                        color: colors.textHint,
                                        letterSpacing: 1.5,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 16)),

                // Notifications List
                notifs.isEmpty
                    ? SliverFillRemaining(
                        hasScrollBody: false,
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(LucideIcons.bellOff, size: 48, color: colors.textHint),
                              const SizedBox(height: 16),
                              Text(
                                isAr ? 'لا توجد إشعارات جديدة ✅' : 'All caught up! ✅',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: colors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (ctx, i) {
                              final n = notifs[i];
                              final isRead = n['is_read'] == 1 || n['is_read'] == true;
                              final style = _getStyle(n['title'] ?? '', n['content'] ?? n['message'] ?? '');
                              final Color categoryColor = style['color'];
                              final IconData categoryIcon = style['icon'];

                              return Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: GestureDetector(
                                  onTap: () {
                                    if (!isRead) _read(context, n);
                                  },
                                  child: GlassContainer(
                                    backgroundColor: colors.card,
                                    margin: EdgeInsets.zero,
                                    padding: const EdgeInsets.all(20),
                                    borderColor: isRead
                                        ? colors.borderSubtle
                                        : categoryColor.withOpacity(0.2),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          crossAxisAlignment: CrossAxisAlignment.center,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(10),
                                              decoration: BoxDecoration(
                                                color: categoryColor.withOpacity(0.12),
                                                borderRadius: BorderRadius.circular(12),
                                              ),
                                              child: Icon(
                                                categoryIcon,
                                                color: categoryColor,
                                                size: 20,
                                              ),
                                            ),
                                            Text(
                                              _formatDate(context, n['created_at']?.toString() ?? ''),
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w900,
                                                color: colors.textHint,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 16),
                                        Text(
                                          n['title'] ?? '',
                                          softWrap: true,
                                          textDirection: detectTextDir(n['title'] ?? ''),
                                          style: TextStyle(
                                            fontWeight: FontWeight.w900,
                                            fontSize: 17,
                                            letterSpacing: -0.5,
                                            color: isRead
                                                ? colors.textSecondary
                                                : colors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        RenderContent(
                                          text: n['content'] ?? n['message'] ?? '',
                                          textStyle: TextStyle(
                                            color: isRead
                                                ? colors.textSecondary.withOpacity(0.7)
                                                : colors.textSecondary,
                                            fontSize: 13.5,
                                            height: 1.5,
                                          ),
                                        ),
                                        if (!isRead) ...[
                                          const SizedBox(height: 16),
                                          Container(
                                            height: 1,
                                            color: colors.borderSubtle,
                                          ),
                                          const SizedBox(height: 12),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.end,
                                            children: [
                                              Icon(
                                                LucideIcons.zap,
                                                size: 12,
                                                color: categoryColor,
                                              ),
                                              const SizedBox(width: 6),
                                              Text(
                                                isAr ? 'اضغط للتحديد كمقروء' : 'TAP TO MARK READ',
                                                style: TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.w900,
                                                  color: categoryColor,
                                                  letterSpacing: 1,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                            childCount: notifs.length,
                          ),
                        ),
                      ),
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// --- SETTINGS TAB ---
class SettingsTab extends StatefulWidget {
  const SettingsTab({super.key});

  @override
  State<SettingsTab> createState() => _SettingsTabState();
}

class _SettingsTabState extends State<SettingsTab> {
  String _currentVersion = '1.0.0';
  bool _pushNotifications = true;
  bool _isCheckingUpdate = false;
  final TextEditingController _currentPassCtl = TextEditingController();
  final TextEditingController _newPassCtl = TextEditingController();
  final TextEditingController _confirmPassCtl = TextEditingController();
  bool _isLoadingPW = false;
  bool _isUploadingAvatar = false;

  Future<void> _pickAndUploadAvatar() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
      maxWidth: 500,
    );
    if (pickedFile == null) return;

    setState(() => _isUploadingAvatar = true);
    final auth = context.read<AuthProvider>();
    final res = await auth.uploadAvatar(pickedFile.path);
    setState(() => _isUploadingAvatar = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: res['success'] == true ? Colors.greenAccent : Colors.redAccent,
          content: Text(
            res['success'] == true ? 'Avatar updated successfully!' : (res['message'] ?? 'Failed to upload avatar'),
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: res['success'] == true ? Colors.black : Colors.white,
            ),
          ),
        ),
      );
    }
  }

  Widget _buildProfileCard(AppColors colors) {
    final student = context.watch<AuthProvider>().student;
    if (student == null) return const SizedBox.shrink();

    final avatarUrl = student['avatar_url']?.toString() ?? '';
    final name = student['name']?.toString() ?? '';
    final studentId = student['id']?.toString() ?? '';
    final level = student['level']?.toString() ?? '';
    final section = student['section']?.toString() ?? '';

    return GlassContainer(
      padding: const EdgeInsets.all(20),
      backgroundColor: colors.card,
      borderColor: colors.borderSubtle,
      child: Row(
        children: [
          // Avatar
          GestureDetector(
            onTap: _isUploadingAvatar ? null : _pickAndUploadAvatar,
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppTheme.primaryBlue.withValues(alpha: 0.3), width: 2),
                    image: avatarUrl.isNotEmpty
                        ? DecorationImage(image: NetworkImage(avatarUrl), fit: BoxFit.cover)
                        : null,
                  ),
                  child: avatarUrl.isEmpty
                      ? Icon(LucideIcons.user, size: 40, color: colors.textSecondary)
                      : null,
                ),
                if (_isUploadingAvatar)
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Center(
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppTheme.primaryBlue,
                      ),
                    ),
                  )
                else
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppTheme.primaryBlue,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(LucideIcons.camera, size: 12, color: Colors.black),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'ZNU-$studentId',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: colors.textHint,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryBlue.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'ACTIVE',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryBlue,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  name,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: colors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                // Level / Section Row
                Row(
                  children: [
                    _buildBadge('Level $level', colors),
                    const SizedBox(width: 8),
                    _buildBadge('Sec $section', colors),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(String text, AppColors colors) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: colors.surfaceLight,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colors.borderSubtle, width: 0.5),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: colors.textSecondary,
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadPrefs();
  }

  Future<void> _loadPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final packageInfo = await PackageInfo.fromPlatform();
    setState(() {
      _pushNotifications = prefs.getBool('pushEnabled') ?? true;
      _currentVersion = packageInfo.version;
    });
  }

  Future<void> _togglePush(bool val) async {
    setState(() => _pushNotifications = val);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('pushEnabled', val);
    if (mounted)
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            val ? 'Push Notifications Enabled' : 'Push Notifications Disabled',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
      );
  }

  Future<void> _checkForUpdates() async {
    setState(() => _isCheckingUpdate = true);
    try {
      final api = ApiService();
      final response = await api.dio.get('/app/version');
      final data = response.data;
      final latestVersion = data['latest_version'] ?? _currentVersion;
      final apkUrl = data['apk_url'] ?? '';
      final releaseNotes =
          data['release_notes'] ?? 'Bug fixes and improvements';

      if (!mounted) return;

      if (_isNewerVersion(latestVersion, _currentVersion)) {
        _showUpdateDialog(latestVersion, apkUrl, releaseNotes);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Colors.greenAccent,
            content: Text(
              '✅ You are on the latest version!',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Colors.redAccent,
            content: Text(
              'Failed to check for updates. Try again later.',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isCheckingUpdate = false);
    }
  }

  bool _isNewerVersion(String latest, String current) {
    final latestParts = latest.split('.').map(int.parse).toList();
    final currentParts = current.split('.').map(int.parse).toList();
    for (int i = 0; i < latestParts.length; i++) {
      if (i >= currentParts.length) return true;
      if (latestParts[i] > currentParts[i]) return true;
      if (latestParts[i] < currentParts[i]) return false;
    }
    return false;
  }

  void _showUpdateDialog(String version, String apkUrl, String notes) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: GlassContainer(
          backgroundColor: Theme.of(context).extension<AppColors>()!.card,
          borderColor: AppTheme.primaryBlue.withValues(alpha: 0.4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.primaryBlue.withOpacity(0.2),
                      Colors.transparent,
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(20),
                  ),
                ),
                child: Column(
                  children: [
                    Icon(
                      LucideIcons.download,
                      color: AppTheme.primaryBlue,
                      size: 40,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Update Available!',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: Theme.of(
                          context,
                        ).extension<AppColors>()!.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'v$version',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.primaryBlue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(
                          context,
                        ).extension<AppColors>()!.surfaceLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "What's New",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryBlue,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            notes,
                            style: TextStyle(
                              fontSize: 13,
                              color: Theme.of(
                                context,
                              ).extension<AppColors>()!.textSecondary,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => Navigator.pop(ctx),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: Theme.of(
                                    context,
                                  ).extension<AppColors>()!.borderSubtle,
                                ),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                'Later',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(
                                    context,
                                  ).extension<AppColors>()!.textSecondary,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: GestureDetector(
                            onTap: () async {
                              Navigator.pop(ctx);
                              if (apkUrl.isNotEmpty) {
                                final uri = Uri.parse(apkUrl);
                                try {
                                  final uri = Uri.parse(apkUrl);
                                  await launchUrl(
                                    uri,
                                    mode: LaunchMode.externalApplication,
                                  );
                                } catch (e) {
                                  debugPrint(
                                    'Could not launch APK download: $e',
                                  );
                                }
                              } else {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      backgroundColor: Colors.orangeAccent,
                                      content: Text(
                                        'Download link not available yet.',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.black,
                                        ),
                                      ),
                                    ),
                                  );
                                }
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryBlue,
                                borderRadius: BorderRadius.circular(14),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppTheme.primaryBlue.withValues(
                                      alpha: 0.4,
                                    ),
                                    blurRadius: 15,
                                  ),
                                ],
                              ),
                              alignment: Alignment.center,
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    LucideIcons.download,
                                    size: 18,
                                    color: Colors.black,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Download Now',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      color: Colors.black,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showPasswordModal(BuildContext context) {
    _currentPassCtl.clear();
    _newPassCtl.clear();
    _confirmPassCtl.clear();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setStateModal) {
          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom,
              left: 16,
              right: 16,
              top: 16,
            ),
            child: GlassContainer(
              backgroundColor: Theme.of(context).extension<AppColors>()!.card,
              borderColor: AppTheme.primaryBlue.withValues(alpha: 0.3),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Change Password',
                    style: TextStyle(
                      color: AppTheme.primaryBlue,
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _currentPassCtl,
                    obscureText: true,
                    style: TextStyle(
                      color: Theme.of(
                        context,
                      ).extension<AppColors>()!.textPrimary,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Current Password',
                      hintStyle: TextStyle(
                        color: Theme.of(
                          context,
                        ).extension<AppColors>()!.textHint,
                      ),
                      filled: true,
                      fillColor: Theme.of(
                        context,
                      ).extension<AppColors>()!.surfaceLight,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _newPassCtl,
                    obscureText: true,
                    style: TextStyle(
                      color: Theme.of(
                        context,
                      ).extension<AppColors>()!.textPrimary,
                    ),
                    decoration: InputDecoration(
                      hintText: 'New Password',
                      hintStyle: TextStyle(
                        color: Theme.of(
                          context,
                        ).extension<AppColors>()!.textHint,
                      ),
                      filled: true,
                      fillColor: Theme.of(
                        context,
                      ).extension<AppColors>()!.surfaceLight,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _confirmPassCtl,
                    obscureText: true,
                    style: TextStyle(
                      color: Theme.of(
                        context,
                      ).extension<AppColors>()!.textPrimary,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Confirm New Password',
                      hintStyle: TextStyle(
                        color: Theme.of(
                          context,
                        ).extension<AppColors>()!.textHint,
                      ),
                      filled: true,
                      fillColor: Theme.of(
                        context,
                      ).extension<AppColors>()!.surfaceLight,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => Navigator.pop(ctx),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: Theme.of(
                                  context,
                                ).extension<AppColors>()!.borderSubtle,
                              ),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Cancel',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Theme.of(
                                  context,
                                ).extension<AppColors>()!.textPrimary,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: GestureDetector(
                          onTap: () async {
                            if (_newPassCtl.text != _confirmPassCtl.text) {
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                const SnackBar(
                                  backgroundColor: Colors.redAccent,
                                  content: Text(
                                    'Passwords do not match!',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              );
                              return;
                            }
                            if (_newPassCtl.text.length < 4) {
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                const SnackBar(
                                  backgroundColor: Colors.redAccent,
                                  content: Text(
                                    'Password must be at least 4 characters',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              );
                              return;
                            }
                            setStateModal(() => _isLoadingPW = true);
                            final res = await ctx
                                .read<AuthProvider>()
                                .changePassword(
                                  _currentPassCtl.text,
                                  _newPassCtl.text,
                                );
                            setStateModal(() => _isLoadingPW = false);
                            if (res['success'] == true) {
                              Navigator.pop(ctx);
                              if (mounted)
                                ScaffoldMessenger.of(this.context).showSnackBar(
                                  const SnackBar(
                                    backgroundColor: Colors.greenAccent,
                                    content: Text(
                                      'Password changed successfully!',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.black,
                                      ),
                                    ),
                                  ),
                                );
                            } else {
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                SnackBar(
                                  backgroundColor: Colors.redAccent,
                                  content: Text(
                                    res['message'] ??
                                        'Failed to change password',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              );
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryBlue,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryBlue.withValues(
                                    alpha: 0.4,
                                  ),
                                  blurRadius: 15,
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: _isLoadingPW
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.black,
                                    ),
                                  )
                                : const Text(
                                    'Update Password',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      color: Colors.black,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showLinkEmailModal(BuildContext context) {
    final emailCtl = TextEditingController();
    final colors = Theme.of(context).extension<AppColors>()!;
    final currentEmail =
        context.read<AuthProvider>().student?['email']?.toString() ?? '';
    if (currentEmail.isNotEmpty) emailCtl.text = currentEmail;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setStateModal) {
          bool saving = false;
          String? error;
          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom,
              left: 16,
              right: 16,
              top: 16,
            ),
            child: GlassContainer(
              backgroundColor: colors.card,
              borderColor: AppTheme.primaryBlue.withValues(alpha: 0.3),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Link Email',
                    style: TextStyle(
                      color: AppTheme.primaryBlue,
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Link your Gmail to enable Google Sign-In and password recovery.',
                    style: TextStyle(color: colors.textSecondary, fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: emailCtl,
                    style: TextStyle(color: colors.textPrimary),
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      hintText: 'your.email@gmail.com',
                      hintStyle: TextStyle(color: colors.textHint),
                      filled: true,
                      fillColor: colors.surfaceLight,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                      prefixIcon: Icon(
                        LucideIcons.mail,
                        color: colors.textHint,
                      ),
                    ),
                  ),
                  if (error != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      error!,
                      style: const TextStyle(
                        color: Colors.redAccent,
                        fontSize: 13,
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => Navigator.pop(ctx),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              border: Border.all(color: colors.borderSubtle),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Cancel',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: colors.textPrimary,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: GestureDetector(
                          onTap: () async {
                            if (emailCtl.text.trim().isEmpty ||
                                !emailCtl.text.contains('@')) {
                              setStateModal(
                                () => error = 'Please enter a valid email',
                              );
                              return;
                            }
                            setStateModal(() {
                              saving = true;
                              error = null;
                            });
                            final res = await ctx
                                .read<AuthProvider>()
                                .linkEmail(emailCtl.text.trim());
                            setStateModal(() => saving = false);
                            if (res['success'] == true) {
                              Navigator.pop(ctx);
                              if (mounted) {
                                ScaffoldMessenger.of(this.context).showSnackBar(
                                  const SnackBar(
                                    backgroundColor: Colors.greenAccent,
                                    content: Text(
                                      'Email linked successfully!',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.black,
                                      ),
                                    ),
                                  ),
                                );
                              }
                            } else {
                              setStateModal(
                                () => error =
                                    res['message'] ?? 'Failed to link email',
                              );
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryBlue,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryBlue.withValues(
                                    alpha: 0.4,
                                  ),
                                  blurRadius: 15,
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: saving
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.black,
                                    ),
                                  )
                                : const Text(
                                    'Save Email',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      color: Colors.black,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final themeProvider = context.watch<ThemeProvider>();

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: GradientText('Settings'),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                children: [
                  const SizedBox(height: 12),
                  _buildProfileCard(colors),
                  const SizedBox(height: 24),
                  Text(
                    'ACCOUNT',
                    style: TextStyle(
                      color: AppTheme.primaryBlue,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () => _showPasswordModal(context),
                    child: GlassContainer(
                      padding: const EdgeInsets.all(8),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: colors.surfaceLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            LucideIcons.lock,
                            color: colors.textPrimary,
                          ),
                        ),
                        title: Text(
                          'Change Password',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: colors.textPrimary,
                          ),
                        ),
                        trailing: Icon(
                          LucideIcons.chevronRight,
                          size: 14,
                          color: colors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () => _showLinkEmailModal(context),
                    child: GlassContainer(
                      padding: const EdgeInsets.all(8),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: colors.surfaceLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            LucideIcons.mail,
                            color: AppTheme.primaryBlue,
                          ),
                        ),
                        title: Text(
                          'Link Email',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: colors.textPrimary,
                          ),
                        ),
                        subtitle: Text(
                          context.watch<AuthProvider>().student?['email'] !=
                                      null &&
                                  context
                                      .watch<AuthProvider>()
                                      .student!['email']
                                      .toString()
                                      .isNotEmpty
                              ? context
                                    .watch<AuthProvider>()
                                    .student!['email']
                                    .toString()
                              : 'No email linked yet',
                          style: TextStyle(
                            fontSize: 12,
                            color:
                                context
                                        .watch<AuthProvider>()
                                        .student?['email'] !=
                                    null
                                ? AppTheme.primaryBlue
                                : colors.textHint,
                          ),
                        ),
                        trailing: Icon(
                          LucideIcons.chevronRight,
                          size: 14,
                          color: colors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'PREFERENCES',
                    style: TextStyle(
                      color: AppTheme.primaryBlue,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GlassContainer(
                    padding: const EdgeInsets.all(8),
                    child: SwitchListTile(
                      secondary: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: colors.surfaceLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          LucideIcons.bellRing,
                          color: colors.textPrimary,
                        ),
                      ),
                      title: Text(
                        'Push Notifications',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: colors.textPrimary,
                        ),
                      ),
                      subtitle: Text(
                        'Alerts for grades and quizzes',
                        style: TextStyle(
                          fontSize: 12,
                          color: colors.textSecondary,
                        ),
                      ),
                      value: _pushNotifications,
                      activeColor: AppTheme.primaryBlue,
                      onChanged: _togglePush,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GlassContainer(
                    padding: const EdgeInsets.all(8),
                    child: SwitchListTile(
                      secondary: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: colors.surfaceLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          themeProvider.isDarkMode
                              ? LucideIcons.moon
                              : LucideIcons.sun,
                          color: themeProvider.isDarkMode
                              ? Colors.amber
                              : Colors.orangeAccent,
                        ),
                      ),
                      title: Text(
                        themeProvider.isDarkMode ? 'Dark Mode' : 'Light Mode',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: colors.textPrimary,
                        ),
                      ),
                      subtitle: Text(
                        themeProvider.isDarkMode
                            ? 'Switch to light theme'
                            : 'Switch to dark theme',
                        style: TextStyle(
                          fontSize: 12,
                          color: colors.textSecondary,
                        ),
                      ),
                      value: themeProvider.isDarkMode,
                      activeColor: AppTheme.primaryBlue,
                      onChanged: (_) => themeProvider.toggleTheme(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  GlassContainer(
                    padding: const EdgeInsets.all(8),
                    child: ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: colors.surfaceLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          LucideIcons.languages,
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                      title: Text(
                        'Language / اللغة',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: colors.textPrimary,
                        ),
                      ),
                      subtitle: Text(
                        context.watch<LocaleProvider>().isArabic
                            ? 'العربية'
                            : 'English',
                        style: TextStyle(
                          fontSize: 12,
                          color: colors.textSecondary,
                        ),
                      ),
                      trailing: GestureDetector(
                        onTap: () =>
                            context.read<LocaleProvider>().toggleLocale(),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryBlue.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: AppTheme.primaryBlue.withValues(
                                alpha: 0.3,
                              ),
                            ),
                          ),
                          child: Text(
                            context.watch<LocaleProvider>().isArabic
                                ? 'EN'
                                : 'عربي',
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              color: AppTheme.primaryBlue,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'APP UPDATE',
                    style: TextStyle(
                      color: AppTheme.primaryBlue,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: _isCheckingUpdate ? null : _checkForUpdates,
                    child: GlassContainer(
                      padding: const EdgeInsets.all(8),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: colors.surfaceLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: _isCheckingUpdate
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: AppTheme.primaryBlue,
                                  ),
                                )
                              : Icon(
                                  LucideIcons.refreshCw,
                                  color: colors.textPrimary,
                                ),
                        ),
                        title: Text(
                          'Check for Updates',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: colors.textPrimary,
                          ),
                        ),
                        subtitle: Text(
                          'Current version: v$_currentVersion',
                          style: TextStyle(
                            fontSize: 12,
                            color: colors.textSecondary,
                          ),
                        ),
                        trailing: Icon(
                          LucideIcons.chevronRight,
                          size: 14,
                          color: colors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'SESSION',
                    style: TextStyle(
                      color: Colors.redAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () async {
                      await context.read<AuthProvider>().logout();
                    },
                    child: GlassContainer(
                      padding: const EdgeInsets.all(8),
                      borderColor: Colors.redAccent.withValues(alpha: 0.2),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.redAccent.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            LucideIcons.logOut,
                            color: Colors.redAccent,
                          ),
                        ),
                        title: const Text(
                          'Logout',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.redAccent,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
