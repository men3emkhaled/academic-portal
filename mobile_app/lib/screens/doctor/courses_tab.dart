import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../theme.dart';
import '../../services/api_service.dart';
import '../ui_helpers.dart';
import 'modals/course_materials_modal.dart';
import 'modals/course_syllabus_modal.dart';

class DoctorCoursesTab extends StatefulWidget {
  const DoctorCoursesTab({super.key});

  @override
  State<DoctorCoursesTab> createState() => _DoctorCoursesTabState();
}

class _DoctorCoursesTabState extends State<DoctorCoursesTab> {
  final ApiService _apiService = ApiService();
  List<dynamic> _courses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    setState(() => _isLoading = true);
    try {
      final res = await _apiService.dio.get('/doctor/courses');
      setState(() {
        _courses = res.data ?? [];
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  void _viewMaterials(dynamic course) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.8,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (context, scrollController) => CourseMaterialsModal(
          course: course,
          scrollController: scrollController,
        ),
      ),
    );
  }

  void _viewSyllabus(dynamic course) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.8,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (context, scrollController) => CourseSyllabusModal(
          course: course,
          scrollController: scrollController,
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
        onRefresh: _fetchCourses,
        color: AppTheme.primary,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const GradientText('My Courses', fontSize: 28),
              const SizedBox(height: 6),
              Text(
                'Manage your course syllabus and student resources.',
                style: TextStyle(color: colors.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 24),
              if (_isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: CircularProgressIndicator(color: AppTheme.primary),
                  ),
                )
              else if (_courses.isEmpty)
                GlassContainer(
                  padding: const EdgeInsets.all(24),
                  child: Center(
                    child: Text(
                      'No assigned courses found.',
                      style: TextStyle(color: colors.textSecondary, fontSize: 13),
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _courses.length,
                  itemBuilder: (context, index) {
                    final course = _courses[index];
                    return GlassContainer(
                      padding: const EdgeInsets.all(20),
                      margin: const EdgeInsets.only(bottom: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppTheme.primary.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  course['code'] ?? 'CODE',
                                  style: const TextStyle(
                                    color: AppTheme.primary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                              Icon(LucideIcons.bookMarked,
                                  color: colors.textSecondary, size: 20),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            course['name'] ?? 'Course Name',
                            style: TextStyle(
                              color: colors.textPrimary,
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            course['description'] ?? 'No description provided.',
                            style:
                                TextStyle(color: colors.textSecondary, fontSize: 12),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  icon: const Icon(LucideIcons.fileText, size: 16),
                                  label: const Text('Materials'),
                                  style: ElevatedButton.styleFrom(
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 12),
                                    backgroundColor: colors.surfaceLight,
                                    foregroundColor: colors.textPrimary,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  onPressed: () => _viewMaterials(course),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: ElevatedButton.icon(
                                  icon: const Icon(LucideIcons.list, size: 16),
                                  label: const Text('Syllabus'),
                                  style: ElevatedButton.styleFrom(
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 12),
                                    backgroundColor: AppTheme.primary,
                                    foregroundColor: Colors.black,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  onPressed: () => _viewSyllabus(course),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
