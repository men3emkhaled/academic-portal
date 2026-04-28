import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../services/api_service.dart';
import '../theme.dart';
import 'ui_helpers.dart';

class QuizResultScreen extends StatefulWidget {
  final dynamic quizId;
  final dynamic attemptId;

  const QuizResultScreen({super.key, required this.quizId, required this.attemptId});

  @override
  State<QuizResultScreen> createState() => _QuizResultScreenState();
}

class _QuizResultScreenState extends State<QuizResultScreen> {
  bool _loading = true;
  Map<String, dynamic>? _result;
  List<dynamic> _leaderboard = [];
  String _activeTab = 'review';

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final resultRes = await ApiService().dio.get('/quizzes/attempts/${widget.attemptId}/result');
      List<dynamic> lb = [];
      try {
        final lbRes = await ApiService().dio.get('/quizzes/${widget.quizId}/leaderboard');
        lb = lbRes.data ?? [];
      } catch (_) {}
      if (mounted) setState(() { _result = resultRes.data; _leaderboard = lb; _loading = false; });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to load result')));
        Navigator.pop(context);
      }
    }
  }

  double _parseNum(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;

    if (_loading) {
      return Scaffold(
        backgroundColor: colors.background,
        body: const Center(child: CircularProgressIndicator(color: AppTheme.primaryBlue)),
      );
    }

    if (_result == null || (_result!['answers'] as List?)?.isEmpty == true) {
      return Scaffold(
        backgroundColor: colors.background,
        body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(LucideIcons.alertCircle, color: colors.textSecondary, size: 48),
          const SizedBox(height: 16),
          Text('No results available', style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(14)),
              child: const Text('Back', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black)),
            ),
          ),
        ])),
      );
    }

    final score = _result!['score'];
    final totalPoints = _result!['total_points'];
    final percentage = _result!['percentage'];
    final answers = _result!['answers'] as List;
    final timeSpent = _result!['time_spent'] ?? '00:00';
    final rank = _result!['rank'];
    final isPending = _result!['status'] == 'pending_review';
    final quiz = _result!['quiz'] ?? {};
    final maxAttempts = quiz['max_attempts'] ?? 1;
    final attemptsCount = quiz['attempts_count'] ?? 1;
    final canRetry = !isPending && attemptsCount < maxAttempts;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          children: [
            // Hero section
            Center(child: Column(children: [
              Text(isPending ? 'Under Review' : 'Quiz Completed!',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 28, color: colors.textPrimary)),
              const SizedBox(height: 24),

              if (isPending) ...[
                GlassContainer(
                  backgroundColor: colors.card,
                  borderColor: Colors.orangeAccent.withValues(alpha: 0.3),
                  child: Column(children: [
                    const Icon(LucideIcons.clock, color: Colors.orangeAccent, size: 48),
                    const SizedBox(height: 12),
                    Text('Your written answers are being reviewed.', style: TextStyle(fontSize: 16, color: colors.textSecondary), textAlign: TextAlign.center),
                    const SizedBox(height: 4),
                    Text('You will be notified once grading is complete.', style: TextStyle(fontSize: 13, color: colors.textHint), textAlign: TextAlign.center),
                  ]),
                ),
              ] else ...[
                // Score circle
                Container(
                  width: 160, height: 160,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: colors.card,
                    border: Border.all(color: AppTheme.primaryBlue.withValues(alpha: 0.3), width: 3),
                    boxShadow: [BoxShadow(color: AppTheme.primaryBlue.withValues(alpha: 0.15), blurRadius: 40)],
                  ),
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Text('$percentage%', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 44, color: AppTheme.primaryBlue)),
                    Text('Accuracy', style: TextStyle(color: colors.textHint, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1.5)),
                  ]),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(color: colors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: colors.borderSubtle)),
                  child: RichText(text: TextSpan(style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: colors.textPrimary), children: [
                    const TextSpan(text: 'Score: '),
                    TextSpan(text: '$score', style: const TextStyle(color: AppTheme.primaryBlue)),
                    TextSpan(text: ' / $totalPoints'),
                  ])),
                ),
              ],
            ])),

            const SizedBox(height: 24),

            // Stats
            Row(children: [
              Expanded(child: _statBox(LucideIcons.clock, 'Time Spent', timeSpent.toString(), colors)),
              const SizedBox(width: 12),
              Expanded(child: _statBox(LucideIcons.target, 'Rank', isPending ? '—' : '#${rank ?? '-'}', colors)),
            ]),

            const SizedBox(height: 24),

            // Tabs
            if (!isPending) ...[
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(color: colors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: colors.borderSubtle)),
                child: Row(children: [
                  _tabBtn('Review Answers', 'review', LucideIcons.fileQuestion, colors),
                  _tabBtn('Leaderboard', 'leaderboard', LucideIcons.activity, colors),
                ]),
              ),
              const SizedBox(height: 16),
            ],

            // Content
            if (isPending)
              ...answers.map((ans) => _pendingAnswerCard(ans, answers.indexOf(ans), colors))
            else if (_activeTab == 'review')
              ...answers.map((ans) => _reviewAnswerCard(ans, answers.indexOf(ans), colors))
            else
              ..._buildLeaderboard(colors),

            const SizedBox(height: 24),

            // CTA
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: AppTheme.primaryBlue.withValues(alpha: 0.4), blurRadius: 15)]),
                alignment: Alignment.center,
                child: const Text('Back to Quizzes', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black, fontSize: 16)),
              ),
            ),

            if (canRetry) ...[
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () {
                  Navigator.pop(context);
                  // The quizzes tab will allow starting again
                },
                child: Container(
                  width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.primaryBlue, width: 2)),
                  alignment: Alignment.center,
                  child: Text('Retry Quiz ($attemptsCount/$maxAttempts)', style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryBlue, fontSize: 16)),
                ),
              ),
            ],

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _statBox(IconData icon, String label, String value, AppColors colors) {
    return GlassContainer(
      backgroundColor: colors.card,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: colors.textSecondary, size: 20),
        const SizedBox(height: 8),
        Text(label, style: TextStyle(color: colors.textHint, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1.2)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: colors.textPrimary)),
      ]),
    );
  }

  Widget _tabBtn(String label, String val, IconData icon, AppColors colors) {
    final active = _activeTab == val;
    return Expanded(child: GestureDetector(
      onTap: () => setState(() => _activeTab = val),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: active ? AppTheme.primaryBlue : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 14, color: active ? Colors.black : colors.textSecondary),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: active ? Colors.black : colors.textSecondary)),
        ]),
      ),
    ));
  }

  Widget _pendingAnswerCard(dynamic ans, int idx, AppColors colors) {
    if (ans == null || ans['question_id'] == null) return const SizedBox.shrink();
    final hasText = ans['student_answer'] != null && ans['student_answer'].toString().trim().isNotEmpty;

    return GlassContainer(
      backgroundColor: colors.card,
      borderColor: Colors.orangeAccent.withValues(alpha: 0.3),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 32, height: 32,
          decoration: BoxDecoration(color: Colors.orangeAccent.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
          alignment: Alignment.center,
          child: Text('${idx + 1}', style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.orangeAccent)),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(ans['question_text'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: colors.textPrimary)),
          if (hasText) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(12)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Your answer:', style: TextStyle(fontSize: 10, color: colors.textHint, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(ans['student_answer'], style: TextStyle(color: colors.textPrimary)),
              ]),
            ),
          ],
          const SizedBox(height: 8),
          Row(children: [
            Icon(LucideIcons.clock, size: 14, color: Colors.orangeAccent),
            const SizedBox(width: 4),
            Text('Waiting for review', style: TextStyle(fontSize: 12, color: Colors.orangeAccent, fontWeight: FontWeight.bold)),
          ]),
        ])),
      ]),
    );
  }

  Widget _reviewAnswerCard(dynamic ans, int idx, AppColors colors) {
    if (ans == null || ans['question_id'] == null) return const SizedBox.shrink();
    final isCorrect = ans['is_correct'] == true;
    final studentAnswer = ans['student_answer']?.toString() ?? '';
    final correctAnswer = ans['correct_answer']?.toString() ?? '';
    final borderColor = isCorrect ? AppTheme.primaryBlue.withValues(alpha: 0.5) : Colors.redAccent.withValues(alpha: 0.5);

    return GlassContainer(
      backgroundColor: colors.card,
      borderColor: borderColor,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(
              color: isCorrect ? AppTheme.primaryBlue.withValues(alpha: 0.15) : Colors.redAccent.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text('${idx + 1}', style: TextStyle(fontWeight: FontWeight.w900, color: isCorrect ? AppTheme.primaryBlue : Colors.redAccent)),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(ans['question_text'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: colors.textPrimary))),
        ]),

        const SizedBox(height: 12),

        // Answer review
        if (ans['question_type'] == 'written') ...[
          if (studentAnswer.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(12)),
              child: Text(studentAnswer, style: TextStyle(color: colors.textPrimary)),
            ),
          const SizedBox(height: 8),
          Text('Points: ${_parseNum(ans['points_earned']).toStringAsFixed(0)} / ${_parseNum(ans['points']).toStringAsFixed(0)}',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: colors.textSecondary)),
        ] else if (ans['question_type'] == 'true_false') ...[
          _answerRow(isCorrect ? LucideIcons.checkCircle : LucideIcons.alertCircle,
              'Your Answer', studentAnswer == 'true' ? 'True' : 'False',
              isCorrect ? AppTheme.primaryBlue : Colors.redAccent, colors),
          if (!isCorrect) ...[
            const SizedBox(height: 8),
            _answerRow(LucideIcons.checkCircle, 'Correct Answer', correctAnswer == 'true' ? 'True' : 'False', AppTheme.primaryBlue, colors),
          ],
        ] else ...[
          // MCQ options
          ...((ans['options'] as List?) ?? []).asMap().entries.map((entry) {
            final i = entry.key;
            final opt = entry.value;
            final letter = String.fromCharCode(65 + i);
            final isStudentChoice = studentAnswer == letter;
            final isCorrectChoice = correctAnswer == letter;

            Color bg = colors.surfaceLight;
            Color border = Colors.transparent;
            Color textColor = colors.textPrimary;
            String? tag;

            if (isCorrectChoice) {
              bg = AppTheme.primaryBlue.withValues(alpha: 0.1);
              border = AppTheme.primaryBlue.withValues(alpha: 0.4);
              textColor = AppTheme.primaryBlue;
              tag = '✓ Correct';
            } else if (isStudentChoice && !isCorrectChoice) {
              bg = Colors.redAccent.withValues(alpha: 0.1);
              border = Colors.redAccent.withValues(alpha: 0.4);
              textColor = Colors.redAccent;
              tag = 'Your answer';
            }

            return Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12), border: Border.all(color: border)),
              child: Row(children: [
                Text('$letter. ', style: TextStyle(fontWeight: FontWeight.bold, color: colors.textSecondary)),
                Expanded(child: Text(opt.toString(), style: TextStyle(color: textColor, fontWeight: isStudentChoice || isCorrectChoice ? FontWeight.bold : FontWeight.normal))),
                if (tag != null) Text(tag, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: textColor)),
              ]),
            );
          }),
        ],

        if (ans['explanation'] != null && ans['explanation'].toString().isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppTheme.primaryBlue.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.primaryBlue.withValues(alpha: 0.2))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Icon(LucideIcons.monitor, size: 14, color: AppTheme.primaryBlue),
                const SizedBox(width: 6),
                Text('EXPLANATION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue, letterSpacing: 1.2)),
              ]),
              const SizedBox(height: 6),
              Text(ans['explanation'].toString(), style: TextStyle(fontSize: 13, color: colors.textSecondary)),
            ]),
          ),
        ],

        const SizedBox(height: 8),
        Text('Points: ${_parseNum(ans['points_earned']).toStringAsFixed(0)} / ${_parseNum(ans['points']).toStringAsFixed(0)}',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: colors.textSecondary)),
      ]),
    );
  }

  Widget _answerRow(IconData icon, String label, String value, Color color, AppColors colors) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: color.withValues(alpha: 0.3))),
      child: Row(children: [
        Icon(icon, size: 18, color: color),
        const SizedBox(width: 10),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textHint)),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color)),
        ]),
      ]),
    );
  }

  List<Widget> _buildLeaderboard(AppColors colors) {
    if (_leaderboard.isEmpty) {
      return [Center(child: Padding(
        padding: const EdgeInsets.all(32),
        child: Text('No leaderboard data available.', style: TextStyle(color: colors.textSecondary)),
      ))];
    }

    return [
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(children: [
          SizedBox(width: 40, child: Text('Rank', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textHint, letterSpacing: 1))),
          Expanded(child: Text('Student', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textHint, letterSpacing: 1))),
          Text('Score', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textHint, letterSpacing: 1)),
        ]),
      ),
      ..._leaderboard.map((entry) {
        final isMe = entry['student_id'] == _result?['student_id'];
        return GlassContainer(
          backgroundColor: isMe ? AppTheme.primaryBlue.withValues(alpha: 0.1) : colors.card,
          borderColor: isMe ? AppTheme.primaryBlue.withValues(alpha: 0.3) : colors.borderSubtle,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(children: [
            SizedBox(width: 40, child: Text('#${entry['rank']}', style: TextStyle(fontWeight: FontWeight.w900, color: entry['rank'] == 1 ? Colors.amber : colors.textPrimary))),
            Expanded(child: Text(entry['student_name'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, color: colors.textPrimary), overflow: TextOverflow.ellipsis)),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text('${entry['percentage']}%', style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryBlue)),
              Text('${entry['score']}/${entry['total_points']}', style: TextStyle(fontSize: 10, color: colors.textHint)),
            ]),
          ]),
        );
      }),
    ];
  }
}
