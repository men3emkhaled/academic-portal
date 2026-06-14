import 'package:flutter/material.dart';

// ── Semantic color tokens that adapt to dark/light mode ──
class AppColors extends ThemeExtension<AppColors> {
  final Color background;
  final Color surface;
  final Color card;
  final Color divider;
  final Color textPrimary;
  final Color textSecondary;
  final Color textHint;
  final Color surfaceLight;   // subtle fill for inputs, pills, etc.
  final Color borderSubtle;   // very subtle borders
  final Color cardShadow;     // shadow color for cards in light mode
  final Color scaffoldOverlay; // outer container bg (tablets/web)
  final Color scoreBoxBg;     // background for score boxes
  final Brightness brightness;

  final Color primary;
  final Color primaryLight;
  final Color primaryDark;

  const AppColors({
    required this.background,
    required this.surface,
    required this.card,
    required this.divider,
    required this.textPrimary,
    required this.textSecondary,
    required this.textHint,
    required this.surfaceLight,
    required this.borderSubtle,
    required this.cardShadow,
    required this.scaffoldOverlay,
    required this.scoreBoxBg,
    required this.brightness,
    required this.primary,
    required this.primaryLight,
    required this.primaryDark,
  });

  // ── Dark palette ──
  static const dark = AppColors(
    background: Color(0xFF000000),
    surface: Color(0xFF0D0D0D),
    card: Color(0xFF111111),
    divider: Color(0xFF1A1A1A),
    textPrimary: Color(0xFFF8FAFC),
    textSecondary: Color(0xFF94A3B8),
    textHint: Color(0x4DFFFFFF),       // Colors.white30
    surfaceLight: Color(0x0DFFFFFF),   // Colors.white.withOpacity(0.05)
    borderSubtle: Color(0x1AFFFFFF),   // Colors.white10
    cardShadow: Color(0x66000000),
    scaffoldOverlay: Color(0xFF000000),
    scoreBoxBg: Color(0xFF000000),
    brightness: Brightness.dark,
    primary: Color(0xFF2ECC71),
    primaryLight: Color(0xFF8EFF71),
    primaryDark: Color(0xFF27AE60),
  );

  // ── Light palette ──
  static const light = AppColors(
    background: Color(0xFFF5F7FA),
    surface: Color(0xFFEEF2F6),
    card: Color(0xFFFFFFFF),
    divider: Color(0xFFE2E8F0),
    textPrimary: Color(0xFF1A1A2E),
    textSecondary: Color(0xFF64748B),
    textHint: Color(0xFF94A3B8),
    surfaceLight: Color(0xFFF1F5F9),
    borderSubtle: Color(0xFFE2E8F0),
    cardShadow: Color(0x1A000000),
    scaffoldOverlay: Color(0xFFF5F7FA),
    scoreBoxBg: Color(0xFFF1F5F9),
    brightness: Brightness.light,
    primary: Color(0xFF2ECC71),
    primaryLight: Color(0xFF8EFF71),
    primaryDark: Color(0xFF27AE60),
  );

  bool get isDark => brightness == Brightness.dark;

  @override
  AppColors copyWith({
    Color? background, Color? surface, Color? card, Color? divider,
    Color? textPrimary, Color? textSecondary, Color? textHint,
    Color? surfaceLight, Color? borderSubtle, Color? cardShadow,
    Color? scaffoldOverlay, Color? scoreBoxBg, Brightness? brightness,
    Color? primary, Color? primaryLight, Color? primaryDark,
  }) {
    return AppColors(
      background: background ?? this.background,
      surface: surface ?? this.surface,
      card: card ?? this.card,
      divider: divider ?? this.divider,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textHint: textHint ?? this.textHint,
      surfaceLight: surfaceLight ?? this.surfaceLight,
      borderSubtle: borderSubtle ?? this.borderSubtle,
      cardShadow: cardShadow ?? this.cardShadow,
      scaffoldOverlay: scaffoldOverlay ?? this.scaffoldOverlay,
      scoreBoxBg: scoreBoxBg ?? this.scoreBoxBg,
      brightness: brightness ?? this.brightness,
      primary: primary ?? this.primary,
      primaryLight: primaryLight ?? this.primaryLight,
      primaryDark: primaryDark ?? this.primaryDark,
    );
  }

  @override
  AppColors lerp(AppColors? other, double t) {
    if (other == null) return this;
    return AppColors(
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      card: Color.lerp(card, other.card, t)!,
      divider: Color.lerp(divider, other.divider, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textHint: Color.lerp(textHint, other.textHint, t)!,
      surfaceLight: Color.lerp(surfaceLight, other.surfaceLight, t)!,
      borderSubtle: Color.lerp(borderSubtle, other.borderSubtle, t)!,
      cardShadow: Color.lerp(cardShadow, other.cardShadow, t)!,
      scaffoldOverlay: Color.lerp(scaffoldOverlay, other.scaffoldOverlay, t)!,
      scoreBoxBg: Color.lerp(scoreBoxBg, other.scoreBoxBg, t)!,
      brightness: t < 0.5 ? brightness : other.brightness,
      primary: Color.lerp(primary, other.primary, t)!,
      primaryLight: Color.lerp(primaryLight, other.primaryLight, t)!,
      primaryDark: Color.lerp(primaryDark, other.primaryDark, t)!,
    );
  }
}

class AppTheme {
  // ── Core palette (same in both modes) ──
  static const Color primary      = Color(0xFF2ECC71);
  static const Color primaryLight = Color(0xFF8EFF71);
  static const Color primaryDark  = Color(0xFF27AE60);

