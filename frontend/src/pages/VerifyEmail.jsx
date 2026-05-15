import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Fingerprint, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing verification link.');
      navigate('/student/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      toast.error('Please enter your Student ID');
      return;
    }

    setLoading(true);
    try {
      const res = await studentApi.post('/student/verify-email', { token, studentId });
      setSuccess(true);
      toast.success(res.data.message || 'Email verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body p-4 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Accents */}
      <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-primary/10 dark:bg-primary/5 hidden rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-primary/15 dark:bg-primary/10 hidden rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 dark:bg-dark-card/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-xl dark:shadow-2xl transition-colors duration-300">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 shadow-[0_0_30px_rgba(34,197,94,0.2)] dark:shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <div className="absolute inset-[3px] bg-white dark:bg-[#111111] rounded-[1rem] transition-colors duration-300"></div>
              <ShieldCheck className="relative w-7 h-7 text-green-500 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Verify Your Email</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your Student ID to confirm this email belongs to you.</p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your email has been linked to your account successfully.</p>
              <button
                onClick={() => navigate('/student/login')}
                className="w-full bg-green-500 text-white dark:text-dark font-extrabold py-3.5 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Go to Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-green-500 dark:text-green-400 font-bold px-1" htmlFor="verify-id">Student ID</label>
                <div className="relative flex items-center">
                  <Fingerprint className="absolute left-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    id="verify-id"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all shadow-sm dark:shadow-inner"
                    placeholder="Enter your Student ID"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white dark:text-dark font-extrabold uppercase tracking-widest py-4 rounded-2xl shadow-[0_4px_15px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_25px_rgba(34,197,94,0.5)] active:scale-95 transition-all duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Link Email'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
