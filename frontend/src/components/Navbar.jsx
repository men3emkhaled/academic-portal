// frontend/src/components/Navbar.jsx
import React from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick, isMobile }) => {
  const { student } = useStudentAuth();
  const { token: adminToken } = useAuth();
  const user = student || (adminToken ? { name: 'Admin', role: 'admin' } : null);

  return (
    <nav className="bg-charcoal/80 backdrop-blur-md border-b border-neon/30 px-4 py-3 flex justify-between items-center sticky top-0 z-30">
      {/* زر القائمة (يظهر فقط في الموبايل) */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* العنوان في المنتصف أو اليمين */}
      <div className={`flex items-center gap-2 ${isMobile ? 'mx-auto' : 'ml-auto'}`}>
        {user && (
          <>
            <div className="text-right">
              <p className="text-sm text-gray-300">{user.role === 'admin' ? 'Admin' : 'Student'}</p>
              <p className="text-md font-semibold text-neon">{user.name}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-neon/20 border border-neon/50 flex items-center justify-center text-neon font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;