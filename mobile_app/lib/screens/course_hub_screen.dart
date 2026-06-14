import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import '../theme.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
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

  // Course Switcher & Material Hub additions
  Map<String, dynamic>? _selectedCourse;
  List<dynamic> _materialHubPosts = [];
  bool _isLoadingMaterialHub = false;
  String _materialFilterType = 'all';
  String _materialSearchQuery = '';
  final _materialSearchController = TextEditingController();
  final _rejectReasonController = TextEditingController();
  String? _rejectingPostId;
  bool _isReviewing = false;

  @override
  void initState() {
    super.initState();
    _selectedCourse = widget.course;
    _materialSearchController.addListener(() {
      setState(() {
        _materialSearchQuery = _materialSearchController.text;
      });
    });
    _fetchHubData();
    _fetchMaterialHubData();
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _contentController.dispose();
    _materialSearchController.dispose();
    _rejectReasonController.dispose();
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

  void _switchCourse(dynamic newCourse) {
    setState(() {
      _selectedCourse = newCourse;
      _isLoading = true;
      _activeTab = 'announcements';
      _hubData = null;
      _inquiries = [];
      _materialHubPosts = [];
    });
    _fetchHubData();
    _fetchMaterialHubData();
  }

  Future<void> _fetchMaterialHubData() async {
    if (_selectedCourse == null) return;
    setState(() => _isLoadingMaterialHub = true);
    try {
      final courseId = _selectedCourse!['course_id'];
      final res = await ApiService().dio.get('/material-hub/$courseId');
      if (mounted) {
        setState(() {
          _materialHubPosts = res.data ?? [];
          _isLoadingMaterialHub = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingMaterialHub = false);
    }
  }

  Future<void> _toggleUpvote(dynamic post) async {
    final postId = post['id'];
    setState(() {
      _materialHubPosts = _materialHubPosts.map((p) {
        if (p['id'] == postId) {
          final nextHasUpvoted = !(p['has_upvoted'] == true || p['has_upvoted'] == 1);
          final delta = nextHasUpvoted ? 1 : -1;
          return {
            ...p,
            'has_upvoted': nextHasUpvoted,
            'upvotes_count': ((p['upvotes_count'] ?? 0) as int) + delta,
          };
        }
        return p;
      }).toList();
    });

    try {
      final res = await ApiService().dio.post('/material-hub/$postId/upvote');
      setState(() {
        _materialHubPosts = _materialHubPosts.map((p) {
          if (p['id'] == postId) {
            return {
              ...p,
              'has_upvoted': res.data['upvoted'] == true || res.data['upvoted'] == 1,
            };
          }
          return p;
        }).toList();
      });
    } catch (e) {
      _fetchMaterialHubData();
    }
  }

  Future<void> _toggleBookmark(dynamic post) async {
    final postId = post['id'];
    final nextBookmarked = !(post['has_bookmarked'] == true || post['has_bookmarked'] == 1);
    
    setState(() {
      _materialHubPosts = _materialHubPosts.map((p) {
        if (p['id'] == postId) {
          return {
            ...p,
            'has_bookmarked': nextBookmarked,
          };
        }
        return p;
      }).toList();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(nextBookmarked ? '✦ Added to saved' : 'Removed from saved'),
        duration: const Duration(seconds: 1),
      ),
    );

    try {
      await ApiService().dio.post('/material-hub/$postId/bookmark');
    } catch (e) {
      _fetchMaterialHubData();
    }
  }

  Future<void> _deletePost(dynamic post) async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Post'),
        content: const Text('Are you sure you want to delete this post?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete', style: const TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm != true) return;

    try {
      await ApiService().dio.delete('/material-hub/${post['id']}');
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Post deleted successfully')));
      _fetchMaterialHubData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to delete post')));
    }
  }

  Future<void> _moderatePost(dynamic post, String status, String reason) async {
    setState(() => _isReviewing = true);
    try {
      await ApiService().dio.patch('/material-hub/${post['id']}/review', data: {
        'status': status,
        'rejectReason': reason,
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(status == 'approved' ? 'File approved and published' : 'File rejected')),
      );
      setState(() {
        _rejectingPostId = null;
        _rejectReasonController.clear();
      });
      _fetchMaterialHubData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to moderate post')));
    } finally {
      setState(() => _isReviewing = false);
    }
  }

  void _showUploadBottomSheet(AppColors colors) {
    String uploadType = 'lecture';
    final captionCtrl = TextEditingController();
    PlatformFile? selectedFile;
    bool isUploading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          margin: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
          decoration: BoxDecoration(
            color: colors.card,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(32),
              topRight: Radius.circular(32),
            ),
            border: Border.all(color: colors.borderSubtle),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: colors.divider, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 20),
              Text('Share Course Material', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: colors.textPrimary)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setModalState(() => uploadType = 'lecture'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: uploadType == 'lecture' ? AppTheme.primaryBlue.withOpacity(0.2) : colors.surfaceLight,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: uploadType == 'lecture' ? AppTheme.primaryBlue : colors.borderSubtle),
                        ),
                        child: Center(
                          child: Text('Lecture', style: TextStyle(fontWeight: FontWeight.bold, color: uploadType == 'lecture' ? AppTheme.primaryBlue : colors.textSecondary)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setModalState(() => uploadType = 'exam'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: uploadType == 'exam' ? AppTheme.primaryBlue.withOpacity(0.2) : colors.surfaceLight,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: uploadType == 'exam' ? AppTheme.primaryBlue : colors.borderSubtle),
                        ),
                        child: Center(
                          child: Text('Exam/Quiz', style: TextStyle(fontWeight: FontWeight.bold, color: uploadType == 'exam' ? AppTheme.primaryBlue : colors.textSecondary)),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text('DESCRIPTION', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: colors.textHint, letterSpacing: 1.5)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: colors.borderSubtle)),
                child: TextField(
                  controller: captionCtrl,
                  style: TextStyle(color: colors.textPrimary, fontSize: 14),
                  decoration: const InputDecoration(border: InputBorder.none, hintText: 'e.g. Solution of sheet 2, Summary...'),
                ),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: () async {
                  final result = await FilePicker.pickFiles(
                    type: FileType.custom,
                    allowedExtensions: ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'zip', 'png', 'jpg', 'jpeg'],
                  );
                  if (result != null && result.files.isNotEmpty) {
                    setModalState(() => selectedFile = result.files.first);
                  }
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: colors.surfaceLight,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: colors.borderSubtle),
                  ),
                  child: Column(
                    children: [
                      Icon(LucideIcons.paperclip, color: selectedFile != null ? Colors.green : colors.textHint, size: 32),
                      const SizedBox(height: 8),
                      Text(
                        selectedFile != null
                            ? '${selectedFile!.name} (${(selectedFile!.size / (1024 * 1024)).toStringAsFixed(2)} MB)'
                            : 'Click to select PDF, Slides, Zip, Images',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: selectedFile != null ? Colors.green : colors.textSecondary,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: isUploading || selectedFile == null
                    ? null
                    : () async {
                        setModalState(() => isUploading = true);
                        try {
                          final formData = FormData.fromMap({
                            'courseId': _selectedCourse!['course_id'],
                            'type': uploadType,
                            'caption': captionCtrl.text,
                            'file': await MultipartFile.fromFile(selectedFile!.path!, filename: selectedFile!.name),
                          });

                          await ApiService().dio.post('/material-hub', data: formData);
                          
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Material sent for review successfully'), backgroundColor: Colors.green),
                          );
                          _fetchMaterialHubData();
                        } catch (e) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Failed to upload material'), backgroundColor: Colors.redAccent),
                          );
                        } finally {
                          setModalState(() => isUploading = false);
                        }
                      },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: selectedFile != null ? AppTheme.primaryBlue : Colors.grey.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: isUploading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                        : Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(LucideIcons.upload, color: selectedFile != null ? Colors.black : colors.textHint, size: 18),
                              const SizedBox(width: 8),
                              Text('SUBMIT MATERIAL', style: TextStyle(fontWeight: FontWeight.w900, color: selectedFile != null ? Colors.black : colors.textHint, letterSpacing: 1)),
                            ],
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showCommentsBottomSheet(dynamic post, AppColors colors) {
    List<dynamic> comments = [];
    bool isCommentsLoading = true;
    final commentCtrl = TextEditingController();
    bool isSubmittingComment = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          Future<void> fetchComments() async {
            try {
              final res = await ApiService().dio.get('/material-hub/${post['id']}/comments');
              setModalState(() {
                comments = res.data ?? [];
                isCommentsLoading = false;
              });
            } catch (e) {
              setModalState(() => isCommentsLoading = false);
            }
          }

          if (isCommentsLoading && comments.isEmpty) {
            fetchComments();
          }

          return Container(
            margin: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
            height: MediaQuery.of(context).size.height * 0.6,
            decoration: BoxDecoration(
              color: colors.card,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              border: Border.all(color: colors.borderSubtle),
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40, height: 4,
                    decoration: BoxDecoration(color: colors.divider, borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                const SizedBox(height: 20),
                Text('Comments', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: colors.textPrimary)),
                const SizedBox(height: 16),
                Expanded(
                  child: isCommentsLoading
                      ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryBlue))
                      : comments.isEmpty
                          ? Center(child: Text('No comments yet. Be the first to comment!', style: TextStyle(color: colors.textSecondary, fontStyle: FontStyle.italic)))
                          : ListView.builder(
                              itemCount: comments.length,
                              itemBuilder: (ctx, idx) {
                                final comment = comments[idx];
                                final studentName = comment['student_name'] ?? 'Student';
                                final avatarUrl = comment['student_avatar_url']?.toString() ?? '';
                                final content = comment['content'] ?? '';
                                final created = comment['created_at'] != null
                                    ? DateTime.parse(comment['created_at']).toLocal().toString().split(' ')[0]
                                    : '';

                                return Container(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 36, height: 36,
                                        decoration: BoxDecoration(
                                          color: colors.surfaceLight,
                                          shape: BoxShape.circle,
                                          image: avatarUrl.isNotEmpty
                                              ? DecorationImage(image: NetworkImage(avatarUrl), fit: BoxFit.cover)
                                              : null,
                                        ),
                                        child: avatarUrl.isEmpty
                                            ? Center(child: Text(studentName.substring(0, 1).toUpperCase(), style: TextStyle(color: colors.textHint, fontWeight: FontWeight.bold)))
                                            : null,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Container(
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: colors.surfaceLight,
                                            borderRadius: BorderRadius.circular(16),
                                          ),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Text(studentName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: colors.textPrimary)),
                                                  Text(created, style: TextStyle(fontSize: 10, color: colors.textHint)),
                                                ],
                                              ),
                                              const SizedBox(height: 4),
                                              Text(content, style: TextStyle(fontSize: 13, color: colors.textSecondary)),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: colors.borderSubtle)),
                        child: TextField(
                          controller: commentCtrl,
                          style: TextStyle(color: colors.textPrimary, fontSize: 14),
                          decoration: const InputDecoration(border: InputBorder.none, hintText: 'Write a comment...'),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    GestureDetector(
                      onTap: isSubmittingComment
                          ? null
                          : () async {
                              if (commentCtrl.text.trim().isEmpty) return;
                              setModalState(() => isSubmittingComment = true);
                              try {
                                final res = await ApiService().dio.post('/material-hub/${post['id']}/comments', data: {'content': commentCtrl.text});
                                setModalState(() {
                                  comments.add(res.data);
                                  commentCtrl.clear();
                                });
                                setState(() {
                                  _materialHubPosts = _materialHubPosts.map((p) {
                                    if (p['id'] == post['id']) {
                                      return {
                                        ...p,
                                        'comments_count': ((p['comments_count'] ?? 0) as int) + 1,
                                      };
                                    }
                                    return p;
                                  }).toList();
                                });
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to post comment')));
                              } finally {
                                setModalState(() => isSubmittingComment = false);
                              }
                            },
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: const BoxDecoration(color: AppTheme.primaryBlue, shape: BoxShape.circle),
                        child: const Icon(LucideIcons.send, color: Colors.black, size: 20),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
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
      {'id': 'material_hub', 'label': 'Material Hub', 'icon': LucideIcons.bookOpen, 'c': _materialHubPosts.length},
      {'id': 'inquiries', 'label': 'Support', 'icon': LucideIcons.messageSquare, 'c': _inquiries.length},
    ];

    return Scaffold(
      backgroundColor: colors.background,
      floatingActionButton: _activeTab == 'material_hub'
          ? FloatingActionButton(
              backgroundColor: AppTheme.primaryBlue,
              onPressed: () => _showUploadBottomSheet(colors),
              child: const Icon(LucideIcons.upload, color: Colors.black),
            )
          : null,
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
                                    Builder(
                                      builder: (context) {
                                        final enrolledCourses = context.read<DataProvider>().grades;
                                        if (enrolledCourses.isEmpty) {
                                          return Text(_selectedCourse!['course_name'] ?? 'Unknown', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 22, color: colors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis);
                                        }
                                        return Theme(
                                          data: Theme.of(context).copyWith(
                                            cardColor: colors.card,
                                          ),
                                          child: PopupMenuButton<dynamic>(
                                            tooltip: 'Switch Course',
                                            offset: const Offset(0, 40),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Flexible(
                                                  child: Text(
                                                    _selectedCourse!['course_name'] ?? 'Unknown',
                                                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 22, color: colors.textPrimary),
                                                    maxLines: 2,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                                Icon(LucideIcons.chevronDown, color: colors.textSecondary, size: 20),
                                              ],
                                            ),
                                            onSelected: (newCourse) {
                                              _switchCourse(newCourse);
                                            },
                                            itemBuilder: (ctx) {
                                              return enrolledCourses.map((c) {
                                                return PopupMenuItem<dynamic>(
                                                  value: c,
                                                  child: Text(c['course_name'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, color: colors.textPrimary)),
                                                );
                                              }).toList();
                                            },
                                          ),
                                        );
                                      }
                                    ),
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
                    if (_activeTab == 'material_hub') _buildMaterialHub(colors, auth),
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
  Widget _buildMaterialHub(AppColors colors, AuthProvider auth) {
    final isAdmin = auth.student?['is_admin'] == true || auth.student?['is_admin'] == 1;
    final isReviewer = isAdmin || auth.student?['is_reviewer'] == true || auth.student?['is_reviewer'] == 1;

    final filtered = _materialHubPosts.where((p) {
      final matchesFilter = _materialFilterType == 'all'
          ? true
          : _materialFilterType == 'saved'
              ? (p['has_bookmarked'] == true || p['has_bookmarked'] == 1)
              : p['type'] == _materialFilterType;
      final q = _materialSearchQuery.toLowerCase();
      final matchesSearch = q.isEmpty ||
          (p['caption'] ?? '').toString().toLowerCase().contains(q) ||
          (p['student_name'] ?? '').toString().toLowerCase().contains(q);
      return matchesFilter && matchesSearch;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: colors.surfaceLight,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: TextField(
            controller: _materialSearchController,
            style: TextStyle(color: colors.textPrimary, fontSize: 14),
            decoration: InputDecoration(
              border: InputBorder.none,
              hintText: 'Search materials...',
              hintStyle: TextStyle(color: colors.textHint),
              icon: Icon(LucideIcons.search, color: colors.textHint, size: 18),
            ),
            onChanged: (v) => setState(() => _materialSearchQuery = v),
          ),
        ),
        const SizedBox(height: 16),

        // Filter Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final f in [
                {'id': 'all', 'label': 'All'},
                {'id': 'lecture', 'label': 'Lectures'},
                {'id': 'exam', 'label': 'Exams'},
                {'id': 'saved', 'label': '✦ Saved'},
              ])
                GestureDetector(
                  onTap: () => setState(() => _materialFilterType = f['id']!),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: _materialFilterType == f['id'] ? AppTheme.primaryBlue : colors.surfaceLight,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: _materialFilterType == f['id'] ? AppTheme.primaryBlue : colors.borderSubtle,
                      ),
                    ),
                    child: Text(
                      f['label']!,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _materialFilterType == f['id'] ? Colors.black : colors.textSecondary,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Loading / Empty / List
        if (_isLoadingMaterialHub)
          const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator(color: AppTheme.primaryBlue)))
        else if (filtered.isEmpty)
          _buildEmpty(LucideIcons.bookOpen, 'No materials found', colors)
        else
          ...filtered.map((post) {
            final isOwner = post['student_id']?.toString() == auth.student?['id']?.toString();
            final isPending = post['status'] == 'pending';
            final isRejected = post['status'] == 'rejected';
            final hasUpvoted = post['has_upvoted'] == true || post['has_upvoted'] == 1;
            final hasBookmarked = post['has_bookmarked'] == true || post['has_bookmarked'] == 1;
            final upvotes = (post['upvotes_count'] ?? 0) as int;
            final commentCount = (post['comments_count'] ?? 0) as int;
            final fileUrl = post['file_url']?.toString() ?? '';

            return Container(
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: isRejected
                    ? Colors.redAccent.withOpacity(0.05)
                    : isPending
                        ? Colors.orangeAccent.withOpacity(0.05)
                        : colors.card,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: isRejected
                      ? Colors.redAccent.withOpacity(0.3)
                      : isPending
                          ? Colors.orangeAccent.withOpacity(0.3)
                          : colors.borderSubtle,
                ),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                    child: Row(
                      children: [
                        Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(
                            color: colors.surfaceLight,
                            shape: BoxShape.circle,
                            image: (post['student_avatar_url']?.toString() ?? '').isNotEmpty
                                ? DecorationImage(image: NetworkImage(post['student_avatar_url']), fit: BoxFit.cover)
                                : null,
                          ),
                          child: (post['student_avatar_url']?.toString() ?? '').isEmpty
                              ? Center(child: Text(
                                  (post['student_name'] ?? 'S').toString().substring(0, 1).toUpperCase(),
                                  style: TextStyle(color: colors.textHint, fontWeight: FontWeight.bold),
                                ))
                              : null,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(post['student_name'] ?? 'Student', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: colors.textPrimary)),
                              Text(
                                post['created_at'] != null ? DateTime.parse(post['created_at']).toLocal().toString().split(' ')[0] : '',
                                style: TextStyle(fontSize: 10, color: colors.textHint),
                              ),
                            ],
                          ),
                        ),
                        // Type badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: post['type'] == 'exam' ? Colors.purpleAccent.withOpacity(0.1) : AppTheme.primaryBlue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            (post['type'] ?? 'file').toString().toUpperCase(),
                            style: TextStyle(
                              fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1,
                              color: post['type'] == 'exam' ? Colors.purpleAccent : AppTheme.primaryBlue,
                            ),
                          ),
                        ),
                        // Status badge for pending/rejected
                        if (isPending || isRejected) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isRejected ? Colors.redAccent.withOpacity(0.1) : Colors.orangeAccent.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              isPending ? 'PENDING' : 'REJECTED',
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1, color: isPending ? Colors.orangeAccent : Colors.redAccent),
                            ),
                          ),
                        ],
                        // Delete for owner
                        if (isOwner)
                          IconButton(
                            icon: Icon(LucideIcons.trash2, size: 16, color: Colors.redAccent.withOpacity(0.7)),
                            onPressed: () => _deletePost(post),
                          ),
                      ],
                    ),
                  ),

                  // Caption
                  if ((post['caption'] ?? '').toString().isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                      child: Text(post['caption'], style: TextStyle(fontSize: 14, color: colors.textSecondary, height: 1.5)),
                    ),

                  // Rejection reason
                  if (isRejected && (post['reject_reason'] ?? '').toString().isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.redAccent.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.redAccent.withOpacity(0.2)),
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.alertCircle, color: Colors.redAccent, size: 14),
                            const SizedBox(width: 8),
                            Expanded(child: Text(post['reject_reason'], style: const TextStyle(fontSize: 12, color: Colors.redAccent))),
                          ],
                        ),
                      ),
                    ),

                  // File button
                  if (fileUrl.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                      child: GestureDetector(
                        onTap: () => launchUrl(Uri.parse(fileUrl), mode: LaunchMode.externalApplication),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: colors.surfaceLight,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: colors.borderSubtle),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 40, height: 40,
                                decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                                child: const Icon(LucideIcons.fileText, color: AppTheme.primaryBlue, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(post['file_name'] ?? 'View File', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: colors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                                  Text('TAP TO OPEN', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: colors.textHint, letterSpacing: 1.5)),
                                ],
                              )),
                              Icon(LucideIcons.externalLink, color: colors.textSecondary, size: 16),
                            ],
                          ),
                        ),
                      ),
                    ),

                  // Action Bar
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
                    child: Row(
                      children: [
                        // Upvote
                        GestureDetector(
                          onTap: () => _toggleUpvote(post),
                          child: Row(
                            children: [
                              Icon(
                                hasUpvoted ? LucideIcons.thumbsUp : LucideIcons.thumbsUp,
                                size: 18,
                                color: hasUpvoted ? AppTheme.primaryBlue : colors.textSecondary,
                              ),
                              const SizedBox(width: 4),
                              Text('$upvotes', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: hasUpvoted ? AppTheme.primaryBlue : colors.textSecondary)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 20),
                        // Comments
                        GestureDetector(
                          onTap: () => _showCommentsBottomSheet(post, colors),
                          child: Row(
                            children: [
                              Icon(LucideIcons.messageCircle, size: 18, color: colors.textSecondary),
                              const SizedBox(width: 4),
                              Text('$commentCount', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: colors.textSecondary)),
                            ],
                          ),
                        ),
                        const Spacer(),
                        // Bookmark
                        GestureDetector(
                          onTap: () => _toggleBookmark(post),
                          child: Icon(
                            hasBookmarked ? LucideIcons.bookmark : LucideIcons.bookmark,
                            size: 20,
                            color: hasBookmarked ? Colors.amber : colors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Moderator Panel
                  if (isReviewer && isPending) ...[
                    Divider(color: colors.divider, height: 1),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('MODERATOR ACTIONS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: colors.textHint, letterSpacing: 1.5)),
                          const SizedBox(height: 12),
                          if (_rejectingPostId == post['id']?.toString()) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(12), border: Border.all(color: colors.borderSubtle)),
                              child: TextField(
                                controller: _rejectReasonController,
                                style: TextStyle(color: colors.textPrimary, fontSize: 13),
                                decoration: const InputDecoration(border: InputBorder.none, hintText: 'Rejection reason...'),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: _isReviewing ? null : () => _moderatePost(post, 'rejected', _rejectReasonController.text),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      decoration: BoxDecoration(color: Colors.redAccent, borderRadius: BorderRadius.circular(12)),
                                      child: Center(child: Text('CONFIRM REJECT', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 0.5))),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                GestureDetector(
                                  onTap: () => setState(() => _rejectingPostId = null),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                    decoration: BoxDecoration(color: colors.surfaceLight, borderRadius: BorderRadius.circular(12)),
                                    child: Text('CANCEL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: colors.textSecondary)),
                                  ),
                                ),
                              ],
                            ),
                          ] else
                            Row(
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: _isReviewing ? null : () => _moderatePost(post, 'approved', ''),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      decoration: BoxDecoration(color: Colors.green, borderRadius: BorderRadius.circular(12)),
                                      child: const Center(child: Text('APPROVE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1))),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () => setState(() => _rejectingPostId = post['id']?.toString()),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      decoration: BoxDecoration(color: Colors.redAccent, borderRadius: BorderRadius.circular(12)),
                                      child: const Center(child: Text('REJECT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1))),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            );
          }),
      ],
    );
  }
}
