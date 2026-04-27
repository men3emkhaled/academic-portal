import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../providers/auth_provider.dart';
import '../theme.dart';
import '../l10n/tr.dart';
import '../services/fcm_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with TickerProviderStateMixin {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _showPassword = false;
  bool _rememberDevice = false;
  bool _isGoogleLoading = false;
  String? _errorMessage;
  String _focused = '';

  late AnimationController _fadeCtrl;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _fadeCtrl.forward();
    _loadSavedCredentials();
  }

  Future<void> _loadSavedCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    final savedId = prefs.getString('saved_student_id');
    final savedPass = prefs.getString('saved_password');
    if (savedId != null && savedPass != null) {
      setState(() {
        _usernameController.text = savedId;
        _passwordController.text = savedPass;
        _rememberDevice = true;
      });
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _fadeCtrl.dispose();
    super.dispose();
  }

  void _showForgotPassword(BuildContext context) {
    final forgotCtl = TextEditingController();
    final colors = Theme.of(context).extension<AppColors>()!;
    bool sending = false;
    bool sent = false;
    String? error;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setStateModal) {
          return Padding(
            padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 16, right: 16, top: 16),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: colors.card,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: colors.borderSubtle),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Forget Password', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w900, fontSize: 20)),
                  const SizedBox(height: 8),
                  Text('Enter your Student ID and we will send a reset link to your linked email.', style: TextStyle(color: colors.textSecondary, fontSize: 13)),
                  const SizedBox(height: 20),
                  TextField(
                    controller: forgotCtl,
                    style: TextStyle(color: colors.textPrimary),
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      hintText: 'Student ID',
                      hintStyle: TextStyle(color: colors.textHint),
                      filled: true,
                      fillColor: colors.surfaceLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                      prefixIcon: Icon(LucideIcons.fingerprint, color: colors.textHint),
                    ),
                  ),
                  if (error != null) ...[
                    const SizedBox(height: 12),
                    Text(error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                  ],
                  if (sent) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.greenAccent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                      child: const Text('Reset link sent to your email!', style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold)),
                    ),
                  ],
                  const SizedBox(height: 20),
                  Row(children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => Navigator.pop(ctx),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(border: Border.all(color: colors.borderSubtle), borderRadius: BorderRadius.circular(16)),
                          alignment: Alignment.center,
                          child: Text('Cancel', style: TextStyle(fontWeight: FontWeight.bold, color: colors.textPrimary)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: GestureDetector(
                        onTap: () async {
                          if (forgotCtl.text.trim().isEmpty) return;
                          setStateModal(() { sending = true; error = null; });
                          final res = await context.read<AuthProvider>().forgotPassword(forgotCtl.text.trim());
                          setStateModal(() { sending = false; });
                          if (res['success'] == true) {
                            setStateModal(() => sent = true);
                          } else {
                            setStateModal(() => error = res['message'] ?? 'Failed');
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.4), blurRadius: 15)]),
                          alignment: Alignment.center,
                          child: sending
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                            : const Text('Send Reset Link', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black)),
                        ),
                      ),
                    ),
                  ]),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _handleGoogleLogin() async {
    setState(() { _isGoogleLoading = true; _errorMessage = null; });
    try {
      final googleSignIn = GoogleSignIn(
        scopes: ['email'],
        serverClientId: '407444968316-d0mmu1duk58gcschp0udu4vv5vavua3o.apps.googleusercontent.com',
      );
      final account = await googleSignIn.signIn();
      if (account == null) {
        setState(() => _isGoogleLoading = false);
        return; // User cancelled
      }
      final auth = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null) {
        setState(() { _isGoogleLoading = false; _errorMessage = 'Could not get Google token'; });
        return;
      }
      if (!mounted) return;
      final result = await context.read<AuthProvider>().googleLogin(idToken);
      if (!mounted) return;
      setState(() => _isGoogleLoading = false);
      if (result['success'] == true) {
        try {
          final fcmToken = await FCMService.getToken();
          if (fcmToken != null) {
            await context.read<AuthProvider>().updateFcmToken(fcmToken);
          }
        } catch (_) {}
        if (mounted) context.go('/dashboard');
      } else {
        setState(() => _errorMessage = result['message'] ?? 'Google login failed');
      }
    } catch (e) {
      if (mounted) setState(() { _isGoogleLoading = false; _errorMessage = 'Google sign-in error: $e'; });
    }
  }

  Future<void> _handleLogin() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text.trim();
    if (username.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please enter both Student ID and password.');
      return;
    }
    setState(() { _isLoading = true; _errorMessage = null; });
    final result = await context.read<AuthProvider>().login(username, password);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (result['success']) {
      // Save or clear credentials based on remember device
      final prefs = await SharedPreferences.getInstance();
      if (_rememberDevice) {
        await prefs.setString('saved_student_id', username);
        await prefs.setString('saved_password', password);
      } else {
        await prefs.remove('saved_student_id');
        await prefs.remove('saved_password');
      }
      if (!mounted) return;
      
      // Register FCM Token
      try {
        final fcmToken = await FCMService.getToken();
        if (fcmToken != null) {
          final authProvider = context.read<AuthProvider>();
          final response = await authProvider.updateFcmToken(fcmToken);
          if (response['success']) {
            debugPrint('FCM Token registered successfully');
          } else {
            debugPrint('FCM Token registration failed: ${response['message']}');
          }
        }
      } catch (e) {
        debugPrint('Error during FCM registration: $e');
      }

      context.go('/dashboard');
    } else {
      setState(() => _errorMessage = result['message'] ?? 'Login failed');
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;

    return Scaffold(
      backgroundColor: colors.background,
      body: Stack(
        children: [
          // Ambient Background Blobs
          Positioned(top: MediaQuery.of(context).size.height * 0.08, left: MediaQuery.of(context).size.width * 0.1,
            child: _blob(MediaQuery.of(context).size.width * 0.5, AppTheme.primary.withValues(alpha: 0.05))),
          Positioned(bottom: MediaQuery.of(context).size.height * 0.08, right: 0,
            child: _blob(MediaQuery.of(context).size.width * 0.6, AppTheme.primary.withValues(alpha: 0.08))),

          SafeArea(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  children: [
                    const SizedBox(height: 24),

                    // ── LOGIN CARD ──
                    Container(
                      decoration: BoxDecoration(
                        color: colors.card,
                        borderRadius: BorderRadius.circular(32),
                        border: Border.all(color: colors.borderSubtle),
                        boxShadow: [BoxShadow(color: colors.cardShadow, blurRadius: 40, offset: const Offset(0, 20))],
                      ),
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        children: [
                          // Z Logo
                          Container(
                            width: 80, height: 80,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [AppTheme.primary, Color(0xFF5CA846)]),
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.35), blurRadius: 30)],
                            ),
                            child: Stack(
                              children: [
                                Positioned.fill(
                                  child: Padding(
                                    padding: const EdgeInsets.all(3),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: colors.isDark ? const Color(0xFF111111) : colors.card,
                                        borderRadius: BorderRadius.circular(21),
                                      ),
                                    ),
                                  ),
                                ),
                                Center(
                                  child: ShaderMask(
                                    shaderCallback: (bounds) => LinearGradient(
                                      colors: [colors.isDark ? Colors.white : colors.textPrimary, AppTheme.primary],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ).createShader(bounds),
                                    child: const Text('Z', style: TextStyle(fontSize: 40, fontWeight: FontWeight.w900, color: Colors.white)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text('ZNU ${tr(context, 'student_portal')}', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: colors.textPrimary, letterSpacing: -0.5)),
                          const SizedBox(height: 6),
                          Text(tr(context, 'sign_in_subtitle'), style: TextStyle(color: colors.textSecondary, fontSize: 13)),

                          const SizedBox(height: 32),

                          // ── Error Message ──
                          if (_errorMessage != null) ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              margin: const EdgeInsets.only(bottom: 16),
                              decoration: BoxDecoration(
                                color: Colors.redAccent.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.redAccent.withValues(alpha: 0.3)),
                              ),
                              child: Row(children: [
                                Icon(LucideIcons.alertCircle, color: Colors.redAccent, size: 18),
                                const SizedBox(width: 8),
                                Expanded(child: Text(_errorMessage!, style: const TextStyle(color: Colors.redAccent, fontSize: 13))),
                              ]),
                            ),
                          ],

                          // ── Student ID Field ──
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(tr(context, 'student_id'), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.primary, letterSpacing: 2)),
                              const SizedBox(height: 8),
                              AnimatedScale(
                                scale: _focused == 'id' ? 1.02 : 1.0,
                                duration: const Duration(milliseconds: 200),
                                child: TextField(
                                  controller: _usernameController,
                                  onTap: () => setState(() => _focused = 'id'),
                                  onTapOutside: (_) => setState(() => _focused = ''),
                                  style: TextStyle(color: colors.textPrimary),
                                  decoration: InputDecoration(
                                    hintText: tr(context, 'student_id_hint'),
                                    hintStyle: TextStyle(color: colors.textHint, fontSize: 14),
                                    prefixIcon: Icon(LucideIcons.fingerprint, color: _focused == 'id' ? AppTheme.primary : colors.textHint),
                                    contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
                                  ),
                                  keyboardType: TextInputType.number,
                                  textInputAction: TextInputAction.next,
                                  enabled: !_isLoading,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),

                          // ── Password Field ──
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(tr(context, 'password'), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.primary, letterSpacing: 2)),
                              const SizedBox(height: 8),
                              AnimatedScale(
                                scale: _focused == 'pw' ? 1.02 : 1.0,
                                duration: const Duration(milliseconds: 200),
                                child: TextField(
                                  controller: _passwordController,
                                  obscureText: !_showPassword,
                                  onTap: () => setState(() => _focused = 'pw'),
                                  onTapOutside: (_) => setState(() => _focused = ''),
                                  style: TextStyle(color: colors.textPrimary),
                                  decoration: InputDecoration(
                                    hintText: '••••••••',
                                    hintStyle: TextStyle(color: colors.textHint, fontSize: 14),
                                    prefixIcon: Icon(LucideIcons.lock, color: _focused == 'pw' ? AppTheme.primary : colors.textHint),
                                    suffixIcon: GestureDetector(
                                      onTap: () => setState(() => _showPassword = !_showPassword),
                                      child: Icon(_showPassword ? LucideIcons.eyeOff : LucideIcons.eye,
                                          color: colors.textHint, size: 20),
                                    ),
                                    contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
                                  ),
                                  textInputAction: TextInputAction.done,
                                  onSubmitted: (_) => _handleLogin(),
                                  enabled: !_isLoading,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // ── Remember Device ──
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              GestureDetector(
                                onTap: () => setState(() => _rememberDevice = !_rememberDevice),
                                child: Row(children: [
                                  Checkbox(
                                    value: _rememberDevice,
                                    onChanged: (v) => setState(() => _rememberDevice = v == true),
                                    activeColor: AppTheme.primary,
                                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  Text(tr(context, 'remember_device'), style: TextStyle(color: colors.textSecondary, fontSize: 12)),
                                ]),
                              ),
                              GestureDetector(
                                onTap: () => _showForgotPassword(context),
                                child: const Text('Forget Password?', style: TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // ── Login Button ──
                          GestureDetector(
                            onTap: _isLoading ? null : _handleLogin,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 18),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(colors: [AppTheme.primary, AppTheme.primaryLight]),
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.35), blurRadius: 20, offset: const Offset(0, 6))],
                              ),
                              child: _isLoading
                                ? const Center(child: SizedBox(width: 22, height: 22,
                                    child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2.5)))
                                : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                                    Text(tr(context, 'login'), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.black, letterSpacing: 2.5)),
                                    const SizedBox(width: 8),
                                    const Icon(LucideIcons.arrowRight, color: Colors.black, size: 18),
                                  ]),
                            ),
                          ),

                          const SizedBox(height: 16),

                          // ── OR Divider ──
                          Row(children: [
                            Expanded(child: Container(height: 1, color: colors.borderSubtle)),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Text('OR', style: TextStyle(color: colors.textHint, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2)),
                            ),
                            Expanded(child: Container(height: 1, color: colors.borderSubtle)),
                          ]),

                          const SizedBox(height: 16),

                          // ── Google Sign-In Button ──
                          GestureDetector(
                            onTap: (_isLoading || _isGoogleLoading) ? null : _handleGoogleLogin,
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              decoration: BoxDecoration(
                                color: colors.card,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: colors.borderSubtle),
                              ),
                              child: _isGoogleLoading
                                ? const Center(child: SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5)))
                                : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                                    Image.network('https://www.google.com/favicon.ico', width: 20, height: 20, errorBuilder: (c, e, s) => const Icon(LucideIcons.globe, size: 20)),
                                    const SizedBox(width: 12),
                                    Text('Sign in with Google', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: colors.textPrimary)),
                                  ]),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),

                    // ── STATS CARDS ──
                    Row(children: [
                      Expanded(child: _statCard(LucideIcons.users, tr(context, 'active_students'), '540+', AppTheme.primary, colors)),
                      const SizedBox(width: 12),
                      Expanded(child: _statCard(LucideIcons.building, tr(context, 'departments'), '3', AppTheme.primary, colors)),
                    ]),
                    const SizedBox(height: 12),
                    _featuresCard(colors),

                    const SizedBox(height: 16),

                    // ── WHATSAPP LINK ──
                    GestureDetector(
                      onTap: () async {
                        try {
                          final uri = Uri.parse('https://chat.whatsapp.com/DGzg4BlkxL57nIahGMG2CH');
                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                        } catch (e) {
                          debugPrint('Could not launch WhatsApp: $e');
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: const Color(0xFF25D366).withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: const Color(0xFF25D366).withValues(alpha: 0.2)),
                        ),
                        child: Row(children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(color: const Color(0xFF25D366), borderRadius: BorderRadius.circular(14)),
                            child: Icon(LucideIcons.messageCircle, color: Colors.white, size: 22),
                          ),
                          const SizedBox(width: 16),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(tr(context, 'join_group'), style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
                            const SizedBox(height: 2),
                            Text(tr(context, 'stay_connected'), style: TextStyle(color: const Color(0xFF25D366).withValues(alpha: 0.7), fontSize: 12)),
                          ])),
                          Icon(LucideIcons.chevronRight, color: const Color(0xFF25D366).withValues(alpha: 0.5), size: 14),
                        ]),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // ── WEBSITE LINK ──
                    GestureDetector(
                      onTap: () async {
                        try {
                          final uri = Uri.parse('https://znu-cs.online');
                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                        } catch (e) {
                          debugPrint('Could not launch Website: $e');
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
                        ),
                        child: Row(children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(14)),
                            child: Icon(LucideIcons.globe, color: Colors.black, size: 22),
                          ),
                          const SizedBox(width: 16),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text('Visit our Website', style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
                            const SizedBox(height: 2),
                            Text('znu-cs.online', style: TextStyle(color: AppTheme.primary.withValues(alpha: 0.9), fontSize: 12)),
                          ])),
                          Icon(LucideIcons.chevronRight, color: AppTheme.primary.withValues(alpha: 0.5), size: 14),
                        ]),
                      ),
                    ),

                    const SizedBox(height: 32),
                    // Footer
                    Text(tr(context, 'footer_text'),
                        style: TextStyle(color: colors.textHint, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _blob(double size, Color color) {
    return Container(width: size, height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }

  Widget _statCard(IconData icon, String label, String value, Color color, AppColors colors) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colors.borderSubtle),
        boxShadow: colors.isDark ? [] : [BoxShadow(color: colors.cardShadow, blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Row(children: [
        Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)),
          child: Icon(icon, color: color, size: 24)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: TextStyle(color: colors.textSecondary, fontSize: 11)),
          Text(value, style: TextStyle(color: colors.textPrimary, fontSize: 24, fontWeight: FontWeight.w900)),
        ])),
      ]),
    );
  }

  Widget _featuresCard(AppColors colors) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colors.borderSubtle),
        boxShadow: colors.isDark ? [] : [BoxShadow(color: colors.cardShadow, blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(LucideIcons.sparkles, color: AppTheme.primary, size: 20),
          const SizedBox(width: 8),
          Text(tr(context, 'platform_features'), style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
        ]),
        const SizedBox(height: 12),
        ...[
          'Quizzes & Exams Analytics',
          'Real-time Live Timetables',
          'Personal Dynamic Roadmap',
        ].map((f) => Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Row(children: [
            Container(width: 6, height: 6, decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.8), shape: BoxShape.circle)),
            const SizedBox(width: 10),
            Text(f, style: TextStyle(color: colors.textSecondary, fontSize: 13)),
          ]),
        )),
      ]),
    );
  }
}
