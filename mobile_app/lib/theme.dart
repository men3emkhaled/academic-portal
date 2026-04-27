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
  );

  bool get isDark => brightness == Brightness.dark;

  @override
  AppColors copyWith({
    Color? background, Color? surface, Color? card, Color? divider,
    Color? textPrimary, Color? textSecondary, Color? textHint,
    Color? surfaceLight, Color? borderSubtle, Color? cardShadow,
    Color? scaffoldOverlay, Color? scoreBoxBg, Brightness? brightness,
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

  static ThemeData get darkTheme => _buildTheme(AppColors.dark);
  static ThemeData get lightTheme => _buildTheme(AppColors.light);

  static ThemeData _buildTheme(AppColors colors) {
    final bool isDark = colors.isDark;

    return ThemeData(
      useMaterial3: true,
      brightness: colors.brightness,
      scaffoldBackgroundColor: colors.background,
      primaryColor: primary,
      colorScheme: isDark
          ? const ColorScheme.dark(primary: primary, secondary: primaryLight, surface: Color(0xFF0D0D0D))
          : const ColorScheme.light(primary: primary, secondary: primaryDark, surface: Color(0xFFFFFFFF)),
      fontFamily: 'Inter',
      textTheme: TextTheme(
        displayLarge: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold),
        bodyLarge: TextStyle(color: colors.textPrimary),
        bodyMedium: TextStyle(color: colors.textSecondary),
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
          borderSide: const BorderSide(color: primary, width: 1.5),
        ),
        labelStyle: TextStyle(color: colors.textSecondary),
        hintStyle: TextStyle(color: colors.textHint),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: colors.background,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) =>
            states.contains(WidgetState.selected) ? primary : Colors.transparent),
        side: BorderSide(color: colors.textHint),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) =>
            states.contains(WidgetState.selected) ? (isDark ? backgroundDark : Colors.white) : colors.textHint),
        trackColor: WidgetStateProperty.resolveWith((states) =>
            states.contains(WidgetState.selected) ? primary : colors.borderSubtle),
      ),
      extensions: [colors],
    );
  }
}
