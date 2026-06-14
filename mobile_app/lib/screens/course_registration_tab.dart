import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../theme.dart';
import '../l10n/tr.dart';
import 'ui_helpers.dart';

class CourseRegistrationTab extends StatefulWidget {
  const CourseRegistrationTab({super.key});

  @override
  State<CourseRegistrationTab> createState() => _CourseRegistrationTabState();
}

class _CourseRegistrationTabState extends State<CourseRegistrationTab> with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  bool _isLoading = false;

  List<dynamic> _availableCourses = [];
  List<dynamic> _registeredCourses = [];
  Map<String, dynamic> _summary = {};
  
  // Tab controller for Available vs Enrolled
  late TabController _tabController;

  // Selected courses for bulk registration
  final Set<int> _selectedAvailableCourseIds = {};

  // Search filter
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    
    try {
      final availableRes = await _apiService.dio.get('/student/registration/available-courses');
      final registeredRes = await _apiService.dio.get('/student/registration/my-courses');
      
      if (mounted) {
        setState(() {
          _availableCourses = availableRes.data ?? [];
          _registeredCourses = registeredRes.data['courses'] ?? [];
          _summary = registeredRes.data['summary'] ?? {};
          _selectedAvailableCourseIds.clear();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "${tr(context, 'error')}: $e",
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<void> _registerSingle(int courseId) async {
    final auth = context.read<AuthProvider>();
    final dataProvider = context.read<DataProvider>();
    setState(() => _isLoading = true);
    try {
      await _apiService.dio.post('/student/registration/register', data: {'course_id': courseId});
      
      // Refresh global provider data so that student timetable/grades/materials get updated
      await dataProvider.fetchTimetable(auth.student?['department_id']);
      await dataProvider.fetchGrades();
      await dataProvider.fetchExtraModules();

      await _fetchData();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registered successfully!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to register: $e', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<void> _registerBulk() async {
    if (_selectedAvailableCourseIds.isEmpty) return;
    final auth = context.read<AuthProvider>();
    final dataProvider = context.read<DataProvider>();
    setState(() => _isLoading = true);
    try {
      await _apiService.dio.post('/student/registration/register-bulk', data: {
        'course_ids': _selectedAvailableCourseIds.toList(),
      });
      
      // Refresh global provider data
      await dataProvider.fetchTimetable(auth.student?['department_id']);
      await dataProvider.fetchGrades();
      await dataProvider.fetchExtraModules();

      await _fetchData();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Selected courses registered successfully!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Bulk registration failed: $e', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<void> _dropCourse(int courseId, String courseName) async {
    final colors = Theme.of(context).extension<AppColors>()!;
    final auth = context.read<AuthProvider>();
    final dataProvider = context.read<DataProvider>();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: colors.card,
        surfaceTintColor: Colors.transparent,
        title: Row(
          children: [
            const Icon(LucideIcons.alertTriangle, color: Colors.redAccent),
            const SizedBox(width: 8),
            Text('Drop Course', style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.w900)),
          ],
        ),
        content: Text(
          'Are you sure you want to drop "$courseName"? All grades recorded for this course will be permanently deleted!',
          style: TextStyle(color: colors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: TextStyle(color: colors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Drop', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isLoading = true);
    try {
      await _apiService.dio.delete('/student/registration/drop/$courseId');
      
      // Refresh global provider data
      await dataProvider.fetchTimetable(auth.student?['department_id']);
      await dataProvider.fetchGrades();
      await dataProvider.fetchExtraModules();

      await _fetchData();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Course dropped successfully.', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to drop course: $e', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final auth = context.watch<AuthProvider>();
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- Screen Title ---
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 24, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          isRtl ? LucideIcons.arrowRight : LucideIcons.arrowLeft,
                          color: colors.textPrimary,
                        ),
                        onPressed: () => TabSwitchNotification(9).dispatch(context),
                      ),
                      const SizedBox(width: 4),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          GradientText(tr(context, 'course_registration'), fontSize: 26),
                          const SizedBox(height: 4),
                          Text(
                            auth.student?['department_name'] ?? 'Department Plan',
                            style: TextStyle(color: colors.textSecondary, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (_isLoading)
                    const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2.5, color: AppTheme.primaryBlue),
                    )
                  else
                    IconButton(
                      icon: Icon(LucideIcons.refreshCw, color: colors.textSecondary, size: 20),
                      onPressed: _fetchData,
                    )
                ],
              ),
            ),

            // --- Custom Tab Bar ---
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Container(
                decoration: BoxDecoration(
                  color: colors.surfaceLight,
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.all(4),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    color: AppTheme.primaryBlue,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryBlue.withValues(alpha: 0.25),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: colors.isDark ? Colors.black : Colors.white,
                  unselectedLabelColor: colors.textSecondary,
                  labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  dividerColor: Colors.transparent,
                  tabs: const [
                    Tab(text: 'Available'),
                    Tab(text: 'Enrolled'),
                  ],
                ),
              ),
            ),

            // --- Search Field ---
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: GlassContainer(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                backgroundColor: colors.card,
                margin: EdgeInsets.zero,
                child: Row(
                  children: [
                    Icon(LucideIcons.search, color: colors.textSecondary, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        style: TextStyle(color: colors.textPrimary, fontSize: 14),
                        onChanged: (val) => setState(() => _searchQuery = val),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: isRtl ? 'ابحث عن مادة...' : 'Search courses...',
                          hintStyle: TextStyle(color: colors.textSecondary, fontSize: 14),
                          isDense: true,
                          filled: false,
                        ),
                      ),
                    ),
                    if (_searchQuery.isNotEmpty)
                      GestureDetector(
                        onTap: () => setState(() => _searchQuery = ''),
                        child: Icon(LucideIcons.x, color: colors.textSecondary, size: 16),
                      ),
                  ],
                ),
              ),
            ),

            // --- Tab Views ---
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildAvailableTab(colors),
                  _buildEnrolledTab(colors),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvailableTab(AppColors colors) {
    // Filter available list
    final filtered = _availableCourses.where((c) {
      final name = (c['name'] ?? '').toString().toLowerCase();
      final desc = (c['description'] ?? '').toString().toLowerCase();
      return name.contains(_searchQuery.toLowerCase()) || desc.contains(_searchQuery.toLowerCase());
    }).toList();

    // Group by Semester
    final sem1Courses = filtered.where((c) => c['semester'] == 1).toList();
    final sem2Courses = filtered.where((c) => c['semester'] == 2).toList();

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.bookOpen, size: 48, color: colors.textHint),
            const SizedBox(height: 12),
            Text('No available courses to register.', style: TextStyle(color: colors.textSecondary, fontSize: 15)),
          ],
        ),
      );
    }

    return Column(
      children: [
        Expanded(
          child: CustomScrollView(
            slivers: [
              if (sem1Courses.isNotEmpty) ...[
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
                  sliver: SliverToBoxAdapter(
                    child: _buildSemesterHeader('Semester 1', colors),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildAvailableCard(sem1Courses[index], colors),
                      childCount: sem1Courses.length,
                    ),
                  ),
                ),
              ],
              if (sem2Courses.isNotEmpty) ...[
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
                  sliver: SliverToBoxAdapter(
                    child: _buildSemesterHeader('Semester 2', colors),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildAvailableCard(sem2Courses[index], colors),
                      childCount: sem2Courses.length,
                    ),
                  ),
                ),
              ],
              const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
            ],
          ),
        ),
        
        // --- Bulk Register Floating Bar ---
        if (_selectedAvailableCourseIds.isNotEmpty)
          _buildBulkActionBar(colors),
      ],
    );
  }

  Widget _buildSemesterHeader(String title, AppColors colors) {
    return Row(
      children: [
        Container(width: 4, height: 16, decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 8),
        Text(title, style: TextStyle(color: colors.textPrimary, fontSize: 16, fontWeight: FontWeight.w900)),
      ],
    );
  }

  Widget _buildAvailableCard(dynamic course, AppColors colors) {
    final int id = course['id'];
    final bool isSelected = _selectedAvailableCourseIds.contains(id);
    final int creditHours = course['credit_hours'] ?? 3;
    final String deptCode = course['department_code'] ?? 'Shared';

    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      backgroundColor: isSelected ? AppTheme.primaryBlue.withValues(alpha: 0.08) : colors.card,
      borderColor: isSelected ? AppTheme.primaryBlue : colors.borderSubtle,
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Checkbox for bulk registration
          Checkbox(
            value: isSelected,
            activeColor: AppTheme.primaryBlue,
            onChanged: (val) {
              setState(() {
                if (val == true) {
                  _selectedAvailableCourseIds.add(id);
                } else {
                  _selectedAvailableCourseIds.remove(id);
                }
              });
            },
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  course['name'] ?? '',
                  style: TextStyle(color: colors.textPrimary, fontSize: 15, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: colors.surfaceLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '$creditHours Hrs',
                        style: TextStyle(color: colors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryBlue.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        deptCode,
                        style: const TextStyle(color: AppTheme.primaryBlue, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryBlue,
              foregroundColor: colors.isDark ? Colors.black : Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => _registerSingle(id),
            child: const Text('Add', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  Widget _buildBulkActionBar(AppColors colors) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: colors.card,
        border: Border(top: BorderSide(color: colors.divider, width: 1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: colors.isDark ? 0.4 : 0.05),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: Text(
                'Selected: ${_selectedAvailableCourseIds.length} course(s)',
                style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
            const SizedBox(width: 16),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                foregroundColor: colors.isDark ? Colors.black : Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _registerBulk,
              child: const Text('Register Selected', style: TextStyle(fontWeight: FontWeight.w900)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEnrolledTab(AppColors colors) {
    final filtered = _registeredCourses.where((c) {
      final name = (c['course_name'] ?? '').toString().toLowerCase();
      return name.contains(_searchQuery.toLowerCase());
    }).toList();

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.checkSquare, size: 48, color: colors.textHint),
            const SizedBox(height: 12),
            Text('No registered courses found.', style: TextStyle(color: colors.textSecondary, fontSize: 15)),
          ],
        ),
      );
    }

    return Column(
      children: [
        // --- Summary Card ---
        if (_summary.isNotEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            child: GlassContainer(
              padding: const EdgeInsets.all(16),
              backgroundColor: colors.surfaceLight,
              margin: EdgeInsets.zero,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildSummaryItem('Total Courses', '${_summary['total_courses'] ?? 0}', colors),
                  Container(width: 1, height: 32, color: colors.divider),
                  _buildSummaryItem('Total Credit Hours', '${_summary['total_credit_hours'] ?? 0}', colors),
                ],
              ),
            ),
          ),

        // --- Enrolled Courses List ---
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            itemCount: filtered.length,
            itemBuilder: (context, index) {
              final c = filtered[index];
              final int courseId = c['course_id'];
              final String courseName = c['course_name'] ?? '';
              final int creditHours = c['credit_hours'] ?? 3;
              final String semesterText = c['semester'] == 1 ? 'Semester 1' : 'Semester 2';

              return GlassContainer(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                backgroundColor: colors.card,
                margin: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            courseName,
                            style: TextStyle(color: colors.textPrimary, fontSize: 15, fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: colors.surfaceLight,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  '$creditHours Hrs',
                                  style: TextStyle(color: colors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: colors.surfaceLight,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  semesterText,
                                  style: TextStyle(color: colors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.trash2, color: Colors.redAccent, size: 20),
                      onPressed: () => _dropCourse(courseId, courseName),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryItem(String label, String value, AppColors colors) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: colors.textPrimary, fontSize: 18, fontWeight: FontWeight.w900)),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(color: colors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
