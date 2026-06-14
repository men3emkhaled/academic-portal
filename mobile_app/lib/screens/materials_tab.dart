
import 'dart:convert';
import 'dart:async' as async_lib;
import 'dart:math' as math_lib;
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
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

  void _showMediaPlayer(dynamic item) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => MediaPlayerModal(
        item: Map<String, dynamic>.from(item),
        courseName: _selectedCourseObject?['course_name'] ?? 'Course',
      ),
    );
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
                         Positioned(
                           right: -20, 
                           top: -20, 
                           child: Container(
                             width: 80, 
                             height: 80, 
                             decoration: BoxDecoration(
                               color: AppTheme.primaryBlue.withValues(alpha: 0.15), 
                               shape: BoxShape.circle,
                             ),
                           ),
                         ),
                         Theme(
                           data: Theme.of(context).copyWith(
                             cardColor: colors.card,
                           ),
                           child: PopupMenuButton<dynamic>(
                             tooltip: 'Switch Course',
                             offset: const Offset(0, 80),
                             onSelected: (v) { 
                                final course = courses.firstWhere((c) => c['course_id'] == v, orElse: () => null);
                                if (course != null) _loadData(course);
                             },
                             itemBuilder: (ctx) {
                               return courses.map((c) {
                                 return PopupMenuItem<dynamic>(
                                   value: c['course_id'],
                                   child: Row(
                                     children: [
                                       Icon(
                                         c['course_id'] == _selectedCourseId 
                                             ? LucideIcons.checkCircle2 
                                             : LucideIcons.circle,
                                         size: 16,
                                         color: c['course_id'] == _selectedCourseId 
                                             ? AppTheme.primaryBlue 
                                             : colors.textHint,
                                       ),
                                       const SizedBox(width: 12),
                                       Expanded(
                                         child: Text(
                                           '${c['course_name']} (Sem ${c['semester']})',
                                           style: TextStyle(
                                             fontWeight: c['course_id'] == _selectedCourseId 
                                                 ? FontWeight.bold 
                                                 : FontWeight.normal,
                                             color: colors.textPrimary,
                                           ),
                                         ),
                                       ),
                                     ],
                                   ),
                                 );
                               }).toList();
                             },
                             child: GlassContainer(
                                backgroundColor: colors.surfaceLight,
                                margin: EdgeInsets.zero,
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                                child: Row(
                                   children: [
                                      Container(
                                        padding: const EdgeInsets.all(12), 
                                        decoration: BoxDecoration(
                                          color: AppTheme.primaryBlue.withValues(alpha: 0.1), 
                                          borderRadius: BorderRadius.circular(16),
                                        ), 
                                        child: Icon(LucideIcons.laptop, color: AppTheme.primaryBlue, size: 24),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Column(
                                           crossAxisAlignment: CrossAxisAlignment.start,
                                           children: [
                                              Row(
                                                 children: [
                                                    Container(
                                                      width: 6, 
                                                      height: 6, 
                                                      decoration: BoxDecoration(
                                                        color: AppTheme.primaryBlue, 
                                                        shape: BoxShape.circle, 
                                                        boxShadow: [
                                                          BoxShadow(
                                                            color: AppTheme.primaryBlue.withValues(alpha: 0.5), 
                                                            blurRadius: 4,
                                                          )
                                                        ],
                                                      ),
                                                    ),
                                                    const SizedBox(width: 6),
                                                    const Text(
                                                      'ONGOING', 
                                                      style: TextStyle(
                                                        fontSize: 8, 
                                                        fontWeight: FontWeight.w900, 
                                                        color: AppTheme.primaryBlue, 
                                                        letterSpacing: 1.2,
                                                      ),
                                                    ),
                                                 ],
                                              ),
                                              const SizedBox(height: 6),
                                              Text(
                                                _selectedCourseObject?['course_name'] ?? '', 
                                                style: TextStyle(
                                                  fontWeight: FontWeight.w900, 
                                                  fontSize: 18, 
                                                  color: colors.textPrimary,
                                                ),
                                              ),
                                           ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.all(8), 
                                        decoration: BoxDecoration(
                                          color: colors.card, 
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(color: colors.borderSubtle),
                                        ), 
                                        child: Icon(LucideIcons.chevronsUpDown, size: 16, color: colors.textSecondary),
                                      ),
                                   ],
                                ),
                             ),
                           ),
                         ),
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
                              onTap: () {
                                if (r['type'] == 'video' || r['type'] == 'recording') {
                                  _showMediaPlayer(r);
                                } else {
                                  _open(r['url']);
                                }
                              },
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
        // Progress Stats Card (Premium Circular Bento-style)
        GlassContainer(
          backgroundColor: colors.card,
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              // Circular progress
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 76,
                    height: 76,
                    child: CircularProgressIndicator(
                      value: percentage / 100,
                      backgroundColor: colors.surfaceLight,
                      color: percentage == 100 ? const Color(0xFF4ADE80) : AppTheme.primaryBlue,
                      strokeWidth: 8,
                      strokeCap: StrokeCap.round,
                    ),
                  ),
                  Text(
                    '$percentage%',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                      color: colors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 20),
              // Text stats
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Course Progress'.toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: colors.textHint,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      percentage == 100 ? 'Syllabus Completed' : 'Ongoing Study',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: colors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
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
                        if (pending > 0) ...[
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFBBF24).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '$pending PENDING',
                              style: const TextStyle(
                                fontSize: 8,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFFFBBF24),
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
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

class MediaPlayerModal extends StatefulWidget {
  final Map<String, dynamic> item;
  final String courseName;

  const MediaPlayerModal({
    super.key,
    required this.item,
    required this.courseName,
  });

  @override
  State<MediaPlayerModal> createState() => _MediaPlayerModalState();
}

class _MediaPlayerModalState extends State<MediaPlayerModal> {
  bool _isPlaying = false;
  double _progress = 0.0; // 0.0 to 1.0
  double _playbackSpeed = 1.0;
  late Duration _currentPosition;
  late Duration _totalDuration;
  async_lib.Timer? _timer;

  @override
  void initState() {
    super.initState();
    _currentPosition = Duration.zero;
    _totalDuration = widget.item['type'] == 'video'
        ? const Duration(minutes: 54, seconds: 20)
        : const Duration(minutes: 18, seconds: 45);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _togglePlay() {
    setState(() {
      _isPlaying = !_isPlaying;
    });

    if (_isPlaying) {
      _timer = async_lib.Timer.periodic(const Duration(seconds: 1), (timer) {
        if (!mounted) return;
        setState(() {
          final increment = 1 * _playbackSpeed;
          final currentSec = _currentPosition.inSeconds + increment.toInt();
          if (currentSec >= _totalDuration.inSeconds) {
            _currentPosition = _totalDuration;
            _progress = 1.0;
            _isPlaying = false;
            _timer?.cancel();
          } else {
            _currentPosition = Duration(seconds: currentSec);
            _progress = _currentPosition.inSeconds / _totalDuration.inSeconds;
          }
        });
      });
    } else {
      _timer?.cancel();
    }
  }

  void _seek(double value) {
    setState(() {
      _progress = value;
      _currentPosition = Duration(seconds: (value * _totalDuration.inSeconds).toInt());
    });
  }

  void _skip(int seconds) {
    setState(() {
      final newSecs = (_currentPosition.inSeconds + seconds).clamp(0, _totalDuration.inSeconds);
      _currentPosition = Duration(seconds: newSecs);
      _progress = _currentPosition.inSeconds / _totalDuration.inSeconds;
    });
  }

  void _toggleSpeed() {
    setState(() {
      if (_playbackSpeed == 1.0) {
        _playbackSpeed = 1.5;
      } else if (_playbackSpeed == 1.5) {
        _playbackSpeed = 2.0;
      } else {
        _playbackSpeed = 1.0;
      }
      if (_isPlaying) {
        _timer?.cancel();
        _isPlaying = false;
        _togglePlay();
      }
    });
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final isVideo = widget.item['type'] == 'video';

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: GlassContainer(
        backgroundColor: colors.card,
        borderColor: AppTheme.primaryBlue.withValues(alpha: 0.3),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.courseName.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: colors.textHint,
                          letterSpacing: 1.5,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.item['title'] ?? '',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: colors.textPrimary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: Icon(LucideIcons.x, color: colors.textSecondary),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Container(
                width: double.infinity,
                height: 180,
                decoration: BoxDecoration(
                  color: Colors.black,
                  border: Border.all(color: colors.borderSubtle),
                ),
                child: isVideo
                    ? Stack(
                        alignment: Alignment.center,
                        children: [
                          Opacity(
                            opacity: 0.4,
                            child: Image.network(
                              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop',
                              fit: BoxFit.cover,
                              width: double.infinity,
                              height: double.infinity,
                              errorBuilder: (_, __, ___) => Container(
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          if (_isPlaying)
                            Positioned(
                              top: 12,
                              left: 12,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.redAccent.withValues(alpha: 0.8),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(LucideIcons.play, size: 8, color: Colors.white),
                                    SizedBox(width: 4),
                                    Text('LIVE PREVIEW', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                            ),
                          GestureDetector(
                            onTap: _togglePlay,
                            child: Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: AppTheme.primaryBlue.withValues(alpha: 0.8),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                _isPlaying ? LucideIcons.pause : LucideIcons.play,
                                color: Colors.black,
                                size: 30,
                              ),
                            ),
                          ),
                        ],
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.mic, color: AppTheme.primaryBlue.withValues(alpha: 0.8), size: 36),
                          const SizedBox(height: 16),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: AudioWaveformVisualizer(isPlaying: _isPlaying),
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _formatDuration(_currentPosition),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: colors.textSecondary,
                  ),
                ),
                Text(
                  _formatDuration(_totalDuration),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: colors.textSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            SliderTheme(
              data: SliderThemeData(
                trackHeight: 4,
                activeTrackColor: AppTheme.primaryBlue,
                inactiveTrackColor: colors.surfaceLight,
                thumbColor: AppTheme.primaryBlue,
                overlayColor: AppTheme.primaryBlue.withValues(alpha: 0.1),
                thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
              ),
              child: Slider(
                value: _progress,
                onChanged: _seek,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                GestureDetector(
                  onTap: _toggleSpeed,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: colors.surfaceLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${_playbackSpeed}x',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        color: colors.textPrimary,
                      ),
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(LucideIcons.skipBack, color: colors.textPrimary),
                  onPressed: () => _skip(-10),
                ),
                GestureDetector(
                  onTap: _togglePlay,
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: const BoxDecoration(
                      color: AppTheme.primaryBlue,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      _isPlaying ? LucideIcons.pause : LucideIcons.play,
                      color: Colors.black,
                      size: 28,
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(LucideIcons.skipForward, color: colors.textPrimary),
                  onPressed: () => _skip(10),
                ),
                IconButton(
                  icon: Icon(LucideIcons.externalLink, color: colors.textSecondary),
                  onPressed: () {
                    try {
                      launchUrl(Uri.parse(widget.item['url']), mode: LaunchMode.externalApplication);
                    } catch (_) {}
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class AudioWaveformVisualizer extends StatefulWidget {
  final bool isPlaying;

  const AudioWaveformVisualizer({
    super.key,
    required this.isPlaying,
  });

  @override
  State<AudioWaveformVisualizer> createState() => _AudioWaveformVisualizerState();
}

class _AudioWaveformVisualizerState extends State<AudioWaveformVisualizer> {
  final List<double> _heights = List.generate(30, (_) => 8.0);
  async_lib.Timer? _visualizerTimer;

  @override
  void initState() {
    super.initState();
    _randomizeHeights();
    if (widget.isPlaying) {
      _startAnimation();
    }
  }

  @override
  void didUpdateWidget(covariant AudioWaveformVisualizer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPlaying != oldWidget.isPlaying) {
      if (widget.isPlaying) {
        _startAnimation();
      } else {
        _visualizerTimer?.cancel();
        setState(() {
          _randomizeHeights();
        });
      }
    }
  }

  @override
  void dispose() {
    _visualizerTimer?.cancel();
    super.dispose();
  }

  void _startAnimation() {
    _visualizerTimer?.cancel();
    _visualizerTimer = async_lib.Timer.periodic(const Duration(milliseconds: 120), (timer) {
      if (!mounted) return;
      setState(() {
        _randomizeHeights();
      });
    });
  }

  void _randomizeHeights() {
    final random = math_lib.Random();
    for (int i = 0; i < _heights.length; i++) {
      if (widget.isPlaying) {
        _heights[i] = 4.0 + random.nextDouble() * 32.0;
      } else {
        _heights[i] = 8.0;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(_heights.length, (index) {
        return Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 1.5),
            height: _heights[index],
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [
                  AppTheme.primaryBlue,
                  Colors.purpleAccent,
                ],
              ),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        );
      }),
    );
  }
}
