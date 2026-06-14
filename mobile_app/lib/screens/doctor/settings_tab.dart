import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../theme.dart';
import '../../providers/auth_provider.dart';
import '../ui_helpers.dart';

class DoctorSettingsTab extends StatefulWidget {
  const DoctorSettingsTab({super.key});

  @override
  State<DoctorSettingsTab> createState() => _DoctorSettingsTabState();
}

class _DoctorSettingsTabState extends State<DoctorSettingsTab> {
  final ImagePicker _picker = ImagePicker();
  bool _isAvatarUploading = false;

  Future<void> _uploadAvatar() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 70,
    );
    if (image == null) return;
    if (!mounted) return;
    setState(() => _isAvatarUploading = true);
    final auth = context.read<AuthProvider>();
    final res = await auth.uploadAvatar(image.path);
    if (!mounted) return;
    setState(() => _isAvatarUploading = false);

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(res['success']
            ? 'Avatar uploaded successfully'
            : res['message'] ?? 'Failed to upload avatar'),
      ),
    );
  }

  void _changePasswordModal() {
    final oldCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final colors = Theme.of(context).extension<AppColors>()!;
        return Padding(
          padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: colors.background,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(32)),
              border: Border.all(color: colors.borderSubtle),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Change Password',
                    style: TextStyle(
                        color: colors.textPrimary,
                        fontSize: 18,
                        fontWeight: FontWeight.w900)),
                const SizedBox(height: 20),
                TextField(
                  controller: oldCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Current Password',
                    prefixIcon: Icon(LucideIcons.lock),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: newCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'New Password',
                    prefixIcon: Icon(LucideIcons.unlock),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 50),
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.black,
                  ),
                  onPressed: () async {
                    final auth = context.read<AuthProvider>();
                    final res = await auth.changePassword(
                        oldCtrl.text, newCtrl.text);
                    if (!context.mounted) return;
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text(res['success']
                          ? 'Password changed!'
                          : res['message'] ?? 'Failed'),
                    ));
                  },
                  child: const Text('Update Password',
                      style: TextStyle(fontWeight: FontWeight.w900)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final auth = context.watch<AuthProvider>();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const GradientText('My Profile', fontSize: 28),
          const SizedBox(height: 24),

          // Profile Card
          GlassContainer(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundImage: auth.student?['avatar_url'] != null
                          ? NetworkImage(auth.student!['avatar_url'])
                          : null,
                      child: auth.student?['avatar_url'] == null
                          ? const Icon(LucideIcons.user, size: 36)
                          : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: _isAvatarUploading ? null : _uploadAvatar,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: AppTheme.primary,
                            shape: BoxShape.circle,
                          ),
                          child: _isAvatarUploading
                              ? const SizedBox(
                                  width: 12,
                                  height: 12,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.black,
                                  ),
                                )
                              : const Icon(LucideIcons.camera,
                                  size: 12, color: Colors.black),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        auth.studentName ?? 'Doctor',
                        style: TextStyle(
                          color: colors.textPrimary,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        auth.student?['email'] ?? 'doctor@znu.edu',
                        style: TextStyle(
                            color: colors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Doctor / Faculty Member',
                          style: TextStyle(
                            color: AppTheme.primary,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Settings options
          _option(
            'Account Security',
            'Change your account password.',
            LucideIcons.shieldAlert,
            _changePasswordModal,
            colors,
          ),
          _option(
            'Logout',
            'Sign out of your Doctor account safely.',
            LucideIcons.logOut,
            () {
              auth.logout();
              context.go('/login');
            },
            colors,
            isDestructive: true,
          ),
        ],
      ),
    );
  }

  Widget _option(String title, String desc, IconData icon, VoidCallback onTap,
      AppColors colors, {bool isDestructive = false}) {
    return GestureDetector(
      onTap: onTap,
      child: GlassContainer(
        padding: const EdgeInsets.all(18),
        margin: const EdgeInsets.only(bottom: 16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isDestructive
                    ? Colors.red.withValues(alpha: 0.1)
                    : AppTheme.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon,
                  color: isDestructive ? Colors.redAccent : AppTheme.primary,
                  size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: TextStyle(
                          color: isDestructive
                              ? Colors.redAccent
                              : colors.textPrimary,
                          fontSize: 15,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(desc,
                      style: TextStyle(
                          color: colors.textSecondary, fontSize: 12)),
                ],
              ),
            ),
            Icon(LucideIcons.chevronRight, color: colors.textHint, size: 20),
          ],
        ),
      ),
    );
  }
}
