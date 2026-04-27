import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/data_provider.dart';
import '../services/api_service.dart';
import '../theme.dart';
import 'ui_helpers.dart';

class MaterialsTab extends StatefulWidget {
  const MaterialsTab({super.key});

  @override
  State<MaterialsTab> createState() => _MaterialsTabState();
}

class _MaterialsTabState extends State<MaterialsTab> {
  dynamic _selectedCourseId;
  dynamic _selectedCourseObject;
  bool _isLoading = false;
  Map<String, List<dynamic>> _resources = {'videos': [], 'pdfs': [], 'summaries': [], 'playlists': [], 'recordings': []};
  String _activeTab = 'progress';
  List<dynamic> _progressItems = [];
  Map<String, dynamic> _progressStats = {'total': 0, 'completed': 0, 'pending': 0, 'percentage': 0};
  bool _isLoadingProgress = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initFirst());
  }

  void _initFirst() {
    final grades = context.read<DataProvider>().grades;
    if (grades.isNotEmpty && _selectedCourseId == null) {
      _loadData(grades[0]);
    }
  }

  Future<void> _loadData(dynamic c) async {
     setState(() { _selectedCourseId = c['course_id']; _selectedCourseObject = c; _isLoading = true; _activeTab = 'progress'; });
     
     final prefs = await SharedPreferences.getInstance();
     final cacheKey = 'cache_materials_${c['course_id']}';

     // Load cached materials
     if (prefs.containsKey(cacheKey)) {
        try {
           final cachedData = jsonDecode(prefs.getString(cacheKey)!);
           _parseResources(cachedData);
        } catch (_) {}
     }

     // Load cached progress
     final progressCacheKey = 'cache_progress_${c['course_id']}';
     if (prefs.containsKey(progressCacheKey)) {
        try {
           final cachedProgress = jsonDecode(prefs.getString(progressCacheKey)!);
           if (mounted) {
              setState(() {
                 _progressItems = (cachedProgress['items'] as List<dynamic>?) ?? [];
                 _progressStats = (cachedProgress['stats'] as Map<String, dynamic>?) ?? {'total': 0, 'completed': 0, 'pending': 0, 'percentage': 0};
              });
           }
        } catch (_) {}
     }

     try {
       final res = await ApiService().dio.get('/resources/course/${c['course_id']}');
       if (mounted) {
          prefs.setString(cacheKey, jsonEncode(res.data));
          _parseResources(res.data);
       }
     } catch(e) {
        if (mounted) setState(() => _isLoading = false);
     }

     // Fetch progress
     _fetchProgress(c['course_id'], prefs);
  }

  Future<void> _fetchProgress(dynamic courseId, SharedPreferences prefs) async {
     setState(() => _isLoadingProgress = true);
     try {
        final res = await ApiService().dio.get('/progress/course/$courseId');
        if (mounted) {
           final data = res.data;
           prefs.setString('cache_progress_$courseId', jsonEncode(data));
           setState(() {
              _progressItems = (data['items'] as List<dynamic>?) ?? [];
              _progressStats = (data['stats'] as Map<String, dynamic>?) ?? {'total': 0, 'completed': 0, 'pending': 0, 'percentage': 0};
              _isLoadingProgress = false;
           });
        }
     } catch(e) {
        debugPrint('Error fetching progress: $e');
        if (mounted) setState(() => _isLoadingProgress = false);
     }
  }

  void _parseResources(List<dynamic> data) {
      Map<String, List<dynamic>> org = {'videos': [], 'pdfs': [], 'summaries': [], 'playlists': [], 'recordings': []};
      for(var r in data) {
         if (r['type'] == 'video') org['videos']!.add(r);
         else if (r['type'] == 'pdf') org['pdfs']!.add(r);
         else if (r['type'] == 'summary') org['summaries']!.add(r);
         else if (r['type'] == 'playlist') org['playlists']!.add(r);
         else if (r['type'] == 'recording') org['recordings']!.add(r);
      }
      if (mounted) {
         setState(() { _resources = org; _isLoading = false; });
      }
  }

  void _open(String url) async {
     try {
       final u = Uri.parse(url);
       await launchUrl(u, mode: LaunchMode.externalApplication);
     } catch (e) {
       debugPrint('Could not launch $url: $e');
     }
  }

  @override
  Widget build(BuildContext context) {
    final dp = context.watch<DataProvider>();
    final colors = Theme.of(context).extension<AppColors>()!;
    final courses = dp.grades;

    if (courses.isNotEmpty && _selectedCourseId == null) {
       _initFirst();
    }

    final tabs = [
       {'id': 'progress', 'label': 'Progress', 'icon': LucideIcons.listChecks, 'c': _progressStats['total'] ?? 0},
       {'id': 'videos', 'label': 'Videos', 'icon': LucideIcons.video, 'c': _resources['videos']!.length},
       {'id': 'recordings', 'label': 'Recordings', 'icon': LucideIcons.mic, 'c': _resources['recordings']!.length},
       {'id': 'pdfs', 'label': 'PDFs', 'icon': LucideIcons.fileText, 'c': _resources['pdfs']!.length},
       {'id': 'summaries', 'label': 'Summaries', 'icon': LucideIcons.bookOpen, 'c': _resources['summaries']!.length},
       {'id': 'playlists', 'label': 'Playlists', 'icon': LucideIcons.library, 'c': _resources['playlists']!.length},
    ];

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
           crossAxisAlignment: CrossAxisAlignment.start,
           children: [
             const Padding(padding: EdgeInsets.fromLTRB(24, 24, 24, 16), child: GradientText('Course Materials')),
             
             if (courses.isNotEmpty)
               Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: GlassContainer(
                     backgroundColor: colors.card,
                     padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                     child: DropdownButtonHideUnderline(
                        child: DropdownButton<dynamic>(
                           value: courses.any((c) => c['course_id'] == _selectedCourseId) ? _selectedCourseId : null,
                           isExpanded: true,
                           icon: Icon(LucideIcons.graduationCap, color: AppTheme.primaryBlue),
                           dropdownColor: colors.card,
                           items: courses.map((c) => DropdownMenuItem<dynamic>(value: c['course_id'], child: Text('${c['course_name']} (Sem ${c['semester']})', style: TextStyle(color: colors.textPrimary)))).toList(),
                           onChanged: (v) { 
                              if (v != null) {
                                  final course = courses.firstWhere((c) => c['course_id'] == v, orElse: () => null);
                                  if (course != null) _loadData(course);
                              } 
                           }
                        )
                     )
                  )
               ),
             
             if (_selectedCourseId == null)
               Expanded(
                  child: Center(
                     child: GlassContainer(
                        backgroundColor: colors.surfaceLight,
                        child: Text('No enrolled courses.', style: TextStyle(color: colors.textSecondary))
                     )
                  )
               )
             else ...[
               const SizedBox(height: 8),
               Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Stack(
                     clipBehavior: Clip.none,
                     children: [
                        Positioned(right: -30, top: -30, child: Container(width: 100, height: 100, decoration: BoxDecoration(color: AppTheme.primaryBlue.withValues(alpha: 0.2), shape: BoxShape.circle))),
                        GlassContainer(
                           backgroundColor: colors.surfaceLight,
                           margin: EdgeInsets.zero,
                           child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                 Row(
                                    children: [
                                       Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppTheme.primaryBlue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)), child: Icon(LucideIcons.laptop, color: AppTheme.primaryBlue)),
                                       const SizedBox(width: 12),
                                       Expanded(child: Text(_selectedCourseObject?['course_name'] ?? '', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: colors.textPrimary)))
                                    ],
                                 ),
                                 const SizedBox(height: 12),
                                 Row(
                                    children: [
                                       Container(width: 8, height: 8, decoration: BoxDecoration(color: AppTheme.primaryBlue, shape: BoxShape.circle, boxShadow: [BoxShadow(color: AppTheme.primaryBlue.withValues(alpha: 0.5), blurRadius: 6)])),
                                       const SizedBox(width: 8),
                                       const Text('ONGOING', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppTheme.primaryBlue, letterSpacing: 1.5))
                                    ],
                                 )
                              ],
                           )
                        )
                     ],
                  ),
               ),
               
               const SizedBox(height: 16),
               SizedBox(
                  height: 48,
                  child: ListView.builder(
                     scrollDirection: Axis.horizontal,
                     padding: const EdgeInsets.symmetric(horizontal: 24),
                     itemCount: tabs.length,
                     itemBuilder: (ctx, i) {
                        final t = tabs[i];
                        final active = _activeTab == t['id'];
                        return GestureDetector(
                           onTap: () => setState(() => _activeTab = t['id'] as String),
                           child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
                              margin: const EdgeInsets.only(right: 8),
                              decoration: BoxDecoration(color: active ? AppTheme.primaryBlue : colors.card, borderRadius: BorderRadius.circular(24)),
                              child: Row(
                                 children: [
                                    Icon(t['icon'] as IconData, size: 16, color: active ? Colors.black : colors.textSecondary),
                                    const SizedBox(width: 8),
                                    Text(t['label'] as String, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: active ? Colors.black : colors.textSecondary)),
                                    if (t['c'] as int > 0)
                                      Padding(padding: const EdgeInsets.only(left: 4), child: Text('(${t['c']})', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: active ? Colors.black.withValues(alpha: 0.7) : colors.textHint)))
                                 ],
                              )
                           )
                        );
                     }
                  )
               ),
               const SizedBox(height: 16),
               
               Expanded(
                  child: _isLoading ? const Center(child: CircularProgressIndicator()) :
                  _activeTab == 'progress'
                     ? _buildProgressContent(colors)
                     : _resources[_activeTab]!.isEmpty
                     ? Center(child: GlassContainer(backgroundColor: colors.surfaceLight, child: Text('No materials available yet.', style: TextStyle(color: colors.textSecondary))))
                     : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        itemCount: _resources[_activeTab]!.length,
                        itemBuilder: (ctx, i) {
                           final r = _resources[_activeTab]![i];
                           IconData fileIcon = LucideIcons.fileText;
                           if (r['type'] == 'video') fileIcon = LucideIcons.video;
                           if (r['type'] == 'recording') fileIcon = LucideIcons.mic;
                           if (r['type'] == 'playlist') fileIcon = LucideIcons.library;
                           
                           return GestureDetector(
                              onTap: () => _open(r['url']),
                              child: GlassContainer(
                                 backgroundColor: colors.card,
                                 padding: const EdgeInsets.all(16),
                                 child: Row(
                                    children: [
                                       Container(
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(gradient: LinearGradient(colors: [AppTheme.primaryBlue.withValues(alpha: 0.2), AppTheme.primaryBlue.withValues(alpha: 0.05)]), borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.primaryBlue.withValues(alpha: 0.2))),
                                          child: Icon(fileIcon, color: AppTheme.primaryBlue)
                                       ),
                                       const SizedBox(width: 16),
                                       Expanded(
                                          child: Text(r['title'] ?? '', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: colors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis)
                                       ),
                                       const SizedBox(width: 8),
                                       Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: colors.surfaceLight, shape: BoxShape.circle), child: Icon(LucideIcons.externalLink, size: 14, color: colors.textSecondary))
                                    ],
                                 )
                              )
                           );
                        }
                     )
               )
             ]
           ],
        )
      )
    );
  }

  Widget _buildProgressContent(AppColors colors) {
    if (_isLoadingProgress) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_progressItems.isEmpty) {
      return Center(
        child: GlassContainer(
          backgroundColor: colors.surfaceLight,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.listChecks, size: 40, color: colors.textHint),
              const SizedBox(height: 12),
              Text('No progress data yet', style: TextStyle(color: colors.textSecondary, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text('Check back later for updates', style: TextStyle(color: colors.textHint, fontSize: 12)),
            ],
          ),
        ),
      );
    }

    final percentage = (_progressStats['percentage'] ?? 0);
    final completed = (_progressStats['completed'] ?? 0);
    final total = (_progressStats['total'] ?? 0);
    final pending = (_progressStats['pending'] ?? 0);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      children: [
        // Progress Stats Card
        GlassContainer(
          backgroundColor: colors.card,
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(LucideIcons.listChecks, size: 18, color: AppTheme.primaryBlue),
                      const SizedBox(width: 8),
                      Text('Course Progress', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: colors.textPrimary)),
                    ],
                  ),
                  Text('$percentage%', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: AppTheme.primaryBlue)),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: percentage / 100,
                  backgroundColor: colors.surfaceLight,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    percentage == 100 ? const Color(0xFF4ade80) : AppTheme.primaryBlue,
                  ),
                  minHeight: 10,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  RichText(
                    text: TextSpan(
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: colors.textSecondary),
                      children: [
                        TextSpan(text: '$completed', style: TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.w900)),
                        TextSpan(text: ' / $total completed'),
                      ],
                    ),
                  ),
                  if (pending > 0)
                    Text('$pending pending', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFFBBF24))),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Progress Items
        ..._progressItems.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          final isDone = item['is_completed'] == true;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: GlassContainer(
              backgroundColor: isDone
                  ? AppTheme.primaryBlue.withValues(alpha: 0.05)
                  : const Color(0xFFFBBF24).withValues(alpha: 0.05),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  Icon(
                    isDone ? LucideIcons.checkCircle : LucideIcons.circle,
                    size: 20,
                    color: isDone ? AppTheme.primaryBlue : const Color(0xFFFBBF24),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    width: 24, height: 24,
                    decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(8)),
                    child: Center(child: Text('${index + 1}', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: colors.textHint))),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      item['title'] ?? '',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: isDone ? colors.textPrimary : const Color(0xFFFDE68A),
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDone
                          ? AppTheme.primaryBlue.withValues(alpha: 0.15)
                          : const Color(0xFFFBBF24).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      isDone ? 'DONE' : 'PENDING',
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1,
                        color: isDone ? AppTheme.primaryBlue : const Color(0xFFFBBF24),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}
