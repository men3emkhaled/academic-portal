import React, { createContext, useState, useContext, useEffect } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/localStorage';
import studentApi from '../services/studentApi';

const StudentAuthContext = createContext();

export const useStudentAuth = () => useContext(StudentAuthContext);

export const StudentAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = safeGetItem('studentToken');
    return savedToken || null;
  });

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      safeSetItem('studentToken', token);
      studentApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      safeRemoveItem('studentToken');
      delete studentApi.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const savedToken = safeGetItem('studentToken');

      if (savedToken) {
        setToken(savedToken);

        try {
          const response = await studentApi.get('/student/me');
          if (!cancelled) {
            setStudent(response.data);
          }
        } catch (error) {
          if (!cancelled) {
            console.error('Session expired or invalid token:', error);
            safeRemoveItem('studentToken');
            setToken(null);
            setStudent(null);
          }
        }
      }
      if (!cancelled) {
        setLoading(false);
      }
    };

    initAuth();

    // Safety: force loading to false after 10s regardless of API response
    const safetyTimer = setTimeout(() => {
      if (!cancelled) {
        console.warn('Auth check timed out — forcing loading to false, keeping token');
        setLoading(false);
      }
    }, 10000);

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, []);

  const login = async (username, password, signal) => {
    try {
      const response = await studentApi.post('/student/login', { username, password }, { signal });
      const { token: newToken, student: studentData } = response.data;

      safeSetItem('studentToken', newToken);
      studentApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setToken(newToken);
      setStudent(studentData);

      return { success: true };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Login request was cancelled');
        return { success: false, message: 'Request cancelled' };
      }
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const logout = () => {
    setToken(null);
    setStudent(null);
    safeRemoveItem('studentToken');
  };

  const linkEmail = async (email) => {
    try {
      await studentApi.post('/student/link-email', { email });
      // Update student context state with new email
      setStudent(prev => ({ ...prev, email }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to link email'
      };
    }
  };

  const forgotPassword = async (studentId, method = 'google') => {
    try {
      const response = await studentApi.post('/student/forgot-password', { studentId, method });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send password reset email'
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await studentApi.post('/student/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  };

  const googleLogin = async (token) => {
    try {
      // Determine if it's an idToken (credential) or accessToken
      // JWTs usually have 3 parts separated by dots and start with 'eyJ'
      const isIdToken = typeof token === 'string' && token.split('.').length === 3 && token.startsWith('eyJ');
      const payload = isIdToken ? { credential: token } : { accessToken: token };

      const response = await studentApi.post('/student/google-login', payload);
      const { token: newToken, student: studentData } = response.data;

      safeSetItem('studentToken', newToken);
      studentApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setToken(newToken);
      setStudent(studentData);

      // Save email as hint for next Google login (helps PWA skip account picker)
      if (studentData?.email) {
        safeSetItem('googleLoginHint', studentData.email);
      }

      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = 'Google Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const microsoftLogin = async (accessToken) => {
    try {
      const response = await studentApi.post('/student/microsoft-login', { accessToken });
      const { token: newToken, student: studentData } = response.data;

      safeSetItem('studentToken', newToken);
      studentApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setToken(newToken);
      setStudent(studentData);

      // Save institutional email as hint for next Microsoft login (helps PWA skip account picker)
      if (studentData?.institutional_email) {
        safeSetItem('microsoftLoginHint', studentData.institutional_email);
      }

      return { success: true };
    } catch (error) {
      console.error('Microsoft login error:', error);
      let errorMessage = 'Microsoft Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await studentApi.post('/student/change-password', { oldPassword, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password'
      };
    }
  };

  const uploadAvatar = async (formData) => {
    try {
      const response = await studentApi.post('/student/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const { avatar_url } = response.data;
      setStudent(prev => ({ ...prev, avatar_url }));
      return { success: true, avatar_url };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload image'
      };
    }
  };

  return (
    <StudentAuthContext.Provider value={{
      token,
      student,
      loading,
      login,
      googleLogin,
      logout,
      changePassword,
      linkEmail,
      forgotPassword,
      resetPassword,
      microsoftLogin,
      uploadAvatar
    }}>
      {children}
    </StudentAuthContext.Provider>
  );
};