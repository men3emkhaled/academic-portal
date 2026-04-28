import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_windowmanager/flutter_windowmanager.dart';
import '../services/api_service.dart';
import '../theme.dart';
import 'ui_helpers.dart';
import 'quiz_result_screen.dart';

class QuizScreen extends StatefulWidget {
  final dynamic quizId;
  final String? resumeAttemptId;

  const QuizScreen({super.key, required this.quizId, this.resumeAttemptId});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen>
    with TickerProviderStateMixin, WidgetsBindingObserver {
  bool _loading = true;
  bool _submitting = false;
  bool _hasSubmitted = false;
  int _warningsCount = 0;
  bool _isOfficial = false;
  Map<String, dynamic>? _quizData;
  int _currentIndex = 0;
  Map<dynamic, String> _answers = {};
  Map<dynamic, String> _writtenText = {};
  int _timeLeft = 0;
  Timer? _timer;
  dynamic _attemptId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _startQuiz();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    if (_isOfficial) {
      FlutterWindowManager.clearFlags(FlutterWindowManager.FLAG_SECURE);
    }
    _timer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (!_isOfficial || _hasSubmitted || _submitting) return;

    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive) {
      _warningsCount++;
      if (_warningsCount == 1) {
        // Show warning when they come back
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _showWarningDialog();
        });
      } else if (_warningsCount >= 2) {
        // Auto submit
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Colors.redAccent,
            content: Text(
              'Quiz auto-submitted due to strict mode violation (leaving app).',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        );
        _submitQuiz(isAutoSubmit: true);
      }
    }
  }

  void _showWarningDialog() {
    final colors = Theme.of(context).extension<AppColors>()!;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: GlassContainer(
          backgroundColor: colors.card,
          borderColor: Colors.redAccent.withValues(alpha: 0.4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                LucideIcons.alertTriangle,
                color: Colors.redAccent,
                size: 50,
              ),
              const SizedBox(height: 16),
              Text(
                'STRICT MODE WARNING',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: colors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'You have left the app. This is your first and final warning. If you leave again, your quiz will be automatically submitted.',
                style: TextStyle(
                  fontSize: 14,
                  color: colors.textSecondary,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () => Navigator.pop(ctx),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.redAccent,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'I Understand',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _startQuiz() async {
    try {
      final payload = widget.resumeAttemptId != null
          ? {'attempt_id': widget.resumeAttemptId}
          : {};
      final response = await ApiService().dio.post(
        '/quizzes/${widget.quizId}/start',
        data: payload,
      );
      final data = response.data;
      if (mounted) {
        setState(() {
          _quizData = data;
          _attemptId = data['attempt_id'];
          _timeLeft = data['remaining_seconds'] ?? 0;
          _isOfficial = data['is_official'] ?? false;
          _loading = false;
        });

        if (_isOfficial) {
          FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_SECURE);
        }

        _startTimer();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to start quiz: ${e.toString()}')),
        );
        Navigator.pop(context);
      }
    }
  }

  void _startTimer() {
    if (_timeLeft <= 0) return;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        _timeLeft--;
        if (_timeLeft <= 0) {
          _timer?.cancel();
          _submitQuiz(isAutoSubmit: true);
        }
      });
    });
  }

  String _formatTime(int seconds) {
    final mins = (seconds ~/ 60).toString().padLeft(2, '0');
    final secs = (seconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  Future<void> _saveAnswerToServer(dynamic questionId, String answer) async {
    try {
      await ApiService().dio.post(
        '/quizzes/attempts/$_attemptId/questions/$questionId/answer',
        data: {'answer': answer},
      );
    } catch (e) {
      debugPrint('Failed to save answer: $e');
    }
  }

  void _handleAnswerSelect(dynamic questionId, String answer) {
    setState(() => _answers[questionId] = answer);
    _saveAnswerToServer(questionId, answer);
  }

  Future<void> _saveWrittenAnswer(dynamic questionId) async {
    final text = _writtenText[questionId] ?? '';
    if (text.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please provide an answer')));
      return;
    }
    try {
      await ApiService().dio.post(
        '/quizzes/attempts/$_attemptId/questions/$questionId/answer',
        data: {'answer': text},
      );
      setState(() => _answers[questionId] = text);
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Colors.greenAccent,
            content: Text(
              'Answer saved',
              style: TextStyle(
                color: Colors.black,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        );
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Failed to save answer')));
    }
  }

  Future<void> _submitQuiz({bool isAutoSubmit = false}) async {
    if (_submitting || _hasSubmitted) return;
    setState(() {
      _submitting = true;
      _hasSubmitted = true;
    });
    _timer?.cancel();
    try {
      final response = await ApiService().dio.post(
        '/quizzes/attempts/$_attemptId/submit',
      );
      final data = response.data;
      if (mounted) {
        final isPending = data['status'] == 'pending_review';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.greenAccent,
            content: Text(
              isPending
                  ? 'Quiz submitted for review!'
                  : 'Quiz submitted! Score: ${data['percentage']}%',
              style: const TextStyle(
                color: Colors.black,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) =>
                QuizResultScreen(quizId: widget.quizId, attemptId: _attemptId),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Submission failed: $e')));
        setState(() {
          _hasSubmitted = false;
          _submitting = false;
        });
      }
    }
  }

  void _confirmSubmit() {
    final colors = Theme.of(context).extension<AppColors>()!;
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: GlassContainer(
          backgroundColor: colors.card,
          borderColor: AppTheme.primaryBlue.withValues(alpha: 0.4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                LucideIcons.alertTriangle,
                color: Colors.orangeAccent,
                size: 40,
              ),
              const SizedBox(height: 12),
              Text(
                'Submit Quiz?',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: colors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'You answered ${_answers.length} of ${_quizData!['questions'].length} questions.',
                style: TextStyle(fontSize: 14, color: colors.textSecondary),
                textAlign: TextAlign.center,
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
                          border: Border.all(color: colors.borderSubtle),
                          borderRadius: BorderRadius.circular(14),
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
                      onTap: () {
                        Navigator.pop(ctx);
                        _submitQuiz();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryBlue,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        alignment: Alignment.center,
                        child: const Text(
                          'Submit',
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
    final colors = Theme.of(context).extension<AppColors>()!;

    if (_loading) {
      return Scaffold(
        backgroundColor: colors.background,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(color: AppTheme.primaryBlue),
              const SizedBox(height: 16),
              Text(
                'Loading quiz...',
                style: TextStyle(
                  color: colors.textSecondary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_quizData == null ||
        (_quizData!['questions'] as List?)?.isEmpty == true) {
      return Scaffold(
        backgroundColor: colors.background,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                LucideIcons.alertCircle,
                color: colors.textSecondary,
                size: 48,
              ),
              const SizedBox(height: 16),
              Text(
                'No questions available',
                style: TextStyle(
                  color: colors.textPrimary,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryBlue,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Text(
                    'Back',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final questions = _quizData!['questions'] as List;
    final currentQ = questions[_currentIndex];
    final answeredCount = _answers.length;
    final progress = answeredCount / questions.length;
    final isLastQ = _currentIndex == questions.length - 1;
    final isTimeLow = _timeLeft > 0 && _timeLeft < 60;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header: Title + Timer
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: colors.card,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: colors.borderSubtle),
                      ),
                      child: Icon(
                        LucideIcons.arrowLeft,
                        color: colors.textPrimary,
                        size: 20,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        _quizData!['quiz_title'] ?? 'Quiz',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                          color: AppTheme.primaryBlue,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: isTimeLow
                          ? Colors.redAccent.withValues(alpha: 0.15)
                          : AppTheme.primaryBlue.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isTimeLow
                            ? Colors.redAccent.withValues(alpha: 0.4)
                            : AppTheme.primaryBlue.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          LucideIcons.clock,
                          size: 16,
                          color: isTimeLow
                              ? Colors.redAccent
                              : AppTheme.primaryBlue,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _formatTime(_timeLeft),
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 15,
                            color: isTimeLow
                                ? Colors.redAccent
                                : AppTheme.primaryBlue,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Progress
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${_currentIndex + 1} / ${questions.length}',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 28,
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                      Text(
                        'PROGRESS',
                        style: TextStyle(
                          color: colors.textHint,
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 6,
                      backgroundColor: colors.scoreBoxBg,
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        AppTheme.primaryBlue,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Question + Answers
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                children: [
                  // Question card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: colors.card,
                      borderRadius: BorderRadius.circular(20),
                      border: Border(
                        left: BorderSide(color: AppTheme.primaryBlue, width: 4),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          currentQ['question_text'] ?? '',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: colors.textPrimary,
                            height: 1.4,
                          ),
                        ),
                        if (currentQ['image_url'] != null &&
                            currentQ['image_url'].toString().isNotEmpty) ...[
                          const SizedBox(height: 12),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              currentQ['image_url'],
                              height: 180,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => Container(
                                height: 60,
                                alignment: Alignment.center,
                                child: Text(
                                  'Image not available',
                                  style: TextStyle(color: colors.textHint),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Answer options
                  if (currentQ['question_type'] == 'true_false')
                    ..._buildTrueFalse(currentQ, colors),
                  if (currentQ['question_type'] == 'mcq')
                    ..._buildMCQ(currentQ, colors),
                  if (currentQ['question_type'] == 'written')
                    _buildWritten(currentQ, colors),

                  const SizedBox(height: 24),

                  // Navigation buttons
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: _currentIndex > 0
                              ? () => setState(() => _currentIndex--)
                              : null,
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              color: _currentIndex > 0
                                  ? colors.card
                                  : colors.surfaceLight,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: colors.borderSubtle),
                            ),
                            alignment: Alignment.center,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  LucideIcons.arrowLeft,
                                  size: 18,
                                  color: _currentIndex > 0
                                      ? colors.textPrimary
                                      : colors.textHint,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Previous',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: _currentIndex > 0
                                        ? colors.textPrimary
                                        : colors.textHint,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: GestureDetector(
                          onTap: isLastQ
                              ? (_submitting ? null : _confirmSubmit)
                              : () => setState(() => _currentIndex++),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              color: isLastQ
                                  ? Colors.orangeAccent
                                  : AppTheme.primaryBlue,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color:
                                      (isLastQ
                                              ? Colors.orangeAccent
                                              : AppTheme.primaryBlue)
                                          .withValues(alpha: 0.4),
                                  blurRadius: 15,
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: _submitting
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.black,
                                    ),
                                  )
                                : Text(
                                    isLastQ ? 'SUBMIT' : 'Next →',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w900,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  if (!isLastQ) ...[
                    const SizedBox(height: 8),
                    Center(
                      child: GestureDetector(
                        onTap: () => setState(() => _currentIndex++),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Text(
                            'Skip for now',
                            style: TextStyle(
                              color: colors.textHint,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),

                  // Question dots
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 6,
                    runSpacing: 6,
                    children: List.generate(questions.length, (i) {
                      final q = questions[i];
                      final isAnswered = _answers.containsKey(q['id']);
                      final isCurrent = i == _currentIndex;
                      return GestureDetector(
                        onTap: () => setState(() => _currentIndex = i),
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: isCurrent
                                ? AppTheme.primaryBlue
                                : isAnswered
                                ? AppTheme.primaryBlue.withValues(alpha: 0.2)
                                : colors.card,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isCurrent
                                  ? AppTheme.primaryBlue
                                  : isAnswered
                                  ? AppTheme.primaryBlue
                                  : colors.borderSubtle,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '${i + 1}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                              color: isCurrent
                                  ? Colors.black
                                  : isAnswered
                                  ? AppTheme.primaryBlue
                                  : colors.textSecondary,
                            ),
                          ),
                        ),
                      );
                    }),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildTrueFalse(Map<String, dynamic> q, AppColors colors) {
    return ['true', 'false'].map((option) {
      final isSelected = _answers[q['id']] == option;
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: GestureDetector(
          onTap: () => _handleAnswerSelect(q['id'], option),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppTheme.primaryBlue.withValues(alpha: 0.1)
                  : colors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? AppTheme.primaryBlue : colors.borderSubtle,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  option[0].toUpperCase() + option.substring(1),
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: isSelected
                        ? FontWeight.bold
                        : FontWeight.normal,
                    color: isSelected
                        ? AppTheme.primaryBlue
                        : colors.textPrimary,
                  ),
                ),
                if (isSelected)
                  Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      color: AppTheme.primaryBlue,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      LucideIcons.check,
                      size: 16,
                      color: Colors.black,
                    ),
                  ),
              ],
            ),
          ),
        ),
      );
    }).toList();
  }

  List<Widget> _buildMCQ(Map<String, dynamic> q, AppColors colors) {
    final options = (q['options'] as List?) ?? [];
    return List.generate(options.length, (i) {
      final letter = String.fromCharCode(65 + i);
      final isSelected = _answers[q['id']] == letter;
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: GestureDetector(
          onTap: () => _handleAnswerSelect(q['id'], letter),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppTheme.primaryBlue.withValues(alpha: 0.1)
                  : colors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? AppTheme.primaryBlue : colors.borderSubtle,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppTheme.primaryBlue
                        : AppTheme.primaryBlue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    letter,
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      color: isSelected ? Colors.black : colors.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    options[i].toString(),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.normal,
                      color: isSelected
                          ? AppTheme.primaryBlue
                          : colors.textPrimary,
                    ),
                  ),
                ),
                if (isSelected)
                  Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      color: AppTheme.primaryBlue,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      LucideIcons.check,
                      size: 16,
                      color: Colors.black,
                    ),
                  ),
              ],
            ),
          ),
        ),
      );
    });
  }

  Widget _buildWritten(Map<String, dynamic> q, AppColors colors) {
    return GlassContainer(
      backgroundColor: colors.card,
      borderColor: AppTheme.primaryBlue.withValues(alpha: 0.2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Write your answer below',
            style: TextStyle(color: colors.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 12),
          TextField(
            maxLines: 5,
            style: TextStyle(color: colors.textPrimary),
            onChanged: (v) => _writtenText[q['id']] = v,
            controller: TextEditingController(
              text: _writtenText[q['id']] ?? '',
            ),
            decoration: InputDecoration(
              hintText: 'Type your answer here...',
              hintStyle: TextStyle(color: colors.textHint),
              filled: true,
              fillColor: colors.surfaceLight,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => _saveWrittenAnswer(q['id']),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: AppTheme.primaryBlue.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(LucideIcons.save, size: 16, color: AppTheme.primaryBlue),
                  const SizedBox(width: 8),
                  Text(
                    'Save Answer',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryBlue,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
