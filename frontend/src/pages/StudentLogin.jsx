import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import toast from 'react-hot-toast';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStudentAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both student ID and password');
      return;
    }
    
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/student/dashboard');
    } else {
      toast.error(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-dark via-dark-card to-black">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎓</div>
            <h1 className="text-3xl font-bold text-primary mb-2">Student Login</h1>
            <p className="text-gray-400 text-sm">Enter your student ID and password to access your portal</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Student ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="e.g., 2021001"
                autoComplete="username"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primaryDark text-dark font-bold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login →'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Default password is set by admin. Contact your administrator if you have issues.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;