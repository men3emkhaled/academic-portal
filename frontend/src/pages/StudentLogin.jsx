import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, Lock, Eye, EyeOff, HelpCircle, ArrowRight, Users, Building2, Sparkles, MessageCircle, Smartphone, Download, Mail, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from "@azure/msal-react";
import { EventType } from "@azure/msal-browser";
import { loginRequest } from "../config/microsoftAuthConfig";

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStudentId, setResetStudentId] = useState('');
  const [resetMethod, setResetMethod] = useState('google');
  const [resetLoading, setResetLoading] = useState(false);
  
  const { login, googleLogin, microsoftLogin, forgotPassword, token, loading: authLoading } = useStudentAuth();
  const { instance } = useMsal();
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  // Focus effect for login inputs
  const [isFocused, setIsFocused] = useState('');

  if (authLoading) return null;

  useEffect(() => {
    if (!authLoading && token) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [token, authLoading, navigate]);

  // Handle MSAL Redirect Login
  useEffect(() => {
    // Process redirect response when page loads back from Microsoft login
    instance.handleRedirectPromise().then((response) => {
      if (response && response.accessToken) {
        setLoading(true);
        microsoftLogin(response.accessToken).then((result) => {
          setLoading(false);
          if (result.success) {
            toast.success('Login successful!');
            navigate('/student/dashboard', { replace: true });
          } else {
            toast.error(result.message || 'Microsoft Login failed');
          }
        });
      }
    }).catch((error) => {
      console.error('MSAL redirect error:', error);
    });

    const callbackId = instance.addEventCallback((message) => {
      if (message.eventType === EventType.LOGIN_SUCCESS && message.payload) {
        const payload = message.payload;
        if (payload.accessToken) {
          setLoading(true);
          microsoftLogin(payload.accessToken).then((result) => {
            setLoading(false);
            if (result.success) {
              toast.success('Login successful!');
              navigate('/student/dashboard', { replace: true });
            } else {
              toast.error(result.message || 'Microsoft Login failed');
            }
          });
        }
      }
      if (message.eventType === EventType.LOGIN_FAILURE) {
        toast.error('Microsoft Login failed');
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance, microsoftLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both student ID and password');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    const result = await login(username, password, abortController.signal);
    setLoading(false);
    abortControllerRef.current = null;

    if (result.success) {
      toast.success('Login successful!');
      if (rememberDevice) {
        localStorage.setItem('rememberDevice', 'true');
      } else {
        localStorage.removeItem('rememberDevice');
      }

      // Save credentials for PWA password manager (iOS/Safari)
      if (window.PasswordCredential) {
        try {
          const cred = new window.PasswordCredential({
            id: username,
            password: password,
            name: 'ZNU CS Portal',
          });
          await navigator.credentials.store(cred);
        } catch (err) {
          // Silently fail — not all browsers support this
        }
      }
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  // Detect if running as installed PWA (standalone mode)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // Try to get a saved login_hint for Google
  const savedGoogleHint = localStorage.getItem('googleLoginHint') || undefined;

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const result = await googleLogin(tokenResponse.access_token);
      setLoading(false);
      if (result.success) {
        toast.success('Login successful!');
      } else {
        toast.error(result.message || 'Google Login failed');
      }
    },
    onError: () => {
      toast.error('Google Login Failed');
    },
    ux_mode: isStandalone ? 'redirect' : 'popup',
    redirect_uri: isStandalone ? window.location.origin + '/student/login' : undefined,
    hint: savedGoogleHint,
  });

  const handleMicrosoftLogin = async () => {
    const savedMsHint = localStorage.getItem('microsoftLoginHint') || undefined;
    const requestWithHint = savedMsHint
      ? { ...loginRequest, loginHint: savedMsHint }
      : loginRequest;

    // In PWA standalone mode, try silent login first, then fallback to redirect
    if (isStandalone) {
      if (savedMsHint) {
        try {
          setLoading(true);
          const silentResponse = await instance.ssoSilent(requestWithHint);
          if (silentResponse?.accessToken) {
            const result = await microsoftLogin(silentResponse.accessToken);
            setLoading(false);
            if (result.success) {
              toast.success('Login successful!');
              navigate('/student/dashboard', { replace: true });
              return;
            }
          }
        } catch (e) {
          // ssoSilent failed, fall through to redirect
          setLoading(false);
        }
      }
      instance.loginRedirect(requestWithHint);
      return;
    }

    try {
      setLoading(true);
      const loginResponse = await instance.loginPopup(loginRequest);
      if (loginResponse && loginResponse.accessToken) {
        const result = await microsoftLogin(loginResponse.accessToken);
        if (result.success) {
          toast.success('Login successful!');
        } else {
          toast.error(result.message || 'Microsoft Login failed');
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Microsoft login error:', error);
      
      // Fallback to redirect if popup is blocked (common on mobile browsers)
      if (error.name === 'BrowserAuthError' && (error.message.includes('popup_window_error') || error.message.includes('empty_window_error'))) {
        instance.loginRedirect(loginRequest);
      } else if (error.name !== 'BrowserAuthError' || (!error.message.includes('user_cancelled') && !error.message.includes('interaction_in_progress'))) {
        toast.error('Microsoft Login Failed');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetStudentId.trim()) {
      toast.error('Please enter your Student ID');
      return;
    }
    
    setResetLoading(true);
    const result = await forgotPassword(resetStudentId, resetMethod);
    setResetLoading(false);
    
    if (result.success) {
      toast.success(result.message || 'Password reset link sent!');
      setShowForgotPassword(false);
      setResetStudentId('');
    } else {
      toast.error(result.message || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark relative overflow-x-hidden overflow-y-auto w-full pt-16 pb-12 font-body text-gray-900 dark:text-white transition-colors duration-300">
      {/* Ambient Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-primary/10 dark:bg-primary/5 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-primary/15 dark:bg-primary/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full flex-grow flex flex-col items-center px-4">
        
        {/* LOGIN FORM */}
        <div className="w-full max-w-md mx-auto mb-16 relative">
          <div className="bg-white/90 dark:bg-dark-card/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 md:p-10 shadow-xl dark:shadow-2xl transition-colors duration-300">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="relative flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-primary to-[#5ca846] shadow-[0_0_35px_rgba(46,204,113,0.2)] dark:shadow-[0_0_35px_rgba(142,255,113,0.3)]">
                <div className="absolute inset-[3px] bg-white dark:bg-[#111111] rounded-[1.3rem] transition-colors duration-300"></div>
                <span className="relative font-black text-4xl text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-primary dark:from-white dark:to-primary" style={{fontFamily: "'Manrope', 'Inter', sans-serif"}}>Z</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">ZNU Student Portal</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your credentials to access the portal.</p>
            </div>

            <form onSubmit={handleSubmit} action="#" method="post" className="flex flex-col gap-6">
              {/* Student ID Field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-primary font-bold px-1" htmlFor="student-id">Student ID</label>
                <div className={`relative flex items-center transition-all duration-300 ${isFocused === 'username' ? 'scale-[1.02]' : ''}`}>
                  <Fingerprint className={`absolute left-4 w-5 h-5 transition-colors ${isFocused === 'username' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                  <input
                    id="student-id"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setIsFocused('username')}
                    onBlur={() => setIsFocused('')}
                    className="w-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-sm dark:shadow-inner"
                    placeholder="e.g. 29212025100533"
                    autoComplete="username"
                    disabled={loading || authLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-primary font-bold px-1" htmlFor="password">Password</label>
                <div className={`relative flex items-center transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.02]' : ''}`}>
                  <Lock className={`absolute left-4 w-5 h-5 transition-colors ${isFocused === 'password' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused('password')}
                    onBlur={() => setIsFocused('')}
                    className="w-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-sm dark:shadow-inner"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading || authLoading}
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

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-3 sm:gap-0">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#161616] text-primary focus:ring-primary focus:ring-offset-0 transition-all"
                    disabled={loading || authLoading}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Remember device</span>
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary hover:text-primaryDark dark:hover:text-white transition-colors font-semibold"
                  >
                    Forget Password?
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || authLoading}
                className="w-full bg-gradient-to-r from-primary to-[#7fe860] text-dark font-extrabold uppercase tracking-widest py-4 rounded-2xl shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-[0_4px_15px_rgba(142,255,113,0.3)] hover:shadow-[0_6px_25px_rgba(46,204,113,0.5)] dark:hover:shadow-[0_6px_25px_rgba(142,255,113,0.5)] active:scale-95 transition-all duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
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
                  <>
                    Login
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-widest">Or</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
              </div>

              <div className="w-full flex flex-col gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => handleGoogleLogin()}
                  disabled={loading || authLoading}
                  className="w-full h-[40px] bg-white dark:bg-[#161616] hover:bg-gray-100 dark:hover:bg-[#222222] text-gray-900 dark:text-white rounded-full flex items-center justify-center gap-3 transition-all text-sm font-bold border border-gray-200 dark:border-white/10 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.12 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </button>
                
                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  disabled={loading || authLoading}
                  className="w-full h-[40px] bg-white dark:bg-[#2F2F2F] hover:bg-gray-100 dark:hover:bg-black text-gray-900 dark:text-white rounded-full flex items-center justify-center gap-3 transition-all text-sm font-bold border border-gray-200 dark:border-white/10 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#f25022" d="M0 0h10v10H0z"/>
                    <path fill="#7fbb00" d="M11 0h10v10H11z"/>
                    <path fill="#00a1f1" d="M0 11h10v10H0z"/>
                    <path fill="#ffb900" d="M11 11h10v10H11z"/>
                  </svg>
                  Sign in with Microsoft
                </button>
              </div>

            </form>
          </div>
          
          <div className="absolute -bottom-16 -left-12 opacity-5 pointer-events-none select-none z-[-1]">
            <h3 className="text-9xl font-black tracking-tighter leading-none text-gray-900 dark:text-white">01</h3>
          </div>
        </div>

        {/* INFO CARDS SECTION */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-lg border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-dark-card hover:border-primary/30 transition-all duration-300 group shadow-sm dark:shadow-none">
            <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Active Students</p>
              <h4 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                540
                <span className="text-primary text-xl ml-1">+</span>
              </h4>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-lg border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-dark-card hover:border-primary/30 transition-all duration-300 group shadow-sm dark:shadow-none">
            <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Departments</p>
              <h4 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                3
              </h4>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-lg border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-center hover:bg-gray-50 dark:hover:bg-dark-card hover:border-primary/30 transition-all duration-300 group shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h3 className="text-gray-900 dark:text-white font-bold">Portal Features</h3>
            </div>
            <ul className="text-gray-500 dark:text-gray-400 text-sm space-y-1">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span> Quizzes & Exams Analytics</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span> Real-time Live Timetables</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span> Personal Dynamic Roadmap</li>
            </ul>
          </div>

        </div>

        {/* Community & App Links */}
        <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 px-4">
          <a 
            href="https://chat.whatsapp.com/DGzg4BlkxL57nIahGMG2CH?mode=gi_t" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/20 px-6 py-4 rounded-2xl hover:bg-[#25D366]/20 hover:border-[#25D366]/40 transition-all group shadow-[0_0_20px_rgba(37,211,102,0.05)] hover:shadow-[0_0_30px_rgba(37,211,102,0.15)] flex-1 w-full"
          >
            <div className="bg-[#25D366] p-2.5 rounded-xl text-white dark:text-dark shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold text-base md:text-lg leading-tight group-hover:text-[#25D366] transition-colors">Join WhatsApp Community</h4>
              <p className="text-gray-600 dark:text-[#25D366]/70 text-xs md:text-sm">Stay strictly updated with announcements</p>
            </div>
          </a>

          <a 
            href="https://drive.google.com/file/d/1tFjXL1miRzDCVinvYhUv7IThnHW8Ble7/view?usp=drive_link" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-primary/10 border border-primary/20 px-6 py-4 rounded-2xl hover:bg-primary/20 hover:border-primary/40 transition-all group shadow-[0_0_20px_rgba(46,204,113,0.05)] dark:shadow-[0_0_20px_rgba(142,255,113,0.05)] hover:shadow-[0_0_30px_rgba(46,204,113,0.15)] dark:hover:shadow-[0_0_30px_rgba(142,255,113,0.15)] flex-1 w-full"
          >
            <div className="bg-primary p-2.5 rounded-xl text-white dark:text-dark shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold text-base md:text-lg leading-tight group-hover:text-primary transition-colors">Download Android App</h4>
              <p className="text-gray-600 dark:text-primary/70 text-xs md:text-sm">Get the official app for your phone</p>
            </div>
          </a>
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full text-center px-6 mt-auto z-10 opacity-60">
        <div className="w-full max-w-md mx-auto border-t border-gray-300 dark:border-white/10 pt-6">
          <p className="text-xs tracking-[0.2em] uppercase text-gray-500 font-bold">CS Education System © 2026 ZNU Portal</p>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> Reset Password
              </h3>
              <button 
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Enter your Student ID to receive a secure password reset link on your linked email address.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-primary font-bold px-1 mb-2 block" htmlFor="reset-id">Student ID</label>
                  <div className="relative flex items-center">
                    <Fingerprint className="absolute left-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      id="reset-id"
                      type="text"
                      value={resetStudentId}
                      onChange={(e) => setResetStudentId(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-sm dark:shadow-inner"
                      placeholder="Enter your ID"
                      required
                      disabled={resetLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-primary font-bold px-1 mb-3 block">Send Reset Link To:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setResetMethod('google')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                        resetMethod === 'google' 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <svg className="w-6 h-6" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.12 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Personal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetMethod('microsoft')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                        resetMethod === 'microsoft' 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <svg className="w-6 h-6" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#f25022" d="M0 0h10v10H0z"/>
                        <path fill="#7fbb00" d="M11 0h10v10H11z"/>
                        <path fill="#00a1f1" d="M0 11h10v10H0z"/>
                        <path fill="#ffb900" d="M11 11h10v10H11z"/>
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Institutional</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-primary text-white dark:text-dark font-extrabold py-3.5 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLogin;