import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme.dart';
import 'doctor/overview_tab.dart';
import 'doctor/courses_tab.dart';
import 'doctor/quizzes_tab.dart';
import 'doctor/attendance_tab.dart';
import 'doctor/settings_tab.dart';

export 'doctor/overview_tab.dart';
export 'doctor/courses_tab.dart';
export 'doctor/quizzes_tab.dart';
export 'doctor/attendance_tab.dart';
export 'doctor/settings_tab.dart';

class DoctorLayout extends StatefulWidget {
  const DoctorLayout({super.key});

  @override
  State<DoctorLayout> createState() => _DoctorLayoutState();
}

class _DoctorLayoutState extends State<DoctorLayout> {
  int _currentIndex = 0;

  static const List<Widget> _tabs = [
    DoctorOverviewTab(),
    DoctorCoursesTab(),
    DoctorQuizzesTab(),
    DoctorAttendanceTab(),
    DoctorSettingsTab(),
  ];

  static const List<_NavItem> _navItems = [
    _NavItem(LucideIcons.layoutDashboard, 'Overview'),
    _NavItem(LucideIcons.bookOpen, 'Courses'),
    _NavItem(LucideIcons.helpCircle, 'Quizzes'),
    _NavItem(LucideIcons.checkSquare, 'Attendance'),
    _NavItem(LucideIcons.user, 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    return Scaffold(
      backgroundColor: colors.background,
      body: Stack(
        children: [
          // Ambient background blobs
          Positioned(
            top: -100, left: -100,
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: colors.primary.withValues(alpha: 0.05),
              ),
            ),
          ),
          Positioned(
            bottom: -150, right: -100,
            child: Container(
              width: 400, height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: colors.primary.withValues(alpha: 0.08),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                Expanded(
                  child: IndexedStack(
                    index: _currentIndex,
                    children: _tabs,
                  ),
                ),
                _BottomNavbar(
                  currentIndex: _currentIndex,
                  items: _navItems,
                  onTap: (i) => setState(() => _currentIndex = i),
                  colors: colors,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Data class for nav items ──────────────────────────────
class _NavItem {
  final IconData icon;
  final String label;
  const _NavItem(this.icon, this.label);
}

// ── Bottom Navbar Widget ──────────────────────────────────
class _BottomNavbar extends StatelessWidget {
  final int currentIndex;
  final List<_NavItem> items;
  final ValueChanged<int> onTap;
  final AppColors colors;

  const _BottomNavbar({
    required this.currentIndex,
    required this.items,
    required this.onTap,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 72,
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.card.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colors.borderSubtle, width: 0.8),
        boxShadow: [
          BoxShadow(
            color: colors.cardShadow.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(items.length, (i) {
          final item = items[i];
          final isSelected = currentIndex == i;
          return GestureDetector(
            onTap: () => onTap(i),
            behavior: HitTestBehavior.opaque,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? colors.primary.withValues(alpha: 0.15)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    item.icon,
                    color: isSelected ? colors.primary : colors.textSecondary,
                    size: 22,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.label,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight:
                        isSelected ? FontWeight.w900 : FontWeight.normal,
                    color: isSelected ? colors.primary : colors.textSecondary,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}
