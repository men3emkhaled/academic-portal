import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'ui_helpers.dart';

class CourseHubScreen extends StatefulWidget {
  final dynamic course;

  const CourseHubScreen({super.key, required this.course});

  @override
  State<CourseHubScreen> createState() => _CourseHubScreenState();
}

class _CourseHubScreenState extends State<CourseHubScreen> {
  bool _isLoading = true;
  String _activeTab = 'announcements';
  
  Map<String, dynamic>? _hubData;
  List<dynamic> _inquiries = [];

  // Support Form State
  String _inquiryType = 'question';
  final _subjectController = TextEditingController();
  final _contentController = TextEditingController();
  bool _isSubmitting = false;

  // Task Submission State
  final Map<int, TextEditingController> _submissionControllers = {};

  @override
  void initState() {
    super.initState();
    _fetchHubData();
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _contentController.dispose();
    for (var c in _submissionControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _fetchHubData() async {
    setState(() => _isLoading = true);
    try {
      final courseId = widget.course['course_id'];
      
      // Fetch Hub Data
      final hubRes = await ApiService().dio.get('/student/course/$courseId/hub');
      
      // Fetch Inquiries
      final inqRes = await ApiService().dio.get('/student/my-inquiries');
      final allInquiries = (inqRes.data as List<dynamic>?) ?? [];
      
      if (mounted) {
        setState(() {
          _hubData = hubRes.data;
          _inquiries = allInquiries.where((i) => i['course_id'].toString() == courseId.toString()).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load course hub data'), backgroundColor: Colors.redAccent),
        );
      }
    }
  }

  Future<void> _toggleTask(dynamic task, bool isComplete, {bool isSubmission = false}) async {
    try {
      final Map<String, dynamic> payload = {'is_completed': !isComplete};
      
      if (!isComplete && isSubmission) {
        final urlCtrl = _submissionControllers[task['id']];
        if (urlCtrl == null || urlCtrl.text.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please enter a submission link'), backgroundColor: Colors.redAccent),
          );
          return;
        }
        payload['submission_url'] = urlCtrl.text;
      }

      await ApiService().dio.patch('/official-tasks/${task['id']}/toggle', data: payload);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(isComplete ? 'Task unmarked' : 'Task completed successfully'), backgroundColor: Colors.green),
      );
      
      _fetchHubData(); // Refresh data
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update task'), backgroundColor: Colors.redAccent),
      );
    }
  }

  Future<void> _submitInquiry() async {
    if (_contentController.text.trim().isEmpty) return;
    
    setState(() => _isSubmitting = true);
    try {
      await ApiService().dio.post('/student/inquiries', data: {
        'course_id': widget.course['course_id'],
        'type': _inquiryType,
        'subject': _subjectController.text,
        'content': _contentController.text
      });
      
      _subjectController.clear();
      _contentController.clear();
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Message sent successfully'), backgroundColor: Colors.green),
      );
      
      _fetchHubData(); // Refresh to show new inquiry
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to send message'), backgroundColor: Colors.redAccent),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _openUrl(String url) async {
    try {
      final u = Uri.parse(url);
      await launchUrl(u, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }

  void _showQrModal(String qrToken, AppColors colors) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 32),
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: colors.borderSubtle),
          boxShadow: [BoxShadow(color: colors.cardShadow, blurRadius: 40)],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(32),
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                  child: const Icon(LucideIcons.qrCode, color: AppTheme.primaryBlue, size: 32),
                ),
                const SizedBox(height: 16),
                Text('Identity Pass', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: colors.textPrimary)),
                Text('Scan to verify presence', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.5)),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
                  child: QrImageView(
                    data: qrToken,
                    version: QrVersions.auto,
                    size: 220.0,
                    eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Colors.black),
                    dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Colors.black),
                  ),
                ),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(LucideIcons.lock, color: Colors.green, size: 16),
                      const SizedBox(width: 8),
                      const Text('SECURE ACCESS GRANTED', style: TextStyle(color: Colors.green, fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1)),
                    ],
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final auth = context.watch<AuthProvider>();

    if (_isLoading) {
      return Scaffold(
        backgroundColor: colors.background,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(icon: Icon(LucideIcons.arrowLeft, color: colors.textPrimary), onPressed: () => Navigator.pop(context)),
        ),
        body: const Center(child: CircularProgressIndicator(color: AppTheme.primaryBlue)),
      );
    }

    if (_hubData == null) {
      return Scaffold(
        backgroundColor: colors.background,
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: Center(child: Text('Data not found', style: TextStyle(color: colors.textSecondary))),
      );
    }

    final qrToken = _hubData!['qrToken'] ?? '';
    final announcements = _hubData!['announcements'] as List<dynamic>? ?? [];
    final progress = _hubData!['progress'] as List<dynamic>? ?? [];
    final tasks = _hubData!['tasks'] as List<dynamic>? ?? [];
    final attendance = _hubData!['attendance'] as List<dynamic>? ?? [];

    final attendedCount = attendance.where((a) => a['is_present'] == true || a['is_present'] == 1).length;
    final progressCompleted = progress.where((p) => p['is_completed'] == true || p['is_completed'] == 1).length;
    final progressTotal = progress.length;
    final progressPerc = progressTotal > 0 ? (progressCompleted / progressTotal * 100).round() : 0;

    final tabs = [
      {'id': 'announcements', 'label': 'News', 'icon': LucideIcons.megaphone, 'c': announcements.length},
      {'id': 'progress', 'label': 'Progress', 'icon': LucideIcons.listChecks, 'c': 0},
      {'id': 'tasks', 'label': 'Tasks', 'icon': LucideIcons.checkCircle2, 'c': tasks.length},
      {'id': 'attendance', 'label': 'Presence', 'icon': LucideIcons.users, 'c': 0},
      {'id': 'inquiries', 'label': 'Support', 'icon': LucideIcons.messageSquare, 'c': _inquiries.length},
    ];

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // App Bar
            SliverAppBar(
              backgroundColor: colors.background.withOpacity(0.9),
              pinned: true,
              elevation: 0,
              leading: IconButton(
                icon: Icon(LucideIcons.arrowLeft, color: colors.textPrimary),
                onPressed: () => Navigator.pop(context),
              ),
              title: const Text('Course Hub', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              centerTitle: true,
              actions: [
                if (qrToken.isNotEmpty)
                  IconButton(
                    icon: const Icon(LucideIcons.qrCode, color: AppTheme.primaryBlue),
                    onPressed: () => _showQrModal(qrToken, colors),
                  )
              ],
            ),
            
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // HERO CARD
                    GlassContainer(
                      backgroundColor: colors.card,
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 56, height: 56,
                                decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                                child: const Icon(LucideIcons.bookOpen, color: AppTheme.primaryBlue, size: 28),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                                      child: const Text('ACTIVE COURSE', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppTheme.primaryBlue, letterSpacing: 1.5)),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(widget.course['course_name'] ?? 'Unknown', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 22, color: colors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
                                  ],
                                ),
                              )
                            ],
                          ),
                          const SizedBox(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _buildHeroStat(LucideIcons.listChecks, 'Progress', '$progressPerc%', colors),
                              _buildHeroStat(LucideIcons.checkCircle2, 'Tasks', '${tasks.length}', colors, color: Colors.green),
                              _buildHeroStat(LucideIcons.users, 'Presence', '$attendedCount', colors, color: Colors.orangeAccent),
                            ],
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // TABS
                    SizedBox(
                      height: 48,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: tabs.length,
                        itemBuilder: (ctx, i) {
                          final t = tabs[i];
                          final active = _activeTab == t['id'];
                          return GestureDetector(
                            onTap: () => setState(() => _activeTab = t['id'] as String),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 20),
                              margin: const EdgeInsets.only(right: 8),
                              decoration: BoxDecoration(
                                color: active ? AppTheme.primaryBlue : colors.card,
                                borderRadius: BorderRadius.circular(24),
                              ),
                              child: Row(
                                children: [
                                  Icon(t['icon'] as IconData, size: 16, color: active ? Colors.black : colors.textSecondary),
                                  const SizedBox(width: 8),
                                  Text(t['label'] as String, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: active ? Colors.black : colors.textSecondary)),
                                  if ((t['c'] as int) > 0)
                                    Padding(
                                      padding: const EdgeInsets.only(left: 6),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(color: active ? Colors.black.withOpacity(0.2) : colors.surfaceLight, borderRadius: BorderRadius.circular(10)),
                                        child: Text('${t['c']}', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: active ? Colors.black : colors.textHint)),
                                      ),
                                    )
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),

                    // TAB CONTENT
                    if (_activeTab == 'announcements') _buildAnnouncements(announcements, colors),
                    if (_activeTab == 'progress') _buildProgress(progress, progressPerc, colors),
                    if (_activeTab == 'tasks') _buildTasks(tasks, colors),
                    if (_activeTab == 'attendance') _buildAttendance(attendance, attendedCount, colors),
                    if (_activeTab == 'inquiries') _buildInquiries(colors),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildHeroStat(IconData ico, String label, String val, AppColors colors, {Color color = AppTheme.primaryBlue}) {
    return Container(
      width: 100,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(16)),
      child: Column(
        children: [
          Icon(ico, color: color, size: 16),
          const SizedBox(height: 8),
          Text(label.toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: colors.textHint, letterSpacing: 1.2)),
          const SizedBox(height: 4),
          Text(val, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: colors.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildAnnouncements(List<dynamic> list, AppColors colors) {
    if (list.isEmpty) return _buildEmpty(LucideIcons.megaphone, 'No Announcements', colors);
    return Column(
      children: list.map((ann) => GlassContainer(
        backgroundColor: colors.card,
        margin: const EdgeInsets.only(bottom: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.1), shape: BoxShape.circle),
                  child: const Icon(LucideIcons.user, size: 16, color: AppTheme.primaryBlue),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(ann['doctor_name'] ?? 'Instructor', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue, letterSpacing: 1)),
                      Text(DateTime.parse(ann['created_at']).toLocal().toString().split(' ')[0], style: TextStyle(fontSize: 10, color: colors.textHint)),
                    ],
                  ),
                )
              ],
            ),
            const SizedBox(height: 16),
            Text(ann['title'] ?? '', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: colors.textPrimary)),
            const SizedBox(height: 8),
            Text(ann['content'] ?? '', style: TextStyle(fontSize: 14, color: colors.textSecondary, height: 1.5)),
          ],
        ),
      )).toList(),
    );
  }

  Widget _buildProgress(List<dynamic> list, int perc, AppColors colors) {
    if (list.isEmpty) return _buildEmpty(LucideIcons.listChecks, 'No Syllabus Data', colors);
    return Column(
      children: [
        GlassContainer(
          backgroundColor: colors.card,
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Curriculum Progress', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                  Text('$perc%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppTheme.primaryBlue)),
                ],
              ),
              const SizedBox(height: 16),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: perc / 100,
                  backgroundColor: colors.surfaceLight,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryBlue),
                  minHeight: 10,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ...list.asMap().entries.map((entry) {
          final i = entry.key;
          final item = entry.value;
          final isDone = item['is_completed'] == 1 || item['is_completed'] == true;
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDone ? Colors.green.withOpacity(0.05) : colors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDone ? Colors.green.withOpacity(0.2) : colors.borderSubtle),
            ),
            child: Row(
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    color: isDone ? Colors.green : colors.surfaceLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: isDone
                        ? const Icon(LucideIcons.checkCircle2, color: Colors.white, size: 20)
                        : Text('${i + 1}'.padLeft(2, '0'), style: TextStyle(fontWeight: FontWeight.w900, color: colors.textHint)),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item['title'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: isDone ? Colors.green : colors.textPrimary)),
                      const SizedBox(height: 4),
                      Text(isDone ? 'COMPLETED' : 'UPCOMING', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: colors.textHint, letterSpacing: 1.5)),
                    ],
                  ),
                )
              ],
            ),
          );
        })
      ],
    );
  }

  Widget _buildTasks(List<dynamic> list, AppColors colors) {
    if (list.isEmpty) return _buildEmpty(LucideIcons.checkCircle2, 'No Assigned Tasks', colors);
    return Column(
      children: list.map((task) {
        final isDone = task['is_completed'] == 1 || task['is_completed'] == true;
        final reqSub = task['requires_submission'] == 1 || task['requires_submission'] == true;
        
        if (reqSub && !_submissionControllers.containsKey(task['id'])) {
          _submissionControllers[task['id']] = TextEditingController(text: task['submission_url'] ?? '');
        }

        return GlassContainer(
          backgroundColor: colors.card,
          margin: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (!reqSub)
                    GestureDetector(
                      onTap: () => _toggleTask(task, isDone),
                      child: Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(
                          color: isDone ? Colors.green : colors.surfaceLight,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isDone ? Colors.green : colors.borderSubtle),
                        ),
                        child: Icon(isDone ? LucideIcons.check : LucideIcons.circle, color: isDone ? Colors.white : colors.textHint),
                      ),
                    )
                  else
                    Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(
                        color: isDone ? AppTheme.primaryBlue : AppTheme.primaryBlue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(LucideIcons.zap, color: isDone ? Colors.white : AppTheme.primaryBlue),
                    ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          task['title'] ?? '',
                          style: TextStyle(
                            fontWeight: FontWeight.w900, fontSize: 16,
                            color: isDone ? colors.textSecondary : colors.textPrimary,
                            decoration: isDone ? TextDecoration.lineThrough : null,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(LucideIcons.calendar, size: 12, color: colors.textHint),
                            const SizedBox(width: 4),
                            Text(task['deadline'] != null ? DateTime.parse(task['deadline']).toLocal().toString().split(' ')[0] : 'Indefinite', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textHint, letterSpacing: 1)),
                            if (reqSub) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: Colors.blueAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                                child: const Text('ASSIGNMENT', style: TextStyle(color: Colors.blueAccent, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1)),
                              )
                            ]
                          ],
                        )
                      ],
                    ),
                  ),
                  if (task['drive_link'] != null)
                    IconButton(
                      icon: Icon(LucideIcons.externalLink, color: colors.textSecondary),
                      onPressed: () => _openUrl(task['drive_link']),
                    )
                ],
              ),
              
              if (reqSub) ...[
                const SizedBox(height: 16),
                if (!isDone)
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: colors.borderSubtle)),
                          child: TextField(
                            controller: _submissionControllers[task['id']],
                            style: TextStyle(color: colors.textPrimary, fontSize: 14),
                            decoration: InputDecoration(border: InputBorder.none, hintText: 'Paste Drive link...', hintStyle: TextStyle(color: colors.textHint)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => _toggleTask(task, false, isSubmission: true),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(16)),
                          child: const Icon(LucideIcons.check, color: Colors.black),
                        ),
                      )
                    ],
                  )
                else
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: colors.borderSubtle)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('SUBMITTED EVIDENCE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.5)),
                        const SizedBox(height: 4),
                        GestureDetector(
                          onTap: () => _openUrl(task['submission_url']),
                          child: Row(
                            children: [
                              const Icon(LucideIcons.link, size: 14, color: Colors.blue),
                              const SizedBox(width: 8),
                              Expanded(child: Text(task['submission_url'] ?? '', style: const TextStyle(color: Colors.blue, fontSize: 12, decoration: TextDecoration.underline), maxLines: 1, overflow: TextOverflow.ellipsis)),
                            ],
                          ),
                        ),
                        if (task['grade'] != null || task['feedback'] != null) ...[
                          const SizedBox(height: 12),
                          const Divider(),
                          const SizedBox(height: 12),
                          if (task['grade'] != null) ...[
                            const Text('SCORE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.5)),
                            Text(task['grade'].toString(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.green)),
                            const SizedBox(height: 8),
                          ],
                          if (task['feedback'] != null) ...[
                            const Text('INSTRUCTOR REVIEW', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.5)),
                            Text('"${task['feedback']}"', style: TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: colors.textSecondary)),
                          ]
                        ]
                      ],
                    ),
                  )
              ]
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildAttendance(List<dynamic> list, int attended, AppColors colors) {
    if (list.isEmpty) return _buildEmpty(LucideIcons.users, 'No Attendance Records', colors);
    final absent = list.length - attended;
    
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildAttendanceStat('Present Days', attended, Colors.green, LucideIcons.check, colors)),
            const SizedBox(width: 16),
            Expanded(child: _buildAttendanceStat('Absent Days', absent, Colors.redAccent, LucideIcons.x, colors)),
          ],
        ),
        const SizedBox(height: 24),
        GlassContainer(
          backgroundColor: colors.card,
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                width: double.infinity,
                decoration: BoxDecoration(color: colors.surfaceLight, border: Border(bottom: BorderSide(color: colors.divider))),
                child: const Text('HISTORICAL RECORD', textAlign: TextAlign.center, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 2)),
              ),
              ...list.map((r) {
                final isPresent = r['is_present'] == 1 || r['is_present'] == true;
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(border: Border(bottom: BorderSide(color: colors.divider))),
                  child: Row(
                    children: [
                      Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(color: isPresent ? Colors.green : Colors.redAccent, borderRadius: BorderRadius.circular(12)),
                        child: Icon(isPresent ? LucideIcons.check : LucideIcons.x, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(DateTime.parse(r['date']).toLocal().toString().split(' ')[0], style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: colors.textPrimary)),
                            const SizedBox(height: 4),
                            Text(isPresent ? 'VERIFIED ATTENDANCE' : 'SESSION MISSED', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: colors.textHint, letterSpacing: 1.5)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: isPresent ? Colors.green.withOpacity(0.1) : Colors.redAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: isPresent ? Colors.green.withOpacity(0.3) : Colors.redAccent.withOpacity(0.3))),
                        child: Text(isPresent ? 'PRESENT' : 'ABSENT', style: TextStyle(color: isPresent ? Colors.green : Colors.redAccent, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1)),
                      )
                    ],
                  ),
                );
              })
            ],
          ),
        )
      ],
    );
  }

  Widget _buildAttendanceStat(String label, int count, Color c, IconData i, AppColors colors) {
    return GlassContainer(
      backgroundColor: colors.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: c, letterSpacing: 1.5)),
              Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: Icon(i, color: c, size: 16))
            ],
          ),
          const SizedBox(height: 8),
          Text('$count', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: colors.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildInquiries(AppColors colors) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Send Form
        GlassContainer(
          backgroundColor: colors.card,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                    child: const Icon(LucideIcons.messageSquare, color: AppTheme.primaryBlue),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Ask or Complain', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: colors.textPrimary)),
                      Text('DIRECT CHANNEL TO INSTRUCTOR', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: colors.textHint, letterSpacing: 1.5)),
                    ],
                  )
                ],
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _inquiryType = 'question'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(color: _inquiryType == 'question' ? AppTheme.primaryBlue.withOpacity(0.2) : colors.surfaceLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: _inquiryType == 'question' ? AppTheme.primaryBlue : colors.borderSubtle)),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(LucideIcons.helpCircle, size: 16, color: _inquiryType == 'question' ? AppTheme.primaryBlue : colors.textSecondary),
                            const SizedBox(width: 8),
                            Text('Question', style: TextStyle(fontWeight: FontWeight.bold, color: _inquiryType == 'question' ? AppTheme.primaryBlue : colors.textSecondary)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _inquiryType = 'complaint'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(color: _inquiryType == 'complaint' ? Colors.redAccent.withOpacity(0.2) : colors.surfaceLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: _inquiryType == 'complaint' ? Colors.redAccent : colors.borderSubtle)),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(LucideIcons.shieldAlert, size: 16, color: _inquiryType == 'complaint' ? Colors.redAccent : colors.textSecondary),
                            const SizedBox(width: 8),
                            Text('Complaint', style: TextStyle(fontWeight: FontWeight.bold, color: _inquiryType == 'complaint' ? Colors.redAccent : colors.textSecondary)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildInput('Subject', _subjectController, colors),
              const SizedBox(height: 16),
              _buildInput('Message Details', _contentController, colors, maxLines: 4),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: _isSubmitting ? null : _submitInquiry,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: AppTheme.primaryBlue.withOpacity(0.4), blurRadius: 15)]),
                  child: Center(
                    child: _isSubmitting
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                        : const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(LucideIcons.send, color: Colors.black, size: 18),
                              SizedBox(width: 8),
                              Text('SEND MESSAGE', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black, letterSpacing: 1)),
                            ],
                          )
                  ),
                ),
              )
            ],
          ),
        ),
        const SizedBox(height: 32),
        const Text('  MESSAGE HISTORY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.5)),
        const SizedBox(height: 16),
        if (_inquiries.isEmpty)
          _buildEmpty(LucideIcons.messageSquare, 'No previous messages', colors)
        else
          ..._inquiries.map((inq) => GlassContainer(
            backgroundColor: colors.card,
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: inq['type'] == 'complaint' ? Colors.redAccent.withOpacity(0.1) : Colors.blueAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: inq['type'] == 'complaint' ? Colors.redAccent.withOpacity(0.3) : Colors.blueAccent.withOpacity(0.3))),
                          child: Text((inq['type'] ?? '').toUpperCase(), style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: inq['type'] == 'complaint' ? Colors.redAccent : Colors.blueAccent, letterSpacing: 1)),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: inq['status'] == 'replied' ? Colors.green.withOpacity(0.1) : Colors.orangeAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: inq['status'] == 'replied' ? Colors.green.withOpacity(0.3) : Colors.orangeAccent.withOpacity(0.3))),
                          child: Text((inq['status'] ?? '').toUpperCase(), style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: inq['status'] == 'replied' ? Colors.green : Colors.orangeAccent, letterSpacing: 1)),
                        )
                      ],
                    ),
                    Text(DateTime.parse(inq['created_at']).toLocal().toString().split(' ')[0], style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textHint)),
                  ],
                ),
                const SizedBox(height: 16),
                Text(inq['subject'] ?? 'No Subject', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: colors.textPrimary)),
                const SizedBox(height: 8),
                Text(inq['content'] ?? '', style: TextStyle(fontSize: 13, color: colors.textSecondary, height: 1.5)),
                if (inq['doctor_reply'] != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.05), borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.2))),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('INSTRUCTOR REPLY', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppTheme.primaryBlue, letterSpacing: 1.5)),
                        const SizedBox(height: 8),
                        Text('"${inq['doctor_reply']}"', style: TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: colors.textPrimary)),
                        const SizedBox(height: 8),
                        Text(DateTime.parse(inq['replied_at']).toLocal().toString().split(' ')[0], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                      ],
                    ),
                  )
                ]
              ],
            ),
          ))
      ],
    );
  }

  Widget _buildInput(String label, TextEditingController ctrl, AppColors colors, {int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: colors.textHint, letterSpacing: 1.5)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: colors.borderSubtle)),
          child: TextField(
            controller: ctrl,
            maxLines: maxLines,
            style: TextStyle(color: colors.textPrimary, fontSize: 14),
            decoration: const InputDecoration(border: InputBorder.none),
          ),
        )
      ],
    );
  }

  Widget _buildEmpty(IconData ico, String text, AppColors colors) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Center(
        child: Column(
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(24)),
              child: Icon(ico, size: 40, color: colors.textHint),
            ),
            const SizedBox(height: 16),
            Text(text, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: colors.textPrimary)),
          ],
        ),
      ),
    );
  }
}
