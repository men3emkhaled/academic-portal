import React, { createContext, useState, useContext, useEffect } from 'react';
import studentApi from '../services/studentApi';

const StudentAuthContext = createContext();

export const useStudentAuth = () => useContext(StudentAuthContext);

export const StudentAuthProvider = ({ children }) => {
  // ✅ جلب التوكن من localStorage عند تحميل الصفحة
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('studentToken');
    return savedToken || null;
  });
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ كل ما يتغير التوكن، احفظه في localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('studentToken', token);
      // ✅ ضبط التوكن في axios headers
      studentApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('studentToken');
      delete studentApi.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // ✅ جلب بيانات الطالب لو فيه توكن مخزن
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
          // لو التوكن مش صالح، نسجله خروج
          localStorage.removeItem('studentToken');
          setToken(null);
          setStudent(null);
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await studentApi.post('/student/login', { username, password });
      const { token: newToken, student: studentData } = response.data;
      
      setToken(newToken);
      setStudent(studentData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed'
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