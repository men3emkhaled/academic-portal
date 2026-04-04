import React, { createContext, useState, useContext, useEffect } from 'react';
import studentApi from '../services/studentApi';

const StudentAuthContext = createContext();

export const useStudentAuth = () => useContext(StudentAuthContext);

export const StudentAuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('studentToken'));
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('studentToken', token);
      fetchCurrentStudent();
    } else {
      localStorage.removeItem('studentToken');
      setStudent(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentStudent = async () => {
    try {
      const response = await studentApi.get('/me');
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student:', error);
      setToken(null);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      // ✅ صح: login مش loqin
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
      await studentApi.post('/change-password', { currentPassword, newPassword });
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