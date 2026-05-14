import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword } = useStudentAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error(t('auth.reset_password.error_invalid_token'));
      navigate('/student/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/student/login');
      }, 3000);
    } else {
      toast.error(result.message || 'Failed to reset password');
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body p-4 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Accents */}
      <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-primary/10 dark:bg-primary/5 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-primary/15 dark:bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 dark:bg-dark-card/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-xl dark:shadow-2xl transition-colors duration-300">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-primary to-[#5ca846] shadow-[0_0_30px_rgba(46,204,113,0.2)] dark:shadow-[0_0_30px_rgba(142,255,113,0.3)]">
              <div className="absolute inset-[3px] bg-white dark:bg-[#111111] rounded-[1rem] transition-colors duration-300"></div>
              <Lock className="relative w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Create New Password</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Please enter your new password below.</p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your password has been changed successfully.</p>
              <button
                onClick={() => navigate('/student/login')}
                className="w-full bg-primary text-white dark:text-dark font-extrabold py-3.5 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Go to Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-primary font-bold px-1" htmlFor="new-password">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-sm dark:shadow-inner"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-primary font-bold px-1" htmlFor="confirm-password">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-sm dark:shadow-inner"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-[#7fe860] text-dark font-extrabold uppercase tracking-widest py-4 rounded-2xl shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-[0_4px_15px_rgba(142,255,113,0.3)] hover:shadow-[0_6px_25px_rgba(46,204,113,0.5)] dark:hover:shadow-[0_6px_25px_rgba(142,255,113,0.5)] active:scale-95 transition-all duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
