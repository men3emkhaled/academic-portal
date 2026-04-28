import 'package:flutter/widgets.dart';
import 'package:aad_oauth_ce/model/config.dart';

class MsalConfig {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  static final Config config = Config(
    tenant: '9345a4cc-a702-4d54-b38a-a9dffc465585',
    clientId: '285d1c09-1733-44d1-8021-f9c1fbb1ff02',
    scope: 'openid profile offline_access user.read',
    redirectUri: 'msauth://com.example.mobile_app/2pmj9i4rSx0yEb%2FviWBYKe%2FZurk%3D',
    navigatorKey: navigatorKey,
  );
}
