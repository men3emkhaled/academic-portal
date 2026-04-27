import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';

const ProtectedStudentRoute = ({ children }) => {
  const { token, loading } = useStudentAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !token) {
      navigate('/student/login', { replace: true });
    }
  }, [token, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-dark transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return token ? children : null;
};

export default ProtectedStudentRoute;