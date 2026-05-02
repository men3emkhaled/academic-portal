import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:ui';
import 'package:url_launcher/url_launcher.dart';
import '../theme.dart';

// --- GLASS CONTAINER ---
class GlassContainer extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  final Color? borderColor;
  final double blur;
  final Color? backgroundColor;
  final bool useBlur;

  const GlassContainer({
    super.key,
    required this.child,
    this.borderRadius = 24.0,
    this.padding = const EdgeInsets.all(20),
    this.margin = const EdgeInsets.only(bottom: 16),
    this.borderColor,
    this.blur = 16.0,
    this.backgroundColor,
    this.useBlur = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final bg = backgroundColor ?? (colors.isDark ? Colors.black45 : colors.card);
    final border = borderColor ?? colors.borderSubtle;

    if (!useBlur) {
      return Container(
        margin: margin,
        padding: padding,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(borderRadius),
          border: Border.all(color: border.withValues(alpha: 0.5), width: 0.5),
          boxShadow: colors.isDark ? [] : [
             BoxShadow(color: colors.cardShadow.withValues(alpha: 0.04), blurRadius: 24, spreadRadius: -2, offset: const Offset(0, 8)),
             BoxShadow(color: colors.cardShadow.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2)),
          ],
        ),
        child: child,
      );
    }

    return Container(
      margin: margin,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: bg.withValues(alpha: 0.7),
              borderRadius: BorderRadius.circular(borderRadius),
              border: Border.all(color: border.withValues(alpha: 0.5), width: 0.5),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

// --- GRADIENT TEXT ---
class GradientText extends StatelessWidget {
  final String text;
  final double fontSize;
  final FontWeight fontWeight;
  final TextAlign textAlign;
  final int? maxLines;

  const GradientText(
    this.text, {
    super.key,
    this.fontSize = 32,
    this.fontWeight = FontWeight.w900,
    this.textAlign = TextAlign.start,
    this.maxLines,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;

    if (colors.isDark) {
      return ShaderMask(
        shaderCallback: (bounds) => LinearGradient(
          colors: [Colors.white, Colors.white.withValues(alpha: 0.7)],
        ).createShader(bounds),
        child: Text(
          text,
          maxLines: maxLines,
          overflow: maxLines != null ? TextOverflow.ellipsis : null,
          textAlign: textAlign,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: fontWeight,
            color: Colors.white,
            height: 1.1,
          ),
        ),
      );
    }

    // Light mode — use dark gradient text
    return ShaderMask(
      shaderCallback: (bounds) => LinearGradient(
        colors: [colors.textPrimary, colors.textPrimary.withValues(alpha: 0.7)],
      ).createShader(bounds),
      child: Text(
        text,
        maxLines: maxLines,
        overflow: maxLines != null ? TextOverflow.ellipsis : null,
        textAlign: textAlign,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: Colors.white, // Must be white for ShaderMask to work
          height: 1.1,
        ),
      ),
    );
  }
}

// --- RENDER CONTENT (Markdown Links parser + BiDi fix) ---

/// Auto-detect text direction from the first strong (Arabic/Latin) character
TextDirection detectTextDir(String s) {
  for (final c in s.runes) {
    if (c >= 0x0600 && c <= 0x06FF) return TextDirection.rtl; // Arabic block
    if ((c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A)) return TextDirection.ltr; // Latin
  }
  return TextDirection.ltr;
}

class RenderContent extends StatelessWidget {
  final String text;
  final TextStyle? textStyle;

  const RenderContent({super.key, required this.text, this.textStyle});

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
       debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (text.isEmpty) return const SizedBox();

    final dir = detectTextDir(text);
    final linkRegex = RegExp(r'\[([^\]]+)\]\(([^)]+)\)');
    final matches = linkRegex.allMatches(text);

    // No links — plain text with correct direction
    if (matches.isEmpty) {
      return Text(
        text,
        style: textStyle,
        textDirection: dir,
        softWrap: true,
      );
    }

    List<InlineSpan> spans = [];
    int lastIndex = 0;

    for (final match in matches) {
      if (match.start > lastIndex) {
        spans.add(TextSpan(
          text: text.substring(lastIndex, match.start),
          style: textStyle,
        ));
      }

      final linkText = match.group(1) ?? '';
      final linkUrl  = match.group(2) ?? '';

      spans.add(
        WidgetSpan(
          alignment: PlaceholderAlignment.middle,
          // Force LTR for the button so it never flips inside RTL context
          child: Directionality(
            textDirection: TextDirection.ltr,
            child: GestureDetector(
              onTap: () => _launchUrl(linkUrl),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [
                    const Color(0xFF2ECC71).withValues(alpha: 0.25),
                    const Color(0xFF2ECC71).withValues(alpha: 0.10),
                  ]),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF2ECC71).withValues(alpha: 0.5)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(LucideIcons.externalLink, color: Color(0xFF2ECC71), size: 13),
                    const SizedBox(width: 5),
                    Flexible(
                      child: Text(
                        linkText,
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                        textDirection: TextDirection.ltr,
                        style: const TextStyle(
                          color: Color(0xFF2ECC71),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );

      lastIndex = match.end;
    }

    if (lastIndex < text.length) {
      spans.add(TextSpan(
        text: text.substring(lastIndex),
        style: textStyle,
      ));
    }

    return Text.rich(
      TextSpan(children: spans),
      textDirection: dir,
      softWrap: true,
    );
  }
}
