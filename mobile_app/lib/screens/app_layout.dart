import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'dart:ui';
import '../theme.dart';
import '../l10n/tr.dart';
import 'dashboard_screen.dart';
import 'timetable_tab.dart';
import 'materials_tab.dart';
import 'grades_tab.dart';
import 'extra_tabs.dart';
import 'course_registration_tab.dart';

import '../providers/data_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'ui_helpers.dart';
import 'package:go_router/go_router.dart';

class AppLayout extends StatefulWidget {
  const AppLayout({super.key});

  @override
  State<AppLayout> createState() => _AppLayoutState();
}

class _AppLayoutState extends State<AppLayout> with TickerProviderStateMixin {
  int _currentIndex = 0;

  final List<Widget> _tabs = [
    const DashboardScreen(),    // 0
    const TimetableTab(),       // 1
    const MaterialsTab(),       // 2
    const GradesTab(),          // 3
    const QuizzesTab(),         // 4
    const RoadmapTab(),         // 5
    const NotificationsTab(),   // 6
    const TasksTab(),           // 7
    const SettingsTab(),        // 8
    const MenuTab(),            // 9 — full-page menu
    const CourseRegistrationTab(), // 10
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkForceUpdate();
      final auth = context.read<AuthProvider>();
      final dataProvider = context.read<DataProvider>();
      dataProvider.fetchTimetable(auth.student?['department_id']);
      dataProvider.fetchGrades();
      dataProvider.fetchExtraModules();
      dataProvider.startGradePolling();
    });
  }

  Future<void> _checkForceUpdate() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;
      final response = await ApiService().dio.get('/app/version');
      final data = response.data;
      
      final latestVersion = data['latest_version'] ?? currentVersion;
      final forceUpdate = data['force_update'] == true;
      final apkUrl = data['apk_url'] ?? '';
      
      if (forceUpdate && _isNewerVersion(latestVersion, currentVersion)) {
        _showForceUpdateDialog(latestVersion, apkUrl);
      }
    } catch (_) {}
  }

  bool _isNewerVersion(String latest, String current) {
    final latestParts = latest.split('.').map(int.parse).toList();
    final currentParts = current.split('.').map(int.parse).toList();
    for (int i = 0; i < latestParts.length; i++) {
      if (i >= currentParts.length) return true;
      if (latestParts[i] > currentParts[i]) return true;
      if (latestParts[i] < currentParts[i]) return false;
    }
    return false;
  }

  void _showForceUpdateDialog(String version, String apkUrl) {
    final colors = Theme.of(context).extension<AppColors>()!;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => PopScope(
        canPop: false,
        child: Dialog(
          backgroundColor: Colors.transparent,
          child: GlassContainer(
            backgroundColor: colors.card,
            borderColor: Colors.redAccent.withValues(alpha: 0.4),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.redAccent.withValues(alpha: 0.2), Colors.transparent],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  child: Column(children: [
                    const Icon(LucideIcons.alertTriangle, color: Colors.redAccent, size: 40),
                    const SizedBox(height: 12),
                    Text('Mandatory Update', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: colors.textPrimary)),
                    const SizedBox(height: 4),
                    Text('v$version is required to continue', style: TextStyle(fontSize: 14, color: Colors.redAccent, fontWeight: FontWeight.bold)),
                  ]),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(children: [
                    Text('This version contains critical updates. Please download the latest version to continue using the portal.',
                      style: TextStyle(fontSize: 13, color: colors.textSecondary, height: 1.4), textAlign: TextAlign.center),
                    const SizedBox(height: 20),
                    GestureDetector(
                      onTap: () async {
                        if (apkUrl.isNotEmpty) {
                          try {
                            final uri = Uri.parse(apkUrl);
                            await launchUrl(uri, mode: LaunchMode.externalApplication);
                          } catch (_) {}
                        }
                      },
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(color: Colors.redAccent, borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: Colors.redAccent.withValues(alpha: 0.4), blurRadius: 15)]),
                        alignment: Alignment.center,
                        child: const Text('Download Update', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
                      ),
                    ),
                  ]),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Bottom nav items (main 4 visible + a "More" button)
  static const List<_NavItem> _primaryNav = [
    _NavItem(LucideIcons.home, LucideIcons.home, 'Home', 0),
    _NavItem(LucideIcons.calendar, LucideIcons.calendar, 'Timetable', 1),
    _NavItem(LucideIcons.bookOpen, LucideIcons.bookOpen, 'Materials', 2),
    _NavItem(LucideIcons.barChart2, LucideIcons.barChart2, 'Grades', 3),
  ];



  @override
  Widget build(BuildContext context) {
    int activeBottomIndex;
    if (_currentIndex == 0) {
      activeBottomIndex = 0;
    } else if (_currentIndex == 1) {
      activeBottomIndex = 1;
    } else if (_currentIndex == 2) {
      activeBottomIndex = 2;
    } else if (_currentIndex == 6) {
      activeBottomIndex = 3;
    } else {
      activeBottomIndex = 4;
    }

    final unread = context.watch<DataProvider>().notifications
        .where((n) => n['is_read'] != 1 && n['is_read'] != true)
        .length;

    return NotificationListener<TabSwitchNotification>(
      onNotification: (notification) {
        setState(() => _currentIndex = notification.index);
        return true;
      },
      child: Scaffold(
        extendBody: true,
        body: IndexedStack(
          index: _currentIndex,
          children: _tabs,
        ),
        bottomNavigationBar: _BottomNav(
          currentIndex: activeBottomIndex,
          unread: unread,
          onTap: (i) {
            if (i == 0) {
              setState(() => _currentIndex = 0);
            } else if (i == 1) {
              setState(() => _currentIndex = 1);
            } else if (i == 2) {
              setState(() => _currentIndex = 2);
            } else if (i == 3) {
              setState(() => _currentIndex = 6); // Notifications tab index
            } else if (i == 4) {
              setState(() => _currentIndex = 9); // Menu tab index
            }
          },
        ),
      ),
    );
  }
}

