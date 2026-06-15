import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import SkeletonLayout from './SkeletonLayout';

const ProtectedStudentRoute = ({ children }) => {
  const { token, loading } = useStudentAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !token) {
      navigate('/student/login', { replace: true });
    }
  }, [token, loading, navigate]);

  if (loading) {
    return <SkeletonLayout />;
  }

  return token ? (
    <div
      className="w-full h-full min-h-screen"
      style={{ animation: 'ultraLightFade 0.08s ease-out forwards' }}
    >
      <style>{`
        @keyframes ultraLightFade {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
      `}</style>
      {children}
    </div>
  ) : null;
};

export default ProtectedStudentRoute;
