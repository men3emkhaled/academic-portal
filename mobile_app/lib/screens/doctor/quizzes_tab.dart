import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../theme.dart';
import '../../services/api_service.dart';
import '../ui_helpers.dart';
import 'modals/grade_attempt_modal.dart';

class DoctorQuizzesTab extends StatefulWidget {
  const DoctorQuizzesTab({super.key});

  @override
  State<DoctorQuizzesTab> createState() => _DoctorQuizzesTabState();
}

class _DoctorQuizzesTabState extends State<DoctorQuizzesTab> {
  final ApiService _apiService = ApiService();
  List<dynamic> _quizzes = [];
  List<dynamic> _pendingReviews = [];
  bool _isLoading = true;
  bool _isReviewTab = false;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final quizRes = await _apiService.dio.get('/doctor/quizzes');
      final reviewRes = await _apiService.dio.get('/doctor/reviews/pending');
      setState(() {
        _quizzes = quizRes.data ?? [];
        _pendingReviews = reviewRes.data ?? [];
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  void _openGradeModal(dynamic review) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (context, scrollController) => GradeAttemptModal(
          review: review,
          scrollController: scrollController,
          onComplete: () {
            Navigator.pop(context);
            _fetchData();
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: _fetchData,
        color: AppTheme.primary,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const GradientText('Quizzes & Tasks', fontSize: 28),
              const SizedBox(height: 16),

              // Segmented Control
              Container(
                height: 48,
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: colors.surfaceLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: colors.borderSubtle),
                ),
                child: Row(
                  children: [
                    _segment('Quizzes List', !_isReviewTab,
                        () => setState(() => _isReviewTab = false), colors),
                    _segment('Pending Reviews (${_pendingReviews.length})',
                        _isReviewTab,
                        () => setState(() => _isReviewTab = true), colors),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              if (_isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: CircularProgressIndicator(color: AppTheme.primary),
                  ),
                )
              else if (!_isReviewTab)
                _buildQuizzesList(colors)
              else
                _buildReviewsList(colors),
            ],
          ),
        ),
      ),
    );
  }

  Widget _segment(String label, bool isActive, VoidCallback onTap, AppColors colors) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: isActive ? AppTheme.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 12,
              color: isActive ? Colors.black : colors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuizzesList(AppColors colors) {
    if (_quizzes.isEmpty) {
      return GlassContainer(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Text('No quizzes created yet.',
              style: TextStyle(color: colors.textSecondary, fontSize: 13)),
        ),
      );
    }
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _quizzes.length,
      itemBuilder: (context, index) {
        final quiz = _quizzes[index];
        final isPub = quiz['is_published'] == true || quiz['is_published'] == 1;
        return GlassContainer(
          padding: const EdgeInsets.all(20),
          margin: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    quiz['course_name'] ?? 'Course',
                    style: const TextStyle(
                      color: AppTheme.primary,
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isPub
                          ? Colors.green.withValues(alpha: 0.15)
                          : Colors.orange.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      isPub ? 'Published' : 'Draft',
                      style: TextStyle(
                        color: isPub ? Colors.green : Colors.orange,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                quiz['title'] ?? 'Untitled Quiz',
                style: TextStyle(
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(LucideIcons.clock, color: colors.textSecondary, size: 14),
                  const SizedBox(width: 6),
                  Text('${quiz['time_limit_minutes'] ?? 0} Mins',
                      style:
                          TextStyle(color: colors.textSecondary, fontSize: 12)),
                  const SizedBox(width: 16),
                  Icon(LucideIcons.award, color: colors.textSecondary, size: 14),
                  const SizedBox(width: 6),
                  Text('Pass: ${quiz['passing_score'] ?? 0}%',
                      style:
                          TextStyle(color: colors.textSecondary, fontSize: 12)),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildReviewsList(AppColors colors) {
    if (_pendingReviews.isEmpty) {
      return GlassContainer(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Text('No quiz attempts require grading.',
              style: TextStyle(color: colors.textSecondary, fontSize: 13)),
        ),
      );
    }
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _pendingReviews.length,
      itemBuilder: (context, index) {
        final review = _pendingReviews[index];
        return GlassContainer(
          padding: const EdgeInsets.all(18),
          margin: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundImage: review['avatar_url'] != null
                    ? NetworkImage(review['avatar_url'])
                    : null,
                child: review['avatar_url'] == null
                    ? const Icon(LucideIcons.user, size: 18)
                    : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      review['student_name'] ?? 'Student',
                      style: TextStyle(
                          color: colors.textPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Quiz: ${review['quiz_title'] ?? ''}',
                      style: TextStyle(color: colors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon:
                    const Icon(LucideIcons.edit3, color: AppTheme.primary),
                onPressed: () => _openGradeModal(review),
              ),
            ],
          ),
        );
      },
    );
  }
}
