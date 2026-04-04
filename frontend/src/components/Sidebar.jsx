import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';

const Sidebar = ({ activePage, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { student } = useStudentAuth();
  const navigate = useNavigate();

  // الأيقونات الأساسية اللي هتظهر في الـ Bottom Bar في الموبايل
  const bottomBarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/student/dashboard' },
    { id: 'timetable', label: 'Timetable', icon: '📅', path: '/student/timetable' },
    { id: 'materials', label: 'Materials', icon: '📚', path: '/student/materials' },
  ];

  // باقي العناصر اللي هتكون في الـ Hamburger Menu
  const menuItems = [
    { id: 'grades', label: 'Grades', icon: '📊', path: '/student/grades' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️', path: '/student/roadmap' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/student/notifications' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/student/settings' },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/student/login');
  };

  return (
    <>
      {/* ============= Sidebar للـ Desktop ============= */}
      <div className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-full md:w-64 bg-gradient-to-b from-dark-card to-dark border-r border-primary/20 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-primary/20">
          <h1 className="text-xl font-bold text-primary">Academic Portal</h1>
          <p className="text-xs text-gray-500 mt-1">Faculty of CI</p>
        </div>

        {/* Student Info */}
        {student && (
          <div className="p-4 border-b border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 truncate">{student.name}</p>
            <p className="text-xs text-primary mt-1">ID: {student.id}</p>
            <p className="text-xs text-gray-500">Level {student.level} • Sec {student.section || '—'}</p>
          </div>
        )}

        {/* Navigation Desktop */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[...bottomBarItems, ...menuItems].map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary/20 text-primary border-l-4 border-primary' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button Desktop */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ============= Bottom Navigation Bar للموبايل ============= */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-primary/20 z-50 md:hidden">
        <div className="flex justify-around items-center py-2">
          {bottomBarItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all
                ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-300'}
              `}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
          
          {/* Hamburger Button للموبايل */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-gray-400 hover:text-gray-300"
          >
            <span className="text-2xl">☰</span>
            <span className="text-xs">More</span>
          </button>
        </div>
      </div>

      {/* ============= Hamburger Menu (Modal) للموبايل ============= */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 z-50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed bottom-20 left-4 right-4 bg-dark-card border border-primary/20 rounded-2xl shadow-2xl z-50 md:hidden animate-slideUp">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-primary">Menu</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-2 max-h-96 overflow-y-auto">
              {menuItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
              
              {/* Logout in Hamburger */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;