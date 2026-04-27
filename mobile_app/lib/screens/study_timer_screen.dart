import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme.dart';
import 'ui_helpers.dart';
import '../l10n/tr.dart';

class StudyTimerScreen extends StatefulWidget {
  const StudyTimerScreen({super.key});

  @override
  State<StudyTimerScreen> createState() => _StudyTimerScreenState();
}

class _StudyTimerScreenState extends State<StudyTimerScreen> with TickerProviderStateMixin {
  // Timer config
  static const int focusDuration = 25 * 60; // 25 min
  static const int shortBreak = 5 * 60;     // 5 min
  static const int longBreak = 15 * 60;     // 15 min

  int _timeRemaining = focusDuration;
  int _totalDuration = focusDuration;
  bool _isRunning = false;
  bool _isFocus = true;
  int _completedSessions = 0;
  int _todayMinutes = 0;
  Timer? _timer;

  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _pulseAnim = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );
    _pulseCtrl.repeat(reverse: true);
    _loadTodayStats();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadTodayStats() async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateTime.now().toIso8601String().split('T')[0];
    final savedDate = prefs.getString('study_date') ?? '';
    if (savedDate == today) {
      setState(() {
        _todayMinutes = prefs.getInt('study_minutes') ?? 0;
        _completedSessions = prefs.getInt('study_sessions') ?? 0;
      });
    } else {
      // Reset for new day
      await prefs.setString('study_date', today);
      await prefs.setInt('study_minutes', 0);
      await prefs.setInt('study_sessions', 0);
    }
  }

  Future<void> _saveTodayStats() async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateTime.now().toIso8601String().split('T')[0];
    await prefs.setString('study_date', today);
    await prefs.setInt('study_minutes', _todayMinutes);
    await prefs.setInt('study_sessions', _completedSessions);
  }

  void _startTimer() {
    setState(() => _isRunning = true);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeRemaining > 0) {
        setState(() => _timeRemaining--);
        // Track focus time
        if (_isFocus) {
          _todayMinutes = (focusDuration - _timeRemaining) ~/ 60 + (_completedSessions * 25);
        }
      } else {
        _timer?.cancel();
        _onTimerComplete();
      }
    });
  }

  void _pauseTimer() {
    _timer?.cancel();
    setState(() => _isRunning = false);
  }

  void _resetTimer() {
    _timer?.cancel();
    setState(() {
      _isRunning = false;
      _isFocus = true;
      _timeRemaining = focusDuration;
      _totalDuration = focusDuration;
    });
  }

  void _onTimerComplete() {
    if (_isFocus) {
      setState(() {
        _completedSessions++;
        _todayMinutes = _completedSessions * 25;
      });
      _saveTodayStats();

      // Switch to break
      final isLongBreak = _completedSessions % 4 == 0;
      setState(() {
        _isFocus = false;
        _timeRemaining = isLongBreak ? longBreak : shortBreak;
        _totalDuration = isLongBreak ? longBreak : shortBreak;
        _isRunning = false;
      });
    } else {
      // Switch back to focus
      setState(() {
        _isFocus = true;
        _timeRemaining = focusDuration;
        _totalDuration = focusDuration;
        _isRunning = false;
      });
    }
  }

  void _selectMode(bool focus) {
    if (_isRunning) return;
    setState(() {
      _isFocus = focus;
      _timeRemaining = focus ? focusDuration : shortBreak;
      _totalDuration = focus ? focusDuration : shortBreak;
    });
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final progress = _totalDuration > 0 ? (_totalDuration - _timeRemaining) / _totalDuration : 0.0;
    final accentColor = _isFocus ? AppTheme.primaryBlue : const Color(0xFF5CA846);

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 24, 0),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(LucideIcons.arrowLeft, color: colors.textPrimary),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Spacer(),
                  GradientText(tr(context, 'study_timer'), fontSize: 24),
                  const Spacer(),
                  const SizedBox(width: 48),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    // Mode Selector
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: colors.surfaceLight,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: colors.borderSubtle),
                      ),
                      child: Row(children: [
                        _modeTab(tr(context, 'focus'), _isFocus, () => _selectMode(true), accentColor, colors),
                        _modeTab(tr(context, 'break_label'), !_isFocus, () => _selectMode(false), const Color(0xFF5CA846), colors),
                      ]),
                    ),

                    const SizedBox(height: 40),

                    // Timer Circle
                    ScaleTransition(
                      scale: _isRunning ? _pulseAnim : const AlwaysStoppedAnimation(1.0),
                      child: SizedBox(
                        width: 260,
                        height: 260,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Background glow
                            Container(
                              width: 260, height: 260,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                boxShadow: _isRunning ? [
                                  BoxShadow(color: accentColor.withValues(alpha: 0.2), blurRadius: 40, spreadRadius: 10),
                                ] : [],
                              ),
                            ),
                            // Progress ring
                            SizedBox(
                              width: 240, height: 240,
                              child: CustomPaint(
                                painter: _TimerPainter(
                                  progress: progress,
                                  color: accentColor,
                                  bgColor: colors.surfaceLight,
                                ),
                              ),
                            ),
                            // Inner circle
                            Container(
                              width: 200, height: 200,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: colors.card,
                                border: Border.all(color: colors.borderSubtle),
                                boxShadow: [BoxShadow(color: colors.cardShadow, blurRadius: 20)],
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    _isFocus ? '🎯' : '☕',
                                    style: const TextStyle(fontSize: 28),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _formatTime(_timeRemaining),
                                    style: TextStyle(
                                      fontSize: 48,
                                      fontWeight: FontWeight.w900,
                                      color: colors.textPrimary,
                                      letterSpacing: 2,
                                    ),
                                  ),
                                  Text(
                                    _isFocus ? tr(context, 'focus').toUpperCase() : tr(context, 'break_label').toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w900,
                                      color: accentColor,
                                      letterSpacing: 3,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 40),

                    // Controls
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Reset
                        GestureDetector(
                          onTap: _resetTimer,
                          child: Container(
                            width: 56, height: 56,
                            decoration: BoxDecoration(
                              color: colors.surfaceLight,
                              shape: BoxShape.circle,
                              border: Border.all(color: colors.borderSubtle),
                            ),
                            child: Icon(LucideIcons.rotateCcw, color: colors.textSecondary, size: 22),
                          ),
                        ),
                        const SizedBox(width: 20),
                        // Play/Pause
                        GestureDetector(
                          onTap: _isRunning ? _pauseTimer : _startTimer,
                          child: Container(
                            width: 80, height: 80,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(colors: [accentColor, accentColor.withValues(alpha: 0.7)]),
                              shape: BoxShape.circle,
                              boxShadow: [BoxShadow(color: accentColor.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 6))],
                            ),
                            child: Icon(
                              _isRunning ? LucideIcons.pause : LucideIcons.play,
                              color: Colors.black,
                              size: 32,
                            ),
                          ),
                        ),
                        const SizedBox(width: 20),
                        // Skip
                        GestureDetector(
                          onTap: () {
                            _timer?.cancel();
                            _onTimerComplete();
                          },
                          child: Container(
                            width: 56, height: 56,
                            decoration: BoxDecoration(
                              color: colors.surfaceLight,
                              shape: BoxShape.circle,
                              border: Border.all(color: colors.borderSubtle),
                            ),
                            child: Icon(LucideIcons.skipForward, color: colors.textSecondary, size: 22),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 40),

                    // Today's Stats
                    GlassContainer(
                      backgroundColor: colors.card,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(tr(context, 'todays_progress'), style: TextStyle(color: accentColor, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1.5)),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              _statBox(LucideIcons.flame, '$_completedSessions', tr(context, 'sessions'), accentColor, colors),
                              const SizedBox(width: 12),
                              _statBox(LucideIcons.clock, '$_todayMinutes', tr(context, 'minutes'), accentColor, colors),
                              const SizedBox(width: 12),
                              _statBox(LucideIcons.trophy, '${(_todayMinutes / 60).toStringAsFixed(1)}', tr(context, 'hours'), accentColor, colors),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Session indicators
                    GlassContainer(
                      backgroundColor: colors.card,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(tr(context, 'sessions').toUpperCase(), style: TextStyle(color: colors.textSecondary, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1.5)),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(4, (i) {
                              final done = i < (_completedSessions % 4);
                              final current = i == (_completedSessions % 4) && _isFocus;
                              return Container(
                                width: 48, height: 48,
                                margin: const EdgeInsets.symmetric(horizontal: 8),
                                decoration: BoxDecoration(
                                  color: done
                                      ? accentColor.withValues(alpha: 0.2)
                                      : current
                                          ? accentColor.withValues(alpha: 0.1)
                                          : colors.surfaceLight,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: done ? accentColor : current ? accentColor.withValues(alpha: 0.5) : colors.borderSubtle,
                                    width: current ? 2 : 1,
                                  ),
                                ),
                                child: Center(
                                  child: done
                                      ? Icon(LucideIcons.check, color: accentColor, size: 20)
                                      : Text('${i + 1}', style: TextStyle(color: colors.textSecondary, fontWeight: FontWeight.bold)),
                                ),
                              );
                            }),
                          ),
                          const SizedBox(height: 8),
                          Center(
                            child: Text(
                              tr(context, 'complete_4_sessions'),
                              style: TextStyle(fontSize: 12, color: colors.textHint),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _modeTab(String label, bool active, VoidCallback onTap, Color color, AppColors colors) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: active ? color.withValues(alpha: 0.15) : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            border: active ? Border.all(color: color.withValues(alpha: 0.3)) : null,
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 14,
                color: active ? color : colors.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _statBox(IconData icon, String value, String label, Color color, AppColors colors) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: colors.surfaceLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: colors.borderSubtle),
        ),
        child: Column(children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: colors.textPrimary)),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1)),
        ]),
      ),
    );
  }
}

// Custom painter for the circular progress ring
class _TimerPainter extends CustomPainter {
  final double progress;
  final Color color;
  final Color bgColor;

  _TimerPainter({required this.progress, required this.color, required this.bgColor});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    const strokeWidth = 8.0;

    // Background circle
    final bgPaint = Paint()
      ..color = bgColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius - strokeWidth / 2, bgPaint);

    // Progress arc
    final progressPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius - strokeWidth / 2),
      -pi / 2,
      2 * pi * progress,
      false,
      progressPaint,
    );

    // Dot at the end of progress
    if (progress > 0) {
      final dotAngle = -pi / 2 + 2 * pi * progress;
      final dotX = center.dx + (radius - strokeWidth / 2) * cos(dotAngle);
      final dotY = center.dy + (radius - strokeWidth / 2) * sin(dotAngle);

      canvas.drawCircle(
        Offset(dotX, dotY),
        6,
        Paint()..color = color,
      );

      canvas.drawCircle(
        Offset(dotX, dotY),
        10,
        Paint()..color = color.withValues(alpha: 0.2),
      );
    }
  }

  @override
  bool shouldRepaint(covariant _TimerPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
