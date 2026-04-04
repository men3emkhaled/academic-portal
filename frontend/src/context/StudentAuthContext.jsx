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
    } else {
      localStorage.removeItem('studentToken');
      setStudent(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await studentApi.post('/login', { username, password });
      const { token: newToken, student: studentData } = response.data;
      setToken(newToken);
      setStudent(studentData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Use password: 123456'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setStudent(null);
    localStorage.removeItem('studentToken');
  };

  return (
    <StudentAuthContext.Provider value={{
      token,
      student,
      loading,
      login,
      logout,
    }}>
      {children}
    </StudentAuthContext.Provider>
  );
};