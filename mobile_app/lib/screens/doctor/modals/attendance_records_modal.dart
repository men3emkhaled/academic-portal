import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme.dart';
import '../../../services/api_service.dart';

class AttendanceRecordsModal extends StatefulWidget {
  final dynamic session;
  final ScrollController scrollController;

  const AttendanceRecordsModal({
    super.key,
    required this.session,
    required this.scrollController,
  });

  @override
  State<AttendanceRecordsModal> createState() => _AttendanceRecordsModalState();
}

class _AttendanceRecordsModalState extends State<AttendanceRecordsModal> {
  final ApiService _apiService = ApiService();
  List<dynamic> _records = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRecords();
  }

  Future<void> _fetchRecords() async {
    setState(() => _isLoading = true);
    try {
      final res = await _apiService.dio.get(
          '/doctor/attendance/sessions/${widget.session['id']}/records');
      setState(() {
        _records = res.data ?? [];
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
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
                color: colors.divider, borderRadius: BorderRadius.circular(2)),
          ),
          const SizedBox(height: 20),
          Text(
            'Attendance Records',
            style: TextStyle(
                color: colors.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.w900),
          ),
          if (widget.session['date'] != null) ...[
            const SizedBox(height: 4),
            Text(
              DateTime.parse(widget.session['date'])
                  .toLocal()
                  .toString()
                  .substring(0, 10),
              style: TextStyle(color: colors.textSecondary, fontSize: 13),
            ),
          ],
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppTheme.primary))
                : _records.isEmpty
                    ? Center(
                        child: Text('No attendance records found.',
                            style: TextStyle(color: colors.textSecondary)))
                    : ListView.builder(
                        controller: widget.scrollController,
                        itemCount: _records.length,
                        itemBuilder: (context, index) {
                          final rec = _records[index];
                          return ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.green.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(LucideIcons.check,
                                  color: Colors.green, size: 18),
                            ),
                            title: Text(
                              rec['student_name'] ?? 'Student',
                              style: TextStyle(
                                  color: colors.textPrimary,
                                  fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text('ID: ${rec['student_id']}',
                                style: TextStyle(color: colors.textSecondary)),
                            trailing: Text(
                              rec['scanned_at'] != null
                                  ? DateTime.parse(rec['scanned_at'])
                                      .toLocal()
                                      .toString()
                                      .substring(11, 16)
                                  : '',
                              style: TextStyle(
                                  color: colors.textSecondary, fontSize: 11),
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