// ── Immutable nav item spec ──
class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int index;
  const _NavItem(this.icon, this.activeIcon, this.label, this.index);
}

// ── Floating Glassmorphic Pill Nav Bar ──
class _BottomNav extends StatelessWidget {
  final int currentIndex;
  final int unread;
  final void Function(int) onTap;

  const _BottomNav({required this.currentIndex, required this.unread, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final isDark = colors.isDark;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    final items = [
      (LucideIcons.home,     tr(context, 'home')),
      (LucideIcons.calendar, tr(context, 'timetable')),
      (LucideIcons.bookOpen, tr(context, 'materials')),
      (LucideIcons.bell,     tr(context, 'notifications')),
      (LucideIcons.menu,     tr(context, 'more')),
    ];

    const double navHeight   = 66.0;
    const double pillVertPad = 8.0;
    const double pillHorzPad = 8.0;

    return Container(
      color: Colors.transparent,
      padding: EdgeInsets.only(
        bottom: bottomPadding + 16,
        left: 24,
        right: 24,
      ),
      child: SizedBox(
        height: navHeight,
        child: LayoutBuilder(
          builder: (context, constraints) {
            final double totalWidth = constraints.maxWidth;
            final double tabWidth   = totalWidth / items.length;

            return ClipRRect(
              borderRadius: BorderRadius.circular(navHeight / 2),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
                child: Container(
                  decoration: BoxDecoration(
                    color: isDark
                        ? const Color(0xFF0E0E14).withValues(alpha: 0.90)
                        : Colors.white.withValues(alpha: 0.92),
                    borderRadius: BorderRadius.circular(navHeight / 2),
                    border: Border.all(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.06)
                          : const Color(0xFFE2E4EA).withValues(alpha: 0.95),
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.45 : 0.09),
                        blurRadius: 36,
                        offset: const Offset(0, 14),
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      // ── Animated sliding selection pill ──
                      AnimatedPositioned(
                        duration: const Duration(milliseconds: 340),
                        curve: Curves.easeOutBack,
                        left:  currentIndex * tabWidth + pillHorzPad,
                        top:   pillVertPad,
                        width: tabWidth - (pillHorzPad * 2),
                        height: navHeight - (pillVertPad * 2),
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppTheme.primary,
                            borderRadius: BorderRadius.circular(navHeight),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primary.withValues(alpha: 0.38),
                                blurRadius: 18,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // ── Tab icons row ──
                      Row(
                        children: List.generate(items.length, (i) {
                          final (icon, _) = items[i];
                          final bool isActive = currentIndex == i;
                          final bool showBadge = i == 3 && unread > 0;

                          return Expanded(
                            child: GestureDetector(
                              onTap: () => onTap(i),
                              behavior: HitTestBehavior.opaque,
                              child: Center(
                                child: AnimatedScale(
                                  scale: isActive ? 1.12 : 0.92,
                                  duration: const Duration(milliseconds: 280),
                                  curve: Curves.easeOutBack,
                                  child: Stack(
                                    clipBehavior: Clip.none,
                                    children: [
                                      Icon(
                                        icon,
                                        size: 21,
                                        color: isActive
                                            ? Colors.black.withValues(alpha: 0.82)
                                            : isDark
                                                ? Colors.white.withValues(alpha: 0.35)
                                                : const Color(0xFF94A3B8),
                                      ),
                                      if (showBadge)
                                        Positioned(
                                          top: -4, right: -6,
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: isActive ? Colors.black.withValues(alpha: 0.7) : const Color(0xFFEF4444),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            constraints: const BoxConstraints(
                                              minWidth: 14,
                                              minHeight: 14,
                                            ),
                                            alignment: Alignment.center,
                                            child: Text(
                                              unread > 9 ? '9+' : '$unread',
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 8,
                                                fontWeight: FontWeight.w900,
                                              ),
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Full-page Menu Tab (replaces bottom sheet)
// ─────────────────────────────────────────────
class MenuTab extends StatelessWidget {
  const MenuTab({super.key});

  @override
  Widget build(BuildContext context) {
    final auth    = context.read<AuthProvider>();
    final student = auth.student;
    final colors  = Theme.of(context).extension<AppColors>()!;
    final isDark  = colors.isDark;
    final unread  = context.watch<DataProvider>()
        .notifications
        .where((n) => n['is_read'] != 1 && n['is_read'] != true)
        .length;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Hero header ──
              Container(
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Avatar
                    Container(
                      width: 64, height: 64,
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: colors.borderSubtle,
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                            blurRadius: 10, offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(8),
                      child: Image.asset(
                        'assets/logo.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                    const SizedBox(width: 16),

                    // Name + email
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tr(context, 'znu_menu'),
                            style: TextStyle(
                              fontSize: 12, fontWeight: FontWeight.w600,
                              letterSpacing: 0.8,
                              color: colors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          if (student != null)
                            Text(
                              student['name']?.toString().split(' ').take(2).join(' ') ?? '',
                              style: TextStyle(
                                fontSize: 20, fontWeight: FontWeight.w800,
                                color: colors.textPrimary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          if (student?['email'] != null && student!['email'].toString().isNotEmpty)
                            Text(
                              student['email'].toString(),
                              style: TextStyle(
                                fontSize: 12, color: colors.textSecondary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // ── Main navigation group ──
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _MenuGroup(
                  colors: colors,
                  isDark: isDark,
                  items: [
                    _MenuItem(LucideIcons.barChart2,    tr(context, 'grades'),         3),
                    _MenuItem(LucideIcons.helpCircle,   tr(context, 'quizzes'),        4),
                    _MenuItem(LucideIcons.map,          tr(context, 'career_roadmap'), 5),
                    _MenuItem(LucideIcons.checkSquare,  tr(context, 'my_tasks'),       7),
                    _MenuItem(LucideIcons.settings,     tr(context, 'settings'),       8),
                    _MenuItem(LucideIcons.bookOpen,     tr(context, 'course_registration'), 10),
                  ],
                ),
              ),

              // ── Admin Panel (role-gated) ──
              if (student?['role'] == 'assistant' || student?['role'] == 'admin') ...[
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _ActionTile(
                    icon: LucideIcons.shieldCheck,
                    label: 'Admin Panel',
                    color: const Color(0xFFF59E0B),
                    isDark: isDark,
                    onTap: () async {
                      final url = Uri.parse('https://znu-cs.online/admin');
                      if (await canLaunchUrl(url)) {
                        await launchUrl(url, mode: LaunchMode.externalApplication);
                      }
                    },
                  ),
                ),
              ],

              // ── Logout ──
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _ActionTile(
                  icon: LucideIcons.logOut,
                  label: tr(context, 'logout'),
                  color: const Color(0xFFEF4444),
                  isDark: isDark,
                  onTap: () {
                    context.read<AuthProvider>().logout();
                    context.go('/login');
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Grouped menu card ──
class _MenuGroup extends StatelessWidget {
  final AppColors colors;
  final bool isDark;
  final List<_MenuItem> items;

  const _MenuGroup({required this.colors, required this.isDark, required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colors.borderSubtle),
        boxShadow: [
          BoxShadow(
            color: colors.cardShadow.withValues(alpha: 0.06),
            blurRadius: 16, offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: items.asMap().entries.map((entry) {
          final i    = entry.key;
          final item = entry.value;
          return Column(
            children: [
              _MenuRowTile(item: item, colors: colors),
              if (i < items.length - 1)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Divider(height: 1, color: colors.borderSubtle),
                ),
            ],
          );
        }).toList(),
      ),
    );
  }
}

// ── Single row inside group ──
class _MenuRowTile extends StatelessWidget {
  final _MenuItem item;
  final AppColors colors;

  const _MenuRowTile({required this.item, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () => TabSwitchNotification(item.tabIndex).dispatch(context),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
          child: Row(
            children: [
              Stack(clipBehavior: Clip.none, children: [
                Icon(item.icon, size: 20, color: colors.textSecondary),
                if (item.badge > 0)
                  Positioned(
                    top: -4, right: -6,
                    child: Container(
                      width: 16, height: 16,
                      decoration: const BoxDecoration(
                        color: AppTheme.primary, shape: BoxShape.circle,
                      ),
                      child: Center(child: Text(
                        item.badge > 9 ? '9+' : '${item.badge}',
                        style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.black),
                      )),
                    ),
                  ),
              ]),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  item.title,
                  style: TextStyle(
                    fontSize: 15, fontWeight: FontWeight.w500,
                    color: colors.textPrimary,
                  ),
                ),
              ),
              Icon(LucideIcons.chevronRight, size: 16, color: colors.textHint),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Standalone action tile (admin / logout) ──
class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.label,
    required this.color,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    return Container(
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.18)),
        boxShadow: [
          BoxShadow(
            color: colors.cardShadow.withValues(alpha: 0.06),
            blurRadius: 16, offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, size: 18, color: color),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 15, fontWeight: FontWeight.w600, color: color,
                    ),
                  ),
                ),
                Icon(LucideIcons.chevronRight, size: 16, color: color.withValues(alpha: 0.5)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Data model for menu item ──
class _MenuItem {
  final IconData icon;
  final String title;
  final int tabIndex;
  final int badge;

  const _MenuItem(this.icon, this.title, this.tabIndex, {this.badge = 0});
}

