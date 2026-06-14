import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../ui_helpers.dart';

class DoctorOverviewTab extends StatefulWidget {
  const DoctorOverviewTab({super.key});

  @override
  State<DoctorOverviewTab> createState() => _DoctorOverviewTabState();
}

class _DoctorOverviewTabState extends State<DoctorOverviewTab> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic> _stats = {};
  List<dynamic> _recentActivity = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchOverviewData();
  }

  Future<void> _fetchOverviewData() async {
    setState(() => _isLoading = true);
    try {
      final statsRes = await _apiService.dio.get('/doctor/stats');
      final activityRes = await _apiService.dio.get('/doctor/recent-activity');
      setState(() {
        _stats = statsRes.data ?? {};
        _recentActivity = activityRes.data ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final auth = context.watch<AuthProvider>();

    return RefreshIndicator(
      onRefresh: _fetchOverviewData,
      color: AppTheme.primary,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundImage: auth.student?['avatar_url'] != null
                      ? NetworkImage(auth.student!['avatar_url'])
                      : null,
                  backgroundColor: AppTheme.primary.withValues(alpha: 0.2),
                  child: auth.student?['avatar_url'] == null
                      ? const Icon(LucideIcons.user, color: AppTheme.primary)
                      : null,
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome back,',
                      style: TextStyle(color: colors.textSecondary, fontSize: 13),
                    ),
                    Text(
                      auth.studentName ?? 'Doctor',
                      style: TextStyle(
                        color: colors.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 28),
            const GradientText('Dashboard', fontSize: 28),
            const SizedBox(height: 20),

            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: CircularProgressIndicator(color: AppTheme.primary),
                ),
              )
            else ...[
              // Bento Stats Grid
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 1.3,
                children: [
                  _statsCard('Active Courses', '${_stats['courses'] ?? 0}',
                      LucideIcons.bookOpen, const Color(0xFF3498DB), colors),
                  _statsCard('Total Students', '${_stats['students'] ?? 0}',
                      LucideIcons.users, const Color(0xFF9B59B6), colors),
                  _statsCard('Active Quizzes', '${_stats['quizzes'] ?? 0}',
                      LucideIcons.helpCircle, const Color(0xFFE67E22), colors),
                  _statsCard('Resources', '${_stats['resources'] ?? 0}',
                      LucideIcons.fileText, const Color(0xFF2ECC71), colors),
                ],
              ),
              const SizedBox(height: 32),

              // Recent Activities
              Text(
                'Recent Activities',
                style: TextStyle(
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              if (_recentActivity.isEmpty)
                GlassContainer(
                  padding: const EdgeInsets.all(24),
                  child: Center(
                    child: Text(
                      'No recent activities recorded.',
                      style: TextStyle(color: colors.textSecondary, fontSize: 13),
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _recentActivity.length,
                  itemBuilder: (context, index) {
                    final act = _recentActivity[index];
                    return GlassContainer(
                      padding: const EdgeInsets.all(16),
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(LucideIcons.activity,
                                color: AppTheme.primary, size: 18),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  act['description'] ?? 'Activity',
                                  style: TextStyle(
                                    color: colors.textPrimary,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  act['created_at'] != null
                                      ? DateTime.parse(act['created_at'])
                                          .toLocal()
                                          .toString()
                                          .substring(0, 16)
                                      : 'Just now',
                                  style: TextStyle(
                                      color: colors.textSecondary, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _statsCard(String label, String value, IconData icon, Color color,
      AppColors colors) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      margin: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(label,
                    style: TextStyle(
                        color: colors.textSecondary,
                        fontSize: 11,
                        fontWeight: FontWeight.bold)),
              ),
              Icon(icon, color: color, size: 20),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              color: colors.textPrimary,
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
