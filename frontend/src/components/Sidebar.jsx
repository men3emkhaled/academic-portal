import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';

const Sidebar = ({ activePage, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { student } = useStudentAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/student/dashboard' },
    { id: 'grades', label: 'Grades', icon: '📊', path: '/student/grades' },
    { id: 'timetable', label: 'Timetable', icon: '📅', path: '/student/timetable' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️', path: '/student/roadmap' },
    { id: 'materials', label: 'Materials', icon: '📚', path: '/student/materials' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/student/notifications' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/student/settings' },
  ];

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="md:hidden fixed top-20 left-4 z-50 bg-primary text-dark p-2 rounded-lg shadow-lg"
      >
        {isCollapsed ? '☰' : '✕'}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-gradient-to-b from-dark-card to-dark border-r border-primary/20 
        transition-all duration-300 z-40 shadow-2xl
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-primary/20">
          <h1 className={`font-bold text-primary ${isCollapsed ? 'text-sm text-center' : 'text-xl'}`}>
            {isCollapsed ? 'AP' : 'Academic Portal'}
          </h1>
          {!isCollapsed && (
            <p className="text-xs text-gray-500 mt-1">Faculty of CI</p>
          )}
        </div>

        {/* Student Info */}
        {!isCollapsed && student && (
          <div className="p-4 border-b border-white/10 bg-white/5">
            <p className="text-sm text-gray-400">Welcome,</p>
            <p className="font-semibold text-white truncate">{student.name}</p>
            <p className="text-xs text-primary mt-1">ID: {student.id}</p>
            <p className="text-xs text-gray-500">Level {student.level} • Sec {student.section || '—'}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setIsCollapsed(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary/20 text-primary border-l-4 border-primary' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className={`
              flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <span className="text-xl">🚪</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}
    </>
  );
};

export default Sidebar;