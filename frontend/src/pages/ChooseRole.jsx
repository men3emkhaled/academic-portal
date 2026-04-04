// frontend/src/pages/ChooseRole.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChooseRole = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-charcoal to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold neon-text mb-4">ZNU Portal</h1>
          <p className="text-xl text-gray-300">Faculty of Computers & Information</p>
          <p className="text-gray-400 mt-2">Choose your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Card */}
          <div
            onClick={() => navigate('/login')}
            className="group cursor-pointer bg-gradient-to-br from-charcoal to-black/80 border border-neon/30 rounded-2xl p-8 text-center hover:border-neon hover:shadow-[0_0_30px_rgba(57,255,20,0.2)] transition-all duration-300"
          >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">👨‍🎓</div>
            <h2 className="text-2xl font-bold text-white group-hover:text-neon transition-colors">Student</h2>
            <p className="text-gray-400 mt-2">Access your courses, grades, and academic progress</p>
          </div>

          {/* Admin Card */}
          <div
            onClick={() => navigate('/admin-login')}
            className="group cursor-pointer bg-gradient-to-br from-charcoal to-black/80 border border-neon/30 rounded-2xl p-8 text-center hover:border-neon hover:shadow-[0_0_30px_rgba(57,255,20,0.2)] transition-all duration-300"
          >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">👨‍💼</div>
            <h2 className="text-2xl font-bold text-white group-hover:text-neon transition-colors">Admin</h2>
            <p className="text-gray-400 mt-2">Manage students, courses, grades, and system settings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseRole;