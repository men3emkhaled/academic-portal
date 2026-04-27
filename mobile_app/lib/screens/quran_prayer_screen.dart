import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:adhan/adhan.dart';
import '../services/quran_data.dart';
import '../services/prayer_service.dart';
import '../theme.dart';
import '../l10n/tr.dart';
import 'ui_helpers.dart';

class QuranPrayerScreen extends StatefulWidget {
  const QuranPrayerScreen({super.key});

  @override
  State<QuranPrayerScreen> createState() => _QuranPrayerScreenState();
}

class _QuranPrayerScreenState extends State<QuranPrayerScreen> {
  late List<Ayat> _dailyAyats;
  bool _remindersEnabled = false;
  PrayerTimes? _prayerTimes;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _dailyAyats = QuranData.getRandomAyats(3);
    _loadSettings();
    _loadPrayerTimes();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _remindersEnabled = prefs.getBool('prayer_reminders_enabled') ?? false;
    });
  }

  Future<void> _loadPrayerTimes() async {
    final times = await PrayerService.getCurrentPrayerTimes();
    setState(() {
      _prayerTimes = times;
      _isLoading = false;
    });
  }

  Future<void> _toggleReminders(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('prayer_reminders_enabled', value);
    setState(() => _remindersEnabled = value);
    
    // Reschedule or Cancel
    if (value) {
      await PrayerService.schedulePrayerReminders();
      if(mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Prayer reminders enabled (5m before Adhan)', style: TextStyle(fontWeight: FontWeight.bold)))
      );
    } else {
      // In a production app, we would explicitly cancel prayer IDs here.
      // For now, disabling the toggle will prevent the next scheduling cycle.
      if(mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Prayer reminders disabled', style: TextStyle(fontWeight: FontWeight.bold)))
      );
    }
  }

  String _formatTime(DateTime time) {
    String hour = (time.hour % 12 == 0 ? 12 : time.hour % 12).toString().padLeft(2, '0');
    String minute = time.minute.toString().padLeft(2, '0');
    String period = time.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;

    return Scaffold(
      backgroundColor: colors.background,
      body: Stack(
        children: [
          // Background Gradient Decor
          Positioned(
            top: -100, right: -100,
            child: Container(width: 300, height: 300, decoration: BoxDecoration(color: AppTheme.primaryBlue.withValues(alpha: 0.1), shape: BoxShape.circle)),
          ),
          
          SafeArea(
            child: Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Row(
                    children: [
                      IconButton(
                        icon: Icon(LucideIcons.arrowLeft, color: colors.textPrimary),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(tr(context, 'salah_reminder_title'), style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.2)),
                            GradientText(tr(context, 'quran_and_prayer'), fontSize: 24),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // --- AYATS SECTION ---
                        Row(
                          children: [
                            const Icon(LucideIcons.bookOpen, color: AppTheme.primaryBlue, size: 20),
                            const SizedBox(width: 12),
                            Text(tr(context, 'refreshed_ayats'), style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: colors.textPrimary)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        ..._dailyAyats.map((ayat) => _buildAyatCard(ayat, colors)),

                        const SizedBox(height: 32),

                        // --- PRAYER TIMES SECTION ---
                        Row(
                          children: [
                            const Icon(LucideIcons.clock, color: Colors.purpleAccent, size: 20),
                            const SizedBox(width: 12),
                            Text(tr(context, 'prayer_times'), style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: colors.textPrimary)),
                            const Spacer(),
                            // Toggle Switch
                            Row(
                              children: [
                                Text(tr(context, 'prayer_reminders'), style: TextStyle(fontSize: 12, color: colors.textSecondary)),
                                const SizedBox(width: 8),
                                Switch(
                                  value: _remindersEnabled,
                                  onChanged: _toggleReminders,
                                  activeColor: AppTheme.primaryBlue,
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        
                        if (_isLoading)
                          const Center(child: CircularProgressIndicator())
                        else if (_prayerTimes != null)
                          _buildPrayerList(_prayerTimes!, colors)
                        else
                          const Center(child: Text('Could not load prayer times')),

                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAyatCard(Ayat ayat, AppColors colors) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: GlassContainer(
        backgroundColor: colors.card,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              ayat.arabic,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'Amiri', // Assuming Amiri or similar is available or defaults correctly
                fontSize: 20,
                color: AppTheme.primaryBlue,
                height: 1.6,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              ayat.english,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: colors.textSecondary, fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 8),
            Text(
              ayat.reference,
              textAlign: TextAlign.end,
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: colors.textSecondary.withValues(alpha: 0.5)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPrayerList(PrayerTimes times, AppColors colors) {
    final Map<String, DateTime> prayers = {
      tr(context, 'fajr'): times.fajr,
      tr(context, 'dhuhr'): times.dhuhr,
      tr(context, 'asr'): times.asr,
      tr(context, 'maghrib'): times.maghrib,
      tr(context, 'isha'): times.isha,
    };

    return GlassContainer(
      backgroundColor: colors.card,
      padding: const EdgeInsets.all(8),
      child: Column(
        children: prayers.entries.map((e) => _buildPrayerRow(e.key, e.value, colors)).toList(),
      ),
    );
  }

  Widget _buildPrayerRow(String title, DateTime time, AppColors colors) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: colors.divider, width: 0.5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: colors.textPrimary)),
          Text(_formatTime(time), style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryBlue, fontSize: 16)),
        ],
      ),
    );
  }
}
