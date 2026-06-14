import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../theme.dart';
import 'ui_helpers.dart';

class GradesTab extends StatelessWidget {
  const GradesTab({super.key});

  double _parseScore(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }

  Color _getGradeColor(dynamic score, dynamic max) {
      if (score == null) return Colors.grey;
      double sc = _parseScore(score);
      double m = _parseScore(max);
      if (m == 0.0) m = 100.0;
      double percentage = (sc / m) * 100;
      if (percentage >= 50) return Colors.greenAccent;
      return Colors.redAccent;
  }

  String _formatScore(dynamic score) {
      if (score == null) return '-';
      double val = _parseScore(score);
      return val.toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '');
  }

  String _getStatus(Map<String, dynamic> grade) {
     final midterm = grade['midterm_score'];
     final prac = grade['practical_score'];
     final oral = grade['oral_score'];
     final max = _parseScore(grade['max_score']);
     final msc = _parseScore(midterm);
     final psc = _parseScore(prac);
     final osc = _parseScore(oral);

     if (midterm != null && prac != null && oral != null) {
        final total = msc + psc + osc;
        double perc = (total / (max == 0.0 ? 100.0 : max)) * 100;
        return perc >= 50 ? 'Passing' : 'Failing';
     }
     return 'Pending';
  }

  @override
  Widget build(BuildContext context) {
    final dataProvider = context.watch<DataProvider>();
    final colors = Theme.of(context).extension<AppColors>()!;
    final summary = dataProvider.gradesSummary;
    final grades = dataProvider.grades;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             Padding(
               padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
               child: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                    const GradientText('My Grades', fontSize: 40),
                    const SizedBox(height: 4),
                    Text('All enrolled courses', style: TextStyle(color: colors.textSecondary, fontSize: 13, fontWeight: FontWeight.bold)),
                 ],
               ),
             ),

             Expanded(
                child: dataProvider.isLoadingGrades 
                  ? const Center(child: CircularProgressIndicator())
                  : CustomScrollView(
                     slivers: [
                        if (summary.isNotEmpty)
                          SliverPadding(
                             padding: const EdgeInsets.symmetric(horizontal: 24),
                             sliver: SliverToBoxAdapter(
                             child: Column(
                               children: [
                                 Row(
                                   children: [
                                     Expanded(child: _buildMetricCard('Total Score', _parseScore(summary['totalEarned']).toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), ''), '/${_parseScore(summary['totalPossible']).toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '')}', LucideIcons.barChart, AppTheme.primaryBlue, colors)),
                                     const SizedBox(width: 12),
                                     Expanded(
                                       child: GlassContainer(
                                         padding: const EdgeInsets.all(16),
                                         backgroundColor: colors.card,
                                         child: Column(
                                           crossAxisAlignment: CrossAxisAlignment.start,
                                           children: [
                                             Icon(LucideIcons.trendingUp, color: AppTheme.primary, size: 24),
                                             const SizedBox(height: 8),
                                             Text('OVERALL %', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.2)),
                                             const SizedBox(height: 4),
                                             Text('${_parseScore(summary['overallPercentage']).toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '')}%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppTheme.primary)),
                                             const SizedBox(height: 8),
                                             ClipRRect(
                                                borderRadius: BorderRadius.circular(4),
                                                child: LinearProgressIndicator(
                                                   value: _parseScore(summary['overallPercentage']) / 100,
                                                   minHeight: 4,
                                                   backgroundColor: colors.borderSubtle,
                                                   valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                                                ),
                                             )
                                           ],
                                         )
                                       )
                                     )
                                   ],
                                 ),
                                 Row(
                                    children: [
                                       Expanded(child: _buildMetricCard('Courses Passed', '${summary['coursesPassed'] ?? 0}', '/${grades.length}', LucideIcons.checkCircle, Colors.purpleAccent, colors)),
                                       const SizedBox(width: 12),
                                       Expanded(child: _buildMetricCard('Total Courses', '${grades.length}', '', LucideIcons.bookOpen, colors.textPrimary, colors)),
                                    ],
                                 ),
                                 const SizedBox(height: 24),
                               ],
                             )
                           )
                          ),
                        
                        SliverPadding(
                           padding: const EdgeInsets.symmetric(horizontal: 24),
                           sliver: SliverToBoxAdapter(
                             child: Row(
                               children: [
                                 Container(width: 6, height: 24, decoration: BoxDecoration(color: AppTheme.primaryBlue, borderRadius: BorderRadius.circular(3))),
                                 const SizedBox(width: 12),
                                 Text('Your Grades', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: colors.textPrimary)),
                               ],
                             ),
                           ),
                        ),
                        const SliverPadding(
                           padding: EdgeInsets.symmetric(horizontal: 24),
                           sliver: SliverToBoxAdapter(child: SizedBox(height: 16))
                        ),
                        
                        if (grades.isEmpty)
                          SliverPadding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            sliver: SliverToBoxAdapter(
                              child: GlassContainer(
                                backgroundColor: colors.surfaceLight,
                                child: Center(child: Text("No enrolled courses found.", style: TextStyle(color: colors.textSecondary)))
                              )
                            )
                          )
                        else
                          SliverPadding(
                             padding: const EdgeInsets.symmetric(horizontal: 24),
                             sliver: SliverList(
                             delegate: SliverChildBuilderDelegate((ctx, i) {
                               final grade = grades[i];
                               final total = _parseScore(grade['midterm_score']) + _parseScore(grade['practical_score']) + _parseScore(grade['oral_score']);
                               final status = _getStatus(grade);
                               Color statusColor = colors.textSecondary;
                               if (status == 'Passing') statusColor = Colors.greenAccent;
                               if (status == 'Failing') statusColor = Colors.redAccent;

                               return GlassContainer(
                                 backgroundColor: colors.card,
                                 child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                       Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                             Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(grade['course_name'] ?? '', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: colors.textPrimary)),
                                                    const SizedBox(height: 4),
                                                    Text('COURSE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: colors.textSecondary)),
                                                  ],
                                                )
                                             ),
                                             if (status != 'Pending')
                                               Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                                  decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), border: Border.all(color: statusColor.withValues(alpha: 0.3)), borderRadius: BorderRadius.circular(16)),
                                                  child: Text(status.toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: statusColor, letterSpacing: 1.5)),
                                               )
                                          ],
                                       ),
                                       const SizedBox(height: 16),
                                       Row(
                                         children: [
                                           _buildScoreBox('Midterm', grade['midterm_score'], grade['midterm_max'], colors),
                                           const SizedBox(width: 8),
                                           _buildScoreBox('Practical', grade['practical_score'], grade['practical_max'], colors),
                                           const SizedBox(width: 8),
                                           _buildScoreBox('Oral', grade['oral_score'], grade['oral_max'], colors),
                                         ],
                                       ),
                                       const SizedBox(height: 16),
                                       Container(height: 1, color: colors.divider),
                                       const SizedBox(height: 12),
                                       Row(
                                         mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                         children: [
                                            Text('TOTAL SCORE', style: TextStyle(color: colors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                                            RichText(text: TextSpan(
                                               children: [
                                                  TextSpan(text: total.toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), ''), style: TextStyle(fontWeight: FontWeight.w900, fontSize: 24, color: _getGradeColor(total, grade['max_score']))),
                                                  TextSpan(text: ' / ${grade['max_score']}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: colors.textSecondary))
                                               ]
                                            ))
                                         ],
                                       )
                                    ],
                                 )
                               );
                             }, childCount: grades.length)
                           )
                          )
                     ],
                  )
             )
          ],
        )
      )
    );
  }

  Widget _buildMetricCard(String title, String val1, String val2, IconData i, Color c, AppColors colors) {
      return GlassContainer(
         padding: const EdgeInsets.all(16),
         backgroundColor: colors.card,
         child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
               Icon(i, color: c, size: 24),
               const SizedBox(height: 8),
               Text(title.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.2)),
               const SizedBox(height: 4),
               RichText(text: TextSpan(
                  children: [
                     TextSpan(text: val1, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 24, color: c)),
                     if (val2.isNotEmpty) TextSpan(text: val2, style: TextStyle(fontSize: 14, color: colors.textSecondary, fontWeight: FontWeight.bold)),
                  ]
               ))
            ],
         )
      );
  }

  Widget _buildScoreBox(String lbl, dynamic sc, dynamic m, AppColors colors) {
     return Expanded(
       child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(color: colors.scoreBoxBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: colors.borderSubtle)),
          child: Column(
             children: [
                Text(lbl, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: colors.textSecondary, letterSpacing: 1.2)),
                const SizedBox(height: 8),
                Text(_formatScore(sc), style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: _getGradeColor(sc, m)))
             ],
          )
       )
     );
  }
}
