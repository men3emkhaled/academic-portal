import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  String? _token;
  Map<String, dynamic>? _student;
  bool _isLoading = true;

  String? get token => _token;
  Map<String, dynamic>? get student => _student;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  String? get studentName => _student?['name'];
  String? get studentId => _student?['id']?.toString();
  String? get studentLevel => _student?['level']?.toString();
  String? get studentSection => _student?['section']?.toString();

  AuthProvider() {
    _initAuth();
  }

  Future<void> _initAuth() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('studentToken');
    final studentCache = prefs.getString('studentData');

    if (studentCache != null) {
       try { _student = jsonDecode(studentCache); } catch (_) {}
    }

    if (_token != null) {
      try {
        final response = await _apiService.dio.get('/student/me');
        _student = response.data;
        prefs.setString('studentData', jsonEncode(_student));
      } on DioException catch (e) {
        if (e.response?.statusCode == 401 || e.response?.statusCode == 403) {
          _token = null;
          _student = null;
          await prefs.remove('studentToken');
          await prefs.remove('studentData');
        }
      } catch (e) {
        // Keep cached token and student if offline
      }
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>> login(String username, String password) async {
    try {
      final response = await _apiService.dio.post('/student/login', data: {
        'username': username,
        'password': password,
      });

      _token = response.data['token'];
      _student = response.data['student'];

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('studentToken', _token!);
      await prefs.setString('studentData', jsonEncode(_student));
      
      notifyListeners();
      return {'success': true};
    } on DioException catch (e) {
      String errorMessage = 'Login failed';
      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      } else if (e.type == DioExceptionType.connectionError) {
        errorMessage = 'No connection to server. Please check internet.';
      }
      return {'success': false, 'message': errorMessage};
    }
  }

  /// Google OAuth Login - sends the Google ID token to the backend
  Future<Map<String, dynamic>> googleLogin(String idToken) async {
    try {
      final response = await _apiService.dio.post('/student/google-login', data: {
        'credential': idToken,
      });

      _token = response.data['token'];
      _student = response.data['student'];

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('studentToken', _token!);
      await prefs.setString('studentData', jsonEncode(_student));

      notifyListeners();
      return {'success': true};
    } on DioException catch (e) {
      String errorMessage = 'Google login failed';
      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      } else if (e.type == DioExceptionType.connectionError) {
        errorMessage = 'No connection to server. Please check internet.';
      }
      return {'success': false, 'message': errorMessage};
    }
  }

  /// Microsoft OAuth Login - sends the Azure access token to the backend
  Future<Map<String, dynamic>> microsoftLogin(String accessToken) async {
    try {
      final response = await _apiService.dio.post('/student/microsoft-login', data: {
        'accessToken': accessToken,
      });

      _token = response.data['token'];
      _student = response.data['student'];

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('studentToken', _token!);
      await prefs.setString('studentData', jsonEncode(_student));

      notifyListeners();
      return {'success': true};
    } on DioException catch (e) {
      String errorMessage = 'Microsoft login failed';
      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      }
      return {'success': false, 'message': errorMessage};
    }
  }

  /// Forgot Password - sends a reset link to the student's linked email
  Future<Map<String, dynamic>> forgotPassword(String studentId, {String method = 'google'}) async {
    try {
      final response = await _apiService.dio.post('/student/forgot-password', data: {
        'studentId': studentId,
        'method': method,
      });
      return {'success': true, 'message': response.data['message']};
    } on DioException catch (e) {
      String errorMessage = 'Failed to send reset email';
      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      }
      return {'success': false, 'message': errorMessage};
    }
  }

  /// Link Email - updates the student's personal email and allows for Google SSO recovery
  Future<Map<String, dynamic>> linkEmail(String email) async {
    try {
      final response = await _apiService.dio.post('/student/link-email', data: {
        'email': email,
      });

      // Update local student data with the new email
      if (_student != null) {
        _student!['email'] = email;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('studentData', jsonEncode(_student));
      }

      notifyListeners();
      return {'success': true, 'message': response.data['message'] ?? 'Email linked successfully'};
    } on DioException catch (e) {
      String errorMessage = 'Failed to link email';
      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      }
      return {'success': false, 'message': errorMessage};
    }
  }

  Future<Map<String, dynamic>> changePassword(String oldPassword, String newPassword) async {
    try {
      final response = await _apiService.dio.post('/student/change-password', data: {
        'oldPassword': oldPassword,
        'newPassword': newPassword,
      });
      return {'success': true};
    } on DioException catch (e) {
      String errorMessage = 'Failed to change password';
      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      }
      return {'success': false, 'message': errorMessage};
    }
  }

  Future<Map<String, dynamic>> updateFcmToken(String fcmToken) async {
    try {
      final response = await _apiService.dio.post('/student/update-fcm', data: {
        'fcm_token': fcmToken,
      });
      return {'success': true, 'data': response.data};
    } on DioException catch (e) {
      String errorMessage = 'Failed to update FCM token';
      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      }
      return {'success': false, 'message': errorMessage};
    }
  }

  /// Refresh student data from the server
  Future<void> refreshStudent() async {
    try {
      final response = await _apiService.dio.get('/student/me');
      _student = response.data;
      final prefs = await SharedPreferences.getInstance();
      prefs.setString('studentData', jsonEncode(_student));
      notifyListeners();
    } catch (_) {}
  }

  Future<void> logout() async {
    _token = null;
    _student = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('studentToken');
    await prefs.remove('studentData');
    notifyListeners();
  }
}
