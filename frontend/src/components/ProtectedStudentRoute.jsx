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
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#050505] transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 hidden rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 hidden rounded-full animate-pulse-slow"></div>

        <div className="relative z-10">
          <div className="relative flex items-center justify-center w-20 h-20">
            <div className="absolute inset-0 border-4 border-emerald-500/20 dark:border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-full flex items-center justify-center overflow-hidden shadow-lg border border-emerald-500/20">
                <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain p-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return token ? children : null;
};

export default ProtectedStudentRoute;