import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'services/fcm_service.dart';
import 'services/notification_service.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'theme.dart';
import 'providers/auth_provider.dart';
import 'providers/data_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/locale_provider.dart';
import 'screens/login_screen.dart';
import 'screens/app_layout.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FCMService.initialize();
  await NotificationService().init();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DataProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => LocaleProvider()),
      ],
      child: const UniversityApp(),
    ),
  );
}

class UniversityApp extends StatefulWidget {
  const UniversityApp({super.key});

  @override
  State<UniversityApp> createState() => _UniversityAppState();
}

class _UniversityAppState extends State<UniversityApp> {
  GoRouter? _router;

  GoRouter _getRouter(AuthProvider auth) {
    if (_router != null) return _router!;

    _router = GoRouter(
      initialLocation: '/',
      refreshListenable: auth,
      redirect: (context, state) {
        if (auth.isLoading) return null;

        final isLoggingIn = state.matchedLocation == '/login';
        final isSplash = state.matchedLocation == '/';

        if (!auth.isAuthenticated) {
          return isLoggingIn ? null : '/login';
        }

        if (isLoggingIn || isSplash) {
          return '/dashboard';
        }

        return null;
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) {
            return const Scaffold(
              body: Center(
                child: SizedBox(
                  width: 50,
                  height: 50,
                  child: CircularProgressIndicator(color: AppTheme.primaryBlue),
                ),
              ),
            );
          },
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const AppLayout(),
        ),
      ],
    );

    return _router!;
  }

  @override
  void dispose() {
    _router?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final localeProvider = context.watch<LocaleProvider>();
    final auth = context.read<AuthProvider>();
    final router = _getRouter(auth);

    return MaterialApp.router(
      title: 'ZNU Portal',
      debugShowCheckedModeBanner: false,
      theme: themeProvider.isDarkMode ? AppTheme.darkTheme : AppTheme.lightTheme,
      locale: localeProvider.locale,
      supportedLocales: const [Locale('en'), Locale('ar')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
    );
  }
}
