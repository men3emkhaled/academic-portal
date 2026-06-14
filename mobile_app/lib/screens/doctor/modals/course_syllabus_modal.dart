import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme.dart';
import '../../../services/api_service.dart';

class CourseSyllabusModal extends StatefulWidget {
  final dynamic course;
  final ScrollController scrollController;

  const CourseSyllabusModal({
    super.key,
    required this.course,
    required this.scrollController,
  });

  @override
  State<CourseSyllabusModal> createState() => _CourseSyllabusModalState();
}

class _CourseSyllabusModalState extends State<CourseSyllabusModal> {
  final ApiService _apiService = ApiService();
  List<dynamic> _syllabus = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchSyllabus();
  }

  Future<void> _fetchSyllabus() async {
    setState(() => _isLoading = true);
    try {
      final res = await _apiService.dio
          .get('/doctor/course-progress/${widget.course['id']}');
      setState(() {
        _syllabus = res.data ?? [];
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleProgress(dynamic item) async {
    try {
      final isComp = item['is_completed'] == true || item['is_completed'] == 1;
      await _apiService.dio.patch(
          '/doctor/course-progress/${item['id']}/toggle',
          data: {'is_completed': !isComp});
      _fetchSyllabus();
    } catch (_) {}
  }

  void _addItemDialog() {
    final ctrl = TextEditingController();
    final colors = Theme.of(context).extension<AppColors>()!;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: colors.card,
        title: Text('Add Syllabus Item',
            style: TextStyle(color: colors.textPrimary)),
        content: TextField(
          controller: ctrl,
          decoration:
              const InputDecoration(hintText: 'e.g. Introduction to OOP'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            onPressed: () async {
              if (ctrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              await _apiService.dio.post('/doctor/course-progress', data: {
                'courseId': widget.course['id'],
                'title': ctrl.text.trim(),
              });
              _fetchSyllabus();
            },
            child: const Text('Add',
                style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
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
                color: colors.divider,
                borderRadius: BorderRadius.circular(2)),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Syllabus Tracker',
                  style: TextStyle(
                      color: colors.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.w900)),
              IconButton(
                icon: const Icon(LucideIcons.plus, color: AppTheme.primary),
                onPressed: _addItemDialog,
              ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppTheme.primary))
                : _syllabus.isEmpty
                    ? Center(
                        child: Text('No syllabus items defined.',
                            style:
                                TextStyle(color: colors.textSecondary)))
                    : ListView.builder(
                        controller: widget.scrollController,
                        itemCount: _syllabus.length,
                        itemBuilder: (context, index) {
                          final item = _syllabus[index];
                          final isComp = item['is_completed'] == true ||
                              item['is_completed'] == 1;
                          return Card(
                            color: colors.card,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: colors.borderSubtle),
                            ),
                            margin: const EdgeInsets.only(bottom: 12),
                            child: CheckboxListTile(
                              value: isComp,
                              onChanged: (_) => _toggleProgress(item),
                              title: Text(
                                item['title'] ?? '',
                                style: TextStyle(
                                  color: colors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                  decoration: isComp
                                      ? TextDecoration.lineThrough
                                      : null,
                                  fontSize: 14,
                                ),
                              ),
                              activeColor: AppTheme.primary,
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
