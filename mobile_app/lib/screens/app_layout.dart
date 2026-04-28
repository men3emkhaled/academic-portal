import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons/lucide_icons.dart';
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

  void _showMenuSheet() {
    final auth = context.read<AuthProvider>();
    final student = auth.student;
    final colors = Theme.of(context).extension<AppColors>()!;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
          decoration: BoxDecoration(
            color: colors.card,
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: colors.borderSubtle),
            boxShadow: [BoxShadow(color: colors.cardShadow, blurRadius: 40)],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(32),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
              child: SafeArea(
                top: false,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Drag handle
                    Container(
                      width: 40, height: 4, margin: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(color: colors.textHint, borderRadius: BorderRadius.circular(2)),
                    ),

                    // Header with user info
                    Container(
                      padding: const EdgeInsets.fromLTRB(20, 4, 16, 16),
                      decoration: BoxDecoration(
                        border: Border(bottom: BorderSide(color: colors.divider)),
                      ),
                      child: Row(children: [
                        Container(
                          width: 48, height: 48,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [AppTheme.primary, Color(0xFF5CA846)]),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Center(
                            child: ShaderMask(
                              shaderCallback: (b) => const LinearGradient(colors: [Colors.white, AppTheme.primary]).createShader(b),
                              child: const Text('Z', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(tr(context, 'znu_menu'), style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: colors.textPrimary)),
                          if (student != null) ...[
                            Text(
                              student['name']?.toString().split(' ').take(2).join(' ') ?? '',
                              style: const TextStyle(fontSize: 14, color: AppTheme.primary, fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (student['email'] != null && student['email'].toString().isNotEmpty)
                              Text(
                                student['email'].toString(),
                                style: TextStyle(fontSize: 11, color: colors.textSecondary, fontWeight: FontWeight.w500),
                                overflow: TextOverflow.ellipsis,
                              ),
                          ],
                        ])),
                        IconButton(
                          icon: Icon(LucideIcons.x, color: colors.textSecondary, size: 20),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ]),
                    ),

                    // Menu Items
                    Flexible(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                        child: Column(children: [
                          _menuItem(ctx, LucideIcons.barChart2, tr(context, 'grades'), 3, colors),
                          _menuItem(ctx, LucideIcons.helpCircle, tr(context, 'quizzes'), 4, colors),
                          _menuItem(ctx, LucideIcons.map, tr(context, 'career_roadmap'), 5, colors),
                          _menuItem(ctx, LucideIcons.bell, tr(context, 'notifications'), 6, colors,
                              badge: context.watch<DataProvider>().notifications.where((n) => n['is_read'] != 1 && n['is_read'] != true).length),
                          _menuItem(ctx, LucideIcons.checkSquare, tr(context, 'my_tasks'), 7, colors),
                          _menuItem(ctx, LucideIcons.settings, tr(context, 'settings'), 8, colors),

                          if (student?['role'] == 'assistant' || student?['role'] == 'admin') ...[
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                              child: Divider(color: colors.divider),
                            ),
                            ListTile(
                              leading: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: Colors.amber.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                                child: const Icon(LucideIcons.shieldCheck, color: Colors.amber, size: 20),
                              ),
                              title: const Text('Admin Panel', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.amber, fontSize: 15)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              onTap: () async {
                                Navigator.pop(ctx);
                                final url = Uri.parse('https://znu-cs.online/admin');
                                if (await canLaunchUrl(url)) {
                                  await launchUrl(url, mode: LaunchMode.externalApplication);
                                }
                              },
                            ),
                          ],

                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                            child: Divider(color: colors.divider),
                          ),

                          // Logout
                          ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.redAccent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                              child: Icon(LucideIcons.logOut, color: Colors.redAccent, size: 20),
                            ),
                            title: Text(tr(context, 'logout'), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.redAccent, fontSize: 15)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            onTap: () {
                              Navigator.pop(ctx);
                              context.read<AuthProvider>().logout();
                              context.go('/login');
                            },
                          ),
                          const SizedBox(height: 8),
                        ]),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _menuItem(BuildContext ctx, IconData icon, String title, int index, AppColors colors, {int badge = 0}) {
    final bool isActive = _currentIndex == index;
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        leading: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isActive ? AppTheme.primary.withValues(alpha: 0.15) : colors.surfaceLight,
                borderRadius: BorderRadius.circular(12),
                border: isActive ? Border.all(color: AppTheme.primary.withValues(alpha: 0.3)) : null,
              ),
              child: Icon(icon, color: isActive ? AppTheme.primary : colors.textSecondary, size: 20),
            ),
            if (badge > 0)
              Positioned(
                top: -4, right: -4,
                child: Container(
                  width: 16, height: 16,
                  decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
                  child: Center(child: Text(badge > 9 ? '9+' : '$badge', style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.black))),
                ),
              ),
          ],
        ),
        title: Text(title, style: TextStyle(
          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          color: isActive ? AppTheme.primary : colors.textSecondary,
          fontSize: 15,
        )),
        trailing: isActive ? Icon(LucideIcons.chevronRight, color: AppTheme.primary, size: 20) : null,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: isActive ? BorderSide(color: AppTheme.primary.withValues(alpha: 0.2)) : BorderSide.none,
        ),
        tileColor: isActive ? AppTheme.primary.withValues(alpha: 0.08) : Colors.transparent,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
        onTap: () {
          setState(() => _currentIndex = index);
          Navigator.pop(ctx);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final int activeBottomIndex = _currentIndex >= 3 ? 3 : _currentIndex; // 3 = "More" pseudo index

    // Unread notification count for badge
    final unread = context.watch<DataProvider>().notifications
        .where((n) => n['is_read'] != 1 && n['is_read'] != true)
        .length;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _tabs,
      ),
      bottomNavigationBar: _BottomNav(
        currentIndex: activeBottomIndex,
        unread: unread,
        onTap: (i) {
          if (i == 3) {
            _showMenuSheet();
          } else {
            setState(() => _currentIndex = i);
          }
        },
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

// ── Custom animated bottom nav ──
class _BottomNav extends StatelessWidget {
  final int currentIndex;
  final int unread;
  final void Function(int) onTap;

  const _BottomNav({required this.currentIndex, required this.unread, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final items = [
      (LucideIcons.home, LucideIcons.home, tr(context, 'home')),
      (LucideIcons.calendar, LucideIcons.calendar, tr(context, 'timetable')),
      (LucideIcons.bookOpen, LucideIcons.bookOpen, tr(context, 'materials')),
      (LucideIcons.menu, LucideIcons.menu, tr(context, 'more')),
    ];

    return Container(
      padding: const EdgeInsets.only(bottom: 8, top: 4),
      decoration: BoxDecoration(
        color: colors.card,
        border: Border(top: BorderSide(color: colors.divider)),
        boxShadow: [BoxShadow(color: colors.cardShadow, blurRadius: 20, offset: const Offset(0, -4))],
      ),
      child: Row(
        children: List.generate(items.length, (i) {
          final (ico, activeIco, label) = items[i];
          final isActive = currentIndex == i;
          final showBadge = i == 3 && unread > 0;

          return Expanded(
            child: GestureDetector(
              onTap: () => onTap(i),
              behavior: HitTestBehavior.opaque,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Stack(clipBehavior: Clip.none, children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isActive ? AppTheme.primary.withValues(alpha: 0.15) : Colors.transparent,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(
                        isActive ? activeIco : ico,
                        color: isActive ? AppTheme.primary : colors.textSecondary,
                        size: 22,
                      ),
                    ),
                    if (showBadge)
                      Positioned(
                        top: -2, right: -2,
                        child: Container(
                          width: 14, height: 14,
                          decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
                          child: Center(child: Text(unread > 9 ? '9+' : '$unread',
                              style: const TextStyle(fontSize: 7, fontWeight: FontWeight.w900, color: Colors.black))),
                        ),
                      ),
                  ]),
                  const SizedBox(height: 4),
                  AnimatedDefaultTextStyle(
                    duration: const Duration(milliseconds: 200),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                      color: isActive ? AppTheme.primary : colors.textSecondary,
                    ),
                    child: Text(label),
                  ),
                ]),
              ),
            ),
          );
        }),
      ),
    );
  }
}
