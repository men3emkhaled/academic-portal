import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/locale_provider.dart';
import 'translations.dart';

/// Translate a key to the current locale
String tr(BuildContext context, String key) {
  final lang = context.read<LocaleProvider>().languageCode;
  return translations[key]?[lang] ?? translations[key]?['en'] ?? key;
}