  // ── Legacy constants for backward compat (kept for minimal breakage) ──
  static const Color backgroundDark = Color(0xFF000000);
  static const Color surfaceDark    = Color(0xFF0D0D0D);
  static const Color cardDark       = Color(0xFF111111);
  static const Color dividerColor   = Color(0xFF1A1A1A);
  static const Color textPrimary    = Color(0xFFF8FAFC);
  static const Color textSecondary  = Color(0xFF94A3B8);
  static const Color primaryBlue    = primary;

  static ThemeData getTheme({required bool isDark, required String role}) {
    final AppColors baseColors = isDark ? AppColors.dark : AppColors.light;
    final Color primaryColor = role == 'doctor' ? const Color(0xFF8B5CF6) : const Color(0xFF2ECC71);
    final Color primaryLightColor = role == 'doctor' ? const Color(0xFFA78BFA) : const Color(0xFF8EFF71);
    final Color primaryDarkColor = role == 'doctor' ? const Color(0xFF7C3AED) : const Color(0xFF27AE60);

    final colors = baseColors.copyWith(
      primary: primaryColor,
      primaryLight: primaryLightColor,
      primaryDark: primaryDarkColor,
    );

    return _buildTheme(colors);
  }

  static ThemeData get darkTheme => getTheme(isDark: true, role: 'student');
  static ThemeData get lightTheme => getTheme(isDark: false, role: 'student');

  static ThemeData _buildTheme(AppColors colors) {
    final bool isDark = colors.isDark;

    return ThemeData(
      useMaterial3: true,
      brightness: colors.brightness,
      scaffoldBackgroundColor: colors.background,
      primaryColor: colors.primary,
      colorScheme: isDark
          ? ColorScheme.dark(primary: colors.primary, secondary: colors.primaryLight, surface: const Color(0xFF0D0D0D))
          : ColorScheme.light(primary: colors.primary, secondary: colors.primaryDark, surface: const Color(0xFFFFFFFF)),
      fontFamily: 'SFPro',
      textTheme: TextTheme(
        displayLarge: TextStyle(
          color: colors.textPrimary,
          fontWeight: FontWeight.bold,
          fontFamily: 'SFPro',
          fontFamilyFallback: const ['SFArabic'],
        ),
        displayMedium: TextStyle(
          color: colors.textPrimary,
          fontWeight: FontWeight.w600,
          fontFamily: 'SFPro',
          fontFamilyFallback: const ['SFArabic'],
        ),
        bodyLarge: TextStyle(
          color: colors.textPrimary,
          fontFamily: 'SFPro',
          fontFamilyFallback: const ['SFArabic'],
        ),
        bodyMedium: TextStyle(
          color: colors.textSecondary,
          fontFamily: 'SFPro',
          fontFamilyFallback: const ['SFArabic'],
        ),
        bodySmall: TextStyle(
          color: colors.textSecondary,
          fontFamily: 'SFPro',
          fontFamilyFallback: const ['SFArabic'],
        ),
        labelLarge: TextStyle(
          color: colors.textPrimary,
          fontFamily: 'SFPro',
          fontFamilyFallback: const ['SFArabic'],
        ),
        titleLarge: TextStyle(
          color: colors.textPrimary,
          fontWeight: FontWeight.w700,
          fontFamily: 'SFPro',
          fontFamilyFallback: const ['SFArabic'],
        ),
        titleMedium: TextStyle(
          color: colors.textPrimary,
          fontWeight: FontWeight.w600,
          fontFamily: 'SFPro',
          fontFamilyFallback: const ['SFArabic'],
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colors.card,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: colors.borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: colors.borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: colors.primary, width: 1.5),
        ),
        labelStyle: TextStyle(color: colors.textSecondary),
        hintStyle: TextStyle(color: colors.textHint),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: colors.primary,
          foregroundColor: colors.background,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) =>
            states.contains(WidgetState.selected) ? colors.primary : Colors.transparent),
        side: BorderSide(color: colors.textHint),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) =>
            states.contains(WidgetState.selected) ? (isDark ? backgroundDark : Colors.white) : colors.textHint),
        trackColor: WidgetStateProperty.resolveWith((states) =>
            states.contains(WidgetState.selected) ? colors.primary : colors.borderSubtle),
      ),
      extensions: [colors],
    );
  }
}
