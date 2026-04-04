import React, { createContext, useState, useContext, useEffect } from 'react';
import studentApi from '../services/studentApi';

const StudentAuthContext = createContext();

export const useStudentAuth = () => useContext(StudentAuthContext);

export const StudentAuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('studentToken'));
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // تحديث التوكن في localStorage و axios headers
  useEffect(() => {
    if (token) {
      localStorage.setItem('studentToken', token);
      // ✅ مهم: تحديث الـ default header في axios
      studentApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentStudent();
    } else {
      localStorage.removeItem('studentToken');
      delete studentApi.defaults.headers.common['Authorization'];
      setStudent(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentStudent = async () => {
    try {
      console.log('🔍 Fetching current student with token:', localStorage.getItem('studentToken'));
      const response = await studentApi.get('/student/me');
      console.log('✅ Student data:', response.data);
      setStudent(response.data);
    } catch (error) {
      console.error('❌ Error fetching student:', error.response?.status, error.response?.data);
      // لو التوكن مش صالح، نسجله خروج
      if (error.response?.status === 401) {
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('📤 Login attempt:', username);
      const response = await studentApi.post('/student/login', { username, password });
      const { token: newToken, student: studentData } = response.data;
      
      console.log('✅ Login success, token received:', newToken ? 'Yes' : 'No');
      
      setToken(newToken);
      setStudent(studentData);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error.response?.status, error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out');
    setToken(null);
    setStudent(null);
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