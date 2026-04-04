import React, { createContext, useState, useContext, useEffect } from 'react';
import studentApi from '../services/studentApi';

const StudentAuthContext = createContext();

export const useStudentAuth = () => useContext(StudentAuthContext);

export const StudentAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('studentToken');
    return savedToken || null;
  });
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // تحديث التوكن في localStorage و axios headers
  useEffect(() => {
    if (token) {
      localStorage.setItem('studentToken', token);
      studentApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('studentToken');
      delete studentApi.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // استعادة الجلسة عند تحميل الصفحة
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('studentToken');
      
      if (savedToken) {
        setToken(savedToken);
        try {
          const response = await studentApi.get('/student/me');
          setStudent(response.data);
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          localStorage.removeItem('studentToken');
          setToken(null);
          setStudent(null);
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // ✅ دالة تسجيل الدخول مع دعم AbortController
  const login = async (username, password, signal) => {
    try {
      const response = await studentApi.post('/student/login', { username, password }, { signal });
      const { token: newToken, student: studentData } = response.data;
      
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
    localStorage.removeItem('studentToken');
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await studentApi.post('/student/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password change failed'
      };
    }
  };

  return (
    <StudentAuthContext.Provider value={{
      token,
      student,
      loading,
      login,
      logout,
      changePassword
    }}>
      {children}
    </StudentAuthContext.Provider>
  );
};