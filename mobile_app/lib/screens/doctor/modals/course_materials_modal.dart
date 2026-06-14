import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme.dart';
import '../../../services/api_service.dart';

class CourseMaterialsModal extends StatefulWidget {
  final dynamic course;
  final ScrollController scrollController;

  const CourseMaterialsModal({
    super.key,
    required this.course,
    required this.scrollController,
  });

  @override
  State<CourseMaterialsModal> createState() => _CourseMaterialsModalState();
}

class _CourseMaterialsModalState extends State<CourseMaterialsModal> {
  final ApiService _apiService = ApiService();
  List<dynamic> _materials = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMaterials();
  }

  Future<void> _fetchMaterials() async {
    setState(() => _isLoading = true);
    try {
      final res =
          await _apiService.dio.get('/doctor/resources/${widget.course['id']}');
      setState(() {
        _materials = res.data ?? [];
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteMaterial(dynamic id) async {
    try {
      await _apiService.dio.delete('/doctor/resources/$id');
      _fetchMaterials();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    return Container(
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        border: Border.all(color: colors.borderSubtle),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: colors.divider,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Materials: ${widget.course['name']}',
                  style: TextStyle(
                    color: colors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              IconButton(
                icon: const Icon(LucideIcons.plus, color: AppTheme.primary),
                onPressed: () {}, // TODO: Add material
              ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppTheme.primary))
                : _materials.isEmpty
                    ? Center(
                        child: Text(
                          'No materials uploaded yet.',
                          style: TextStyle(color: colors.textSecondary),
                        ),
                      )
                    : ListView.builder(
                        controller: widget.scrollController,
                        itemCount: _materials.length,
                        itemBuilder: (context, index) {
                          final mat = _materials[index];
                          return Card(
                            color: colors.card,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: colors.borderSubtle),
                            ),
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppTheme.primary.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(LucideIcons.file,
                                    color: AppTheme.primary),
                              ),
                              title: Text(mat['title'] ?? 'Resource',
                                  style: TextStyle(
                                      color: colors.textPrimary,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14)),
                              subtitle: Text(mat['type'] ?? 'document',
                                  style: TextStyle(
                                      color: colors.textSecondary,
                                      fontSize: 11)),
                              trailing: IconButton(
                                icon: const Icon(LucideIcons.trash2,
                                    color: Colors.redAccent, size: 18),
                                onPressed: () => _deleteMaterial(mat['id']),
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
