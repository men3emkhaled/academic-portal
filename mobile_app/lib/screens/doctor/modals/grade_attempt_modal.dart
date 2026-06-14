import 'package:flutter/material.dart';
import '../../../theme.dart';
import '../../../services/api_service.dart';
import '../../ui_helpers.dart';

class GradeAttemptModal extends StatefulWidget {
  final dynamic review;
  final ScrollController scrollController;
  final VoidCallback onComplete;

  const GradeAttemptModal({
    super.key,
    required this.review,
    required this.scrollController,
    required this.onComplete,
  });

  @override
  State<GradeAttemptModal> createState() => _GradeAttemptModalState();
}

class _GradeAttemptModalState extends State<GradeAttemptModal> {
  final ApiService _apiService = ApiService();
  List<dynamic> _answers = [];
  bool _isLoading = true;
  bool _isSubmitting = false;
  final Map<dynamic, double> _grades = {};

  @override
  void initState() {
    super.initState();
    _fetchAttemptDetails();
  }

  Future<void> _fetchAttemptDetails() async {
    setState(() => _isLoading = true);
    try {
      final res = await _apiService.dio.get(
          '/doctor/reviews/attempts/${widget.review['attempt_id']}');
      setState(() {
        _answers = res.data ?? [];
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitGrades() async {
    setState(() => _isSubmitting = true);
    try {
      for (final ans in _answers) {
        final score = _grades[ans['answer_id']] ?? 0.0;
        await _apiService.dio.patch(
            '/doctor/reviews/answers/${ans['answer_id']}/grade',
            data: {'points_earned': score});
      }
      widget.onComplete();
    } catch (_) {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    return Container(
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        border: Border.all(color: colors.borderSubtle),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
                color: colors.divider, borderRadius: BorderRadius.circular(2)),
          ),
          const SizedBox(height: 20),
          Text('Grade Submission',
              style: TextStyle(
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(widget.review['student_name'] ?? '',
              style: TextStyle(color: colors.textSecondary, fontSize: 13)),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppTheme.primary))
                : _answers.isEmpty
                    ? Center(
                        child: Text('No answers to review.',
                            style: TextStyle(color: colors.textSecondary)))
                    : ListView.builder(
                        controller: widget.scrollController,
                        itemCount: _answers.length,
                        itemBuilder: (context, index) {
                          final ans = _answers[index];
                          return GlassContainer(
                            padding: const EdgeInsets.all(16),
                            margin: const EdgeInsets.only(bottom: 16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Question:',
                                    style: TextStyle(
                                        color: colors.textSecondary,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text(ans['question_text'] ?? '',
                                    style: TextStyle(
                                        color: colors.textPrimary,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold)),
                                const SizedBox(height: 10),
                                Text('Student Answer:',
                                    style: TextStyle(
                                        color: colors.textSecondary,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text(ans['student_answer'] ?? '',
                                    style: TextStyle(
                                        color: colors.textPrimary,
                                        fontSize: 13)),
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    Text(
                                      'Grade (Max ${ans['points'] ?? 0}):',
                                      style: TextStyle(
                                          color: colors.textPrimary,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(width: 12),
                                    SizedBox(
                                      width: 80,
                                      height: 40,
                                      child: TextField(
                                        decoration: const InputDecoration(
                                          contentPadding:
                                              EdgeInsets.symmetric(
                                                  horizontal: 8, vertical: 4),
                                        ),
                                        keyboardType: TextInputType.number,
                                        onChanged: (val) {
                                          _grades[ans['answer_id']] =
                                              double.tryParse(val) ?? 0.0;
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submitGrades,
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 50),
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.black,
            ),
            child: _isSubmitting
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2.5, color: Colors.black))
                : const Text('Submit Grades',
                    style: TextStyle(fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }
}
