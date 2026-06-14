import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../providers/auth_provider.dart';
import '../theme.dart';

import '../services/fcm_service.dart';
import 'package:aad_oauth_ce/aad_oauth.dart';
import '../config/msal_config.dart';

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
  bool _isMicrosoftLoading = false;
  String? _errorMessage;
  String _focused = '';
  String _selectedRole = 'student';
  int _currentStep = 0;

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
    final savedStudentId = prefs.getString('saved_student_id');
    final savedDoctorId = prefs.getString('saved_doctor_id');
    final savedPass = prefs.getString('saved_password');
    if (savedPass != null) {
      if (savedStudentId != null) {
        setState(() {
          _usernameController.text = savedStudentId;
          _passwordController.text = savedPass;
          _rememberDevice = true;
          _selectedRole = 'student';
          _currentStep = 1;
        });
      } else if (savedDoctorId != null) {
        setState(() {
          _usernameController.text = savedDoctorId;
          _passwordController.text = savedPass;
          _rememberDevice = true;
          _selectedRole = 'doctor';
          _currentStep = 1;
        });
      }
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
    final baseColors = Theme.of(context).extension<AppColors>()!;
    final colors = baseColors.copyWith(
      primary: _selectedRole == 'doctor' ? const Color(0xFF8B5CF6) : const Color(0xFF2ECC71),
      primaryLight: _selectedRole == 'doctor' ? const Color(0xFFA78BFA) : const Color(0xFF8EFF71),
      primaryDark: _selectedRole == 'doctor' ? const Color(0xFF7C3AED) : const Color(0xFF27AE60),
    );
    bool sending = false;
    bool sent = false;
    String? error;
    String method = 'google'; // Default to personal

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
                  Text('Forget Password', style: TextStyle(color: colors.primary, fontWeight: FontWeight.w900, fontSize: 20)),
                  const SizedBox(height: 8),
                  Text('Enter your Student ID and choose where to receive the reset link.', style: TextStyle(color: colors.textSecondary, fontSize: 13)),
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
                  const SizedBox(height: 20),
                  Text('Send Link To:', style: TextStyle(color: colors.primary, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.2)),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setStateModal(() => method = 'google'),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: method == 'google' ? colors.primary.withValues(alpha: 0.1) : Colors.transparent,
                            border: Border.all(color: method == 'google' ? colors.primary : colors.borderSubtle),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(children: [
                            Image.network('https://www.google.com/favicon.ico', width: 24, height: 24, errorBuilder: (c,e,s) => const Icon(LucideIcons.mail, size: 24)),
                            const SizedBox(height: 8),
                            Text('Personal', style: TextStyle(color: method == 'google' ? colors.primary : colors.textSecondary, fontWeight: FontWeight.bold, fontSize: 10)),
                          ]),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setStateModal(() => method = 'microsoft'),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: method == 'microsoft' ? colors.primary.withValues(alpha: 0.1) : Colors.transparent,
                            border: Border.all(color: method == 'microsoft' ? colors.primary : colors.borderSubtle),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(children: [
                            _microsoftIcon(),
                            const SizedBox(height: 8),
                            Text('Institutional', style: TextStyle(color: method == 'microsoft' ? colors.primary : colors.textSecondary, fontWeight: FontWeight.bold, fontSize: 10)),
                          ]),
                        ),
                      ),
                    ),
                  ]),
                  if (error != null) ...[
                    const SizedBox(height: 12),
                    Text(error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                  ],
                  if (sent) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.greenAccent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                      child: const Text('Reset link sent successfully!', style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold)),
                    ),
                  ],
                  const SizedBox(height: 24),
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
                          final res = await context.read<AuthProvider>().forgotPassword(forgotCtl.text.trim(), method: method);
                          setStateModal(() { sending = false; });
                          if (res['success'] == true) {
                            setStateModal(() => sent = true);
                          } else {
                            setStateModal(() => error = res['message'] ?? 'Failed');
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(color: colors.primary, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: colors.primary.withValues(alpha: 0.4), blurRadius: 15)]),
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

  Future<void> _handleMicrosoftLogin() async {
    setState(() { _isMicrosoftLoading = true; _errorMessage = null; });
    try {
      final AadOAuth oauth = AadOAuth(MsalConfig.config);
      await oauth.login();
      final accessToken = await oauth.getAccessToken();
      
      if (accessToken == null) {
        setState(() => _isMicrosoftLoading = false);
        return;
      }
      
      if (!mounted) return;
      final result = await context.read<AuthProvider>().microsoftLogin(accessToken);
      
      if (!mounted) return;
      setState(() => _isMicrosoftLoading = false);
      
      if (result['success'] == true) {
        try {
          final fcmToken = await FCMService.getToken();
          if (fcmToken != null) {
            await context.read<AuthProvider>().updateFcmToken(fcmToken);
          }
        } catch (_) {}
        if (mounted) context.go('/dashboard');
      } else {
        setState(() => _errorMessage = result['message'] ?? 'Microsoft login failed');
      }
    } catch (e) {
      if (mounted) setState(() { _isMicrosoftLoading = false; _errorMessage = 'Microsoft sign-in error: $e'; });
    }
  }

  Future<void> _handleLogin() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text.trim();
    if (username.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = _selectedRole == 'doctor'
          ? 'Please enter both Username and password.'
          : 'Please enter both Student ID and password.');
      return;
    }
    setState(() { _isLoading = true; _errorMessage = null; });
    final result = await context.read<AuthProvider>().login(username, password, role: _selectedRole);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (result['success']) {
      final prefs = await SharedPreferences.getInstance();
      if (_rememberDevice) {
        if (_selectedRole == 'doctor') {
          await prefs.setString('saved_doctor_id', username);
        } else {
          await prefs.setString('saved_student_id', username);
        }
        await prefs.setString('saved_password', password);
      } else {
        await prefs.remove('saved_student_id');
        await prefs.remove('saved_doctor_id');
        await prefs.remove('saved_password');
      }
      if (!mounted) return;
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
      if (mounted) context.go('/dashboard');
    } else {
      setState(() => _errorMessage = result['message'] ?? 'Login failed');
    }
  }

  @override
  Widget build(BuildContext context) {
    final Color primaryColor = _selectedRole == 'doctor'
        ? const Color(0xFF111111)
        : const Color(0xFF1A9E6D);
    final Color primaryLight = _selectedRole == 'doctor'
        ? const Color(0xFF333333)
        : const Color(0xFF34D399);

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F8),
      body: Stack(
        children: [
          // ── Top-Left Ambient Blob ──
          Positioned(
            top: -120, left: -120,
            child: Container(
              width: 340, height: 340,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF1EA875).withValues(alpha: 0.08),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                child: const SizedBox(),
              ),
            ),
          ),
          // ── Bottom-Right Ambient Blob ──
          Positioned(
            bottom: -120, right: -120,
            child: Container(
              width: 340, height: 340,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF1EA875).withValues(alpha: 0.05),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                child: const SizedBox(),
              ),
            ),
          ),
          // ── Content with iOS-style slide transition ──
          Positioned.fill(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 550),
                switchInCurve: Curves.easeInOutCubic,
                switchOutCurve: Curves.easeInOutCubic,
                transitionBuilder: (child, anim) {
                  final slide = Tween<Offset>(
                    begin: const Offset(0.0, 0.08),
                    end: Offset.zero,
                  ).animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic));
                  return FadeTransition(
                    opacity: anim,
                    child: SlideTransition(position: slide, child: child),
                  );
                },
                child: _currentStep == 0
                    ? _buildRoleSelection(primaryColor)
                    : _buildLoginForm(primaryColor, primaryLight),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleSelection(Color brandColor) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 28),

            // Top Headers (Get Started! style)
            const Text(
              'Get Started!',
              style: TextStyle(
                fontSize: 34,
                fontWeight: FontWeight.w900,
                color: Color(0xFF111827),
                letterSpacing: -0.8,
              ),
              textAlign: TextAlign.center,
            ),

            // Center area with logo on top and three academic phrases centered below it
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // ZNU Logo centered above the sentences
                    Image.asset(
                      'assets/logo.png',
                      width: 135,
                      height: 135,
                      fit: BoxFit.contain,
                    ),
                    const SizedBox(height: 32),

                    // Three phrases with specific bolding and custom SFPro italic styling, centered
                    RichText(
                      textAlign: TextAlign.center,
                      text: const TextSpan(
                        style: TextStyle(
                          fontFamily: 'SFPro',
                          fontSize: 18,
                          fontStyle: FontStyle.italic,
                          height: 1.5,
                        ),
                        children: [
                          TextSpan(
                            text: 'Academic ',
                            style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1EA875)),
                          ),
                          TextSpan(
                            text: 'Excellence',
                            style: TextStyle(fontWeight: FontWeight.w400, color: Color(0xFF4B5563)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    RichText(
                      textAlign: TextAlign.center,
                      text: const TextSpan(
                        style: TextStyle(
                          fontFamily: 'SFPro',
                          fontSize: 18,
                          fontStyle: FontStyle.italic,
                          height: 1.5,
                        ),
                        children: [
                          TextSpan(
                            text: 'Limitless ',
                            style: TextStyle(fontWeight: FontWeight.w400, color: Color(0xFF4B5563)),
                          ),
                          TextSpan(
                            text: 'Innovation',
                            style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1EA875)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    RichText(
                      textAlign: TextAlign.center,
                      text: const TextSpan(
                        style: TextStyle(
                          fontFamily: 'SFPro',
                          fontSize: 18,
                          fontStyle: FontStyle.italic,
                          height: 1.5,
                        ),
                        children: [
                          TextSpan(
                            text: 'Shaping ',
                            style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1EA875)),
                          ),
                          TextSpan(
                            text: 'Futures',
                            style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1EA875)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),



            // ── Student Capsule Button (WHITE) ──
            _roleCapsuleButton(
              label: 'Student',
              icon: LucideIcons.graduationCap,
              bgColor: Colors.white,
              textColor: const Color(0xFF111827),
              iconColor: const Color(0xFF1EA875),
              onTap: () => setState(() {
                _selectedRole = 'student';
                _currentStep = 1;
              }),
            ),
            const SizedBox(height: 14),

            // ── Instructor Capsule Button (BLACK) ──
            _roleCapsuleButton(
              label: 'Instructor',
              icon: LucideIcons.userCog,
              bgColor: const Color(0xFF161618),
              textColor: Colors.white,
              iconColor: Colors.white,
              onTap: () => setState(() {
                _selectedRole = 'doctor';
                _currentStep = 1;
              }),
              isDark: true,
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _roleCapsuleButton({
    required String label,
    required IconData icon,
    required Color bgColor,
    required Color textColor,
    required Color iconColor,
    required VoidCallback onTap,
    bool isDark = false,
  }) {
    return _BouncingButton(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: 58,
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(100),
          border: isDark
              ? Border.all(color: Colors.white.withValues(alpha: 0.08), width: 1.2)
              : Border.all(color: const Color(0xFFE5E7EB), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: iconColor, size: 23),
            const SizedBox(width: 14),
            Flexible(
              child: Text(
                label,
                style: TextStyle(
                  fontFamily: 'SFPro',
                  fontSize: 16.5,
                  fontWeight: FontWeight.w700,
                  color: textColor,
                  letterSpacing: 0.2,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _footerLink({required IconData icon, required String label, required Color color, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 5),
          Text(label, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildLoginForm(Color primary, Color primaryLight) {
    final isDoctor = _selectedRole == 'doctor';

    return SafeArea(
      key: const ValueKey('step_1'),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(32, 16, 32, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // ── Back ──
            _BouncingButton(
              onTap: () => setState(() { _currentStep = 0; _errorMessage = null; }),
              child: Padding(
                padding: const EdgeInsets.only(top: 8, bottom: 8, right: 12),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(LucideIcons.chevronLeft, color: primary, size: 19),
                    const SizedBox(width: 2),
                    Text('Back', style: TextStyle(color: primary, fontSize: 14, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 44),

            // ── Role indicator ──
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: isDoctor ? const Color(0xFF111827) : primary.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                isDoctor ? 'Instructor' : 'Student',
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: isDoctor ? Colors.white : primary,
                  letterSpacing: 0.4,
                ),
              ),
            ),

            const SizedBox(height: 20),

            // ── Heading ──
            const Text(
              'Welcome\nback.',
              style: TextStyle(
                fontFamily: 'SFPro',
                fontSize: 40,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0D0D0D),
                letterSpacing: -1.0,
                height: 1.1,
              ),
            ),

            const SizedBox(height: 48),

            // ── Error banner ──
            if (_errorMessage != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                margin: const EdgeInsets.only(bottom: 24),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFCA5A5).withValues(alpha: 0.5)),
                ),
                child: Row(children: [
                  const Icon(LucideIcons.alertCircle, color: Color(0xFFEF4444), size: 15),
                  const SizedBox(width: 8),
                  Expanded(child: Text(_errorMessage!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13))),
                ]),
              ),
            ],

            // ── ID field ──
            _simpleField(
              hint: isDoctor ? 'Username' : 'Student ID',
              icon: LucideIcons.fingerprint,
              controller: _usernameController,
              focusKey: 'id',
              primary: primary,
              keyboardType: isDoctor ? TextInputType.text : TextInputType.number,
              action: TextInputAction.next,
            ),

            const SizedBox(height: 12),

            // ── Password field ──
            _simpleField(
              hint: 'Password',
              icon: LucideIcons.lock,
              controller: _passwordController,
              focusKey: 'pw',
              primary: primary,
              obscure: !_showPassword,
              action: TextInputAction.done,
              onSubmit: (_) => _handleLogin(),
              suffix: GestureDetector(
                onTap: () => setState(() => _showPassword = !_showPassword),
                child: Icon(
                  _showPassword ? LucideIcons.eyeOff : LucideIcons.eye,
                  color: const Color(0xFFB0B7C3),
                  size: 18,
                ),
              ),
            ),

            const SizedBox(height: 16),

            // ── Remember + Forgot ──
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                  onTap: () => setState(() => _rememberDevice = !_rememberDevice),
                  child: Row(children: [
                    SizedBox(
                      width: 18, height: 18,
                      child: Checkbox(
                        value: _rememberDevice,
                        onChanged: (v) => setState(() => _rememberDevice = v == true),
                        activeColor: primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        side: const BorderSide(color: Color(0xFFD1D5DB), width: 1.5),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text('Remember me', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 13)),
                  ]),
                ),
                GestureDetector(
                  onTap: () => _showForgotPassword(context),
                  child: Text(
                    'Forgot password?',
                    style: TextStyle(color: primary, fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 36),

            // ── Sign In ──
            _BouncingButton(
              onTap: _isLoading ? () {} : _handleLogin,
              child: Container(
                width: double.infinity,
                height: 56,
                decoration: BoxDecoration(
                  color: isDoctor ? const Color(0xFF0D0D0D) : primary,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: (isDoctor ? Colors.black : primary).withValues(alpha: 0.22),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: _isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text(
                        'Sign In',
                        style: TextStyle(
                          fontFamily: 'SFPro',
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                          letterSpacing: 0.1,
                        ),
                      ),
              ),
            ),

            const SizedBox(height: 32),

            // ── Divider ──
            Row(children: [
              const Expanded(child: Divider(color: Color(0xFFEEEEEE))),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text('or', style: TextStyle(color: Color(0xFFB0B7C3), fontSize: 12)),
              ),
              const Expanded(child: Divider(color: Color(0xFFEEEEEE))),
            ]),

            const SizedBox(height: 20),

            // ── Social buttons ──
            Row(children: [
              Expanded(child: _socialButton(
                loading: _isGoogleLoading,
                onTap: (_isLoading || _isGoogleLoading || _isMicrosoftLoading) ? null : _handleGoogleLogin,
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Image.network('https://www.google.com/favicon.ico', width: 17, height: 17,
                      errorBuilder: (c, e, s) => const Icon(LucideIcons.globe, size: 17, color: Color(0xFF374151))),
                  const SizedBox(width: 8),
                  const Text('Google', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                ]),
              )),
              const SizedBox(width: 10),
              Expanded(child: _socialButton(
                loading: _isMicrosoftLoading,
                onTap: (_isLoading || _isGoogleLoading || _isMicrosoftLoading) ? null : _handleMicrosoftLogin,
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  _microsoftIcon(),
                  const SizedBox(width: 8),
                  const Text('Microsoft', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                ]),
              )),
            ]),

            const SizedBox(height: 36),

            // ── Footer ──
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _footerLink(icon: LucideIcons.messageCircle, label: 'WhatsApp', color: const Color(0xFF25D366),
                      onTap: () => _launchUrl('https://chat.whatsapp.com/DGzg4BlkxL57nIahGMG2CH')),
                  Container(width: 1, height: 12, color: const Color(0xFFE5E7EB), margin: const EdgeInsets.symmetric(horizontal: 12)),
                  _footerLink(icon: LucideIcons.globe, label: 'Website', color: const Color(0xFF1A9E6D),
                      onTap: () => _launchUrl('https://znu-cs.online')),
                ],
              ),
            ),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  // ── Minimal field without label ──
  Widget _simpleField({
    required String hint,
    required IconData icon,
    required TextEditingController controller,
    required String focusKey,
    required Color primary,
    bool obscure = false,
    TextInputType keyboardType = TextInputType.text,
    TextInputAction action = TextInputAction.next,
    Widget? suffix,
    void Function(String)? onSubmit,
  }) {
    final isFocused = _focused == focusKey;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isFocused ? primary : const Color(0xFFE9EAEC),
          width: isFocused ? 1.5 : 1.0,
        ),
        boxShadow: isFocused
            ? [BoxShadow(color: primary.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, 4))]
            : [],
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        onTap: () => setState(() => _focused = focusKey),
        onTapOutside: (_) => setState(() => _focused = ''),
        onSubmitted: onSubmit,
        keyboardType: keyboardType,
        textInputAction: action,
        enabled: !_isLoading,
        style: const TextStyle(fontSize: 15.5, color: Color(0xFF111827)),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0xFFBFC5CE), fontSize: 15.5),
          prefixIcon: Padding(
            padding: const EdgeInsets.only(left: 16, right: 12),
            child: Icon(icon, color: isFocused ? primary : const Color(0xFFCBCFD6), size: 18),
          ),
          prefixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
          suffixIcon: suffix != null
              ? Padding(padding: const EdgeInsets.only(right: 14), child: suffix)
              : null,
          suffixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 17, horizontal: 4),
        ),
      ),
    );
  }



  Widget _socialButton({required bool loading, required VoidCallback? onTap, required Widget child}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 13),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE5E7EB)),
          boxShadow: [const BoxShadow(color: Color(0x06000000), blurRadius: 8, offset: Offset(0, 2))],
        ),
        alignment: Alignment.center,
        child: loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : child,
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    try {
      final uri = Uri.parse(url);
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      debugPrint('Could not launch: $e');
    }
  }

  Widget _microsoftIcon() {
    return SizedBox(
      width: 18, height: 18,
      child: GridView.count(
        crossAxisCount: 2,
        padding: EdgeInsets.zero,
        mainAxisSpacing: 1,
        crossAxisSpacing: 1,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          Container(color: const Color(0xFFF25022)),
          Container(color: const Color(0xFF7FBB00)),
          Container(color: const Color(0xFF00A1F1)),
          Container(color: const Color(0xFFFFB900)),
        ],
      ),
    );
  }
}

class _BouncingButton extends StatefulWidget {
  final Widget child;
  final VoidCallback onTap;

  const _BouncingButton({required this.child, required this.onTap});

  @override
  State<_BouncingButton> createState() => _BouncingButtonState();
}

class _BouncingButtonState extends State<_BouncingButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 90),
    );
    _scale = Tween<double>(begin: 1.0, end: 0.96).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) {
        _controller.reverse();
        widget.onTap();
      },
      onTapCancel: () => _controller.reverse(),
      child: ScaleTransition(
        scale: _scale,
        child: widget.child,
      ),
    );
  }
}


