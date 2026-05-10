import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, Lock, Eye, EyeOff, ArrowRight, MessageCircle, Download, Mail, X, Sparkles, User, GraduationCap, Code, Moon, Sun } from 'lucide-react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from "@azure/msal-react";
import { EventType } from "@azure/msal-browser";
import { loginRequest } from "../config/microsoftAuthConfig";
import { useTheme } from '../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();
  const { instance } = useMsal();
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  const [isFocused, setIsFocused] = useState('');

  if (authLoading) return null;

  useEffect(() => {
    if (!authLoading && token) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [token, authLoading, navigate]);

  // MSAL redirect processing omitted for brevity in this snippet but kept in real code.
  useEffect(() => {
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
    }).catch(console.error);

    const callbackId = instance.addEventCallback((message) => {
      if (message.eventType === EventType.LOGIN_SUCCESS && message.payload?.accessToken) {
        setLoading(true);
        microsoftLogin(message.payload.accessToken).then((result) => {
          setLoading(false);
          if (result.success) {
            toast.success('Login successful!');
            navigate('/student/dashboard', { replace: true });
          }
        });
      }
    });

    return () => callbackId && instance.removeEventCallback(callbackId);
  }, [instance, microsoftLogin, navigate]);

  const handleSubmit = async (e) => {
    if (loading) return;
    if (!username.trim() || !password.trim()) {
      e.preventDefault();
      toast.error('Please enter both student ID and password');
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    const result = await login(username, password, abortController.signal);
    setLoading(false);
    abortControllerRef.current = null;

    if (result.success) {
      toast.success('Login successful!');
      if (rememberDevice) safeSetItem('rememberDevice', 'true');
      else safeRemoveItem('rememberDevice');

      if (window.PasswordCredential) {
        try {
          const cred = new window.PasswordCredential({ id: username, password: password, name: 'ZNU CS Portal' });
          await navigator.credentials.store(cred);
        } catch (err) { }
      }
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const savedGoogleHint = safeGetItem('googleLoginHint') || undefined;

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const result = await googleLogin(tokenResponse.access_token);
      setLoading(false);
      if (result.success) toast.success('Login successful!');
      else toast.error(result.message || 'Google Login failed');
    },
    onError: () => toast.error('Google Login Failed'),
    ux_mode: isStandalone ? 'redirect' : 'popup',
    redirect_uri: isStandalone ? window.location.origin + '/student/login' : undefined,
    login_hint: savedGoogleHint,
  });

  const handleMicrosoftLogin = async () => {
    const savedMsHint = safeGetItem('microsoftLoginHint') || undefined;
    const requestWithHint = savedMsHint ? { ...loginRequest, loginHint: savedMsHint } : loginRequest;

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
        } catch (e) { setLoading(false); }
      }
      instance.loginRedirect(requestWithHint);
      return;
    }

    try {
      setLoading(true);
      const loginResponse = await instance.loginPopup(loginRequest);
      if (loginResponse?.accessToken) {
        const result = await microsoftLogin(loginResponse.accessToken);
        if (result.success) toast.success('Login successful!');
        else toast.error(result.message || 'Microsoft Login failed');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.name === 'BrowserAuthError' && (error.message.includes('popup_window_error') || error.message.includes('empty_window_error'))) {
        instance.loginRedirect(loginRequest);
      } else if (error.name !== 'BrowserAuthError' || (!error.message.includes('user_cancelled') && !error.message.includes('interaction_in_progress'))) {
        toast.error('Microsoft Login Failed');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetStudentId.trim()) return toast.error('Please enter your Student ID');

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
    <div className="min-h-screen w-full flex bg-white dark:bg-[#0a0a0a] overflow-hidden font-sans text-gray-900 dark:text-white transition-colors duration-500 relative pt-[48px]">


      {/* LEFT PANEL: Branding & Visuals (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-50 dark:bg-[#0a0a0a] items-center justify-center p-12 overflow-hidden border-r border-gray-200 dark:border-white/5 transition-colors duration-500">
        {/* Animated Mesh Gradients */}
        <div className="absolute inset-0 z-0 opacity-60 dark:opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 blur-[150px] rounded-full animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-[#00a1f1]/10 blur-[150px] rounded-full animate-pulse-slow"></div>
        </div>

        {/* Dynamic Grid Pattern */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#0a0a0a] via-transparent to-transparent"></div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-[20%] right-[15%] w-16 h-16 bg-gradient-to-br from-[#00a1f1] to-transparent rounded-full blur-md opacity-60 animate-[bounce_4s_infinite]"></div>
        <div className="absolute bottom-[25%] left-[10%] w-24 h-24 bg-gradient-to-tr from-primary to-transparent rounded-full blur-lg opacity-40 animate-[bounce_5s_infinite_reverse]"></div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-lg flex flex-col gap-12">
          {/* Logo & Intro */}
          <div className="space-y-6 animate-fadeInUp text-center flex flex-col items-center">
            <div className="relative group">
              <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative inline-flex items-center justify-center w-48 h-48 rounded-full overflow-hidden transition-transform duration-700 group-hover:scale-110">
                <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight transition-colors">
                Zagazig National <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#2ecc71] dark:from-primary dark:to-[#a7f3d0]">University.</span>
              </h1>
              <p className="text-xs font-black uppercase tracking-[0.5em] text-primary/60 mt-2">Official Academic Portal</p>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-md transition-colors mx-auto font-medium">
              Welcome to the official digital gateway of ZNU. Manage your academic excellence, track progress, and shape your future.
            </p>
          </div>

          {/* Floating Glassmorphic ID Card */}
          <div className="relative group perspective-1000 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-[#58d68d] to-[#00a1f1] rounded-[2rem] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-300"></div>
            <div className="relative w-full h-64 bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/20 rounded-[2rem] p-8 flex flex-col justify-between transform transition-all duration-500 hover:-translate-y-2 hover:rotate-3 hover:scale-[1.05] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-900/10 dark:bg-white/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <div className="w-24 h-2 bg-gray-900/20 dark:bg-white/20 rounded-full mb-2"></div>
                    <div className="w-16 h-2 bg-gray-900/10 dark:bg-white/10 rounded-full"></div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-primary text-xs font-bold uppercase tracking-wider">
                  Active
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-500 dark:text-white/50">
                  <GraduationCap className="w-5 h-5 text-gray-600 dark:text-white/70" />
                  <div className="w-full h-1.5 bg-gray-900/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[75%] h-full bg-gradient-to-r from-primary to-[#a7f3d0] rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500 dark:text-white/50">
                  <Code className="w-5 h-5 text-gray-600 dark:text-white/70" />
                  <div className="w-full h-1.5 bg-gray-900/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[45%] h-full bg-[#00a1f1] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: The Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative justify-center items-center p-6 sm:p-12 lg:p-20 bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden">

        {/* Subtle right panel ambient glow */}
        <div className="hidden lg:block absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Mobile Background Elements */}
        <div className="lg:hidden absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-5%] left-[-10%] w-[70vw] h-[70vw] bg-primary/15 blur-[100px] rounded-full animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute bottom-[-5%] right-[-10%] w-[60vw] h-[60vw] bg-[#00a1f1]/10 blur-[100px] rounded-full animate-pulse-slow"></div>
          {/* Mobile Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem]">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#0a0a0a] via-transparent to-transparent"></div>
          </div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-fadeInUp bg-white/60 dark:bg-[#111111]/60 lg:bg-transparent lg:dark:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border border-gray-200/50 dark:border-white/10 lg:border-transparent lg:dark:border-transparent rounded-[2rem] lg:rounded-none p-6 sm:p-10 lg:p-0 shadow-2xl lg:shadow-none">

          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-5 rounded-full bg-white dark:bg-white/5 border border-primary/20 shadow-[0_0_35px_rgba(46,204,113,0.2)] overflow-hidden">
              <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain p-3" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">Access your academic workspace</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-10">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Sign In</h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">Access your personalized academic workspace.</p>
          </div>

          <iframe name="dummyframe" id="dummyframe" style={{ display: 'none' }} title="dummy"></iframe>

          <form onSubmit={handleSubmit} target="dummyframe" action="/student/login-dummy" method="post" className="space-y-6">

            {/* Student ID */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 pl-1">Student ID</label>
              <div className={`relative group transition-all duration-300 ${isFocused === 'username' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary to-[#58d68d] rounded-2xl blur opacity-0 transition-opacity duration-300 ${isFocused === 'username' ? 'opacity-40' : 'group-hover:opacity-20'}`}></div>
                <div className="relative flex items-center bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transition-colors shadow-sm dark:shadow-none">
                  <div className="pl-5 pr-3 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                    <Fingerprint className={`w-5 h-5 transition-colors duration-300 ${isFocused === 'username' ? 'text-primary' : ''}`} />
                  </div>
                  <input
                    id="student-id"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setIsFocused('username')}
                    onBlur={() => setIsFocused('')}
                    className="w-full bg-transparent py-4 pr-5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#555] focus:outline-none font-medium text-lg"
                    placeholder="29212025100..."
                    autoComplete="username"
                    disabled={loading || authLoading}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1 pr-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Password</label>
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs font-bold text-primary hover:text-primaryLight transition-colors">
                  Forgot?
                </button>
              </div>
              <div className={`relative group transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary to-[#58d68d] rounded-2xl blur opacity-0 transition-opacity duration-300 ${isFocused === 'password' ? 'opacity-40' : 'group-hover:opacity-20'}`}></div>
                <div className="relative flex items-center bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transition-colors shadow-sm dark:shadow-none">
                  <div className="pl-5 pr-3 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                    <Lock className={`w-5 h-5 transition-colors duration-300 ${isFocused === 'password' ? 'text-primary' : ''}`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused('password')}
                    onBlur={() => setIsFocused('')}
                    className="w-full bg-transparent py-4 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#555] focus:outline-none font-medium text-lg tracking-widest placeholder:tracking-normal"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading || authLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 text-gray-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer group w-max">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#111] transition-all overflow-hidden">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="peer sr-only"
                  disabled={loading || authLoading}
                />
                <div className="absolute inset-0 bg-primary translate-y-full peer-checked:translate-y-0 transition-transform duration-200"></div>
                <svg className="w-3.5 h-3.5 text-white absolute scale-0 peer-checked:scale-100 transition-transform duration-200 delay-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Remember this device</span>
            </label>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="relative w-full overflow-hidden bg-gray-900 dark:bg-white text-white dark:text-black font-extrabold text-lg py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_40px_rgba(46,204,113,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100 group"
            >
              {/* Sweeping Light Animation */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-black/20 to-transparent skew-x-12"></div>

              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/5"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Continue with</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/5"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading || authLoading}
                className="flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors text-sm font-bold shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.12 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={loading || authLoading}
                className="flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors text-sm font-bold shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 21 21">
                  <path fill="#f25022" d="M0 0h10v10H0z" /><path fill="#7fbb00" d="M11 0h10v10H11z" /><path fill="#00a1f1" d="M0 11h10v10H0z" /><path fill="#ffb900" d="M11 11h10v10H11z" />
                </svg>
                Microsoft
              </button>
            </div>
          </form>

          {/* Bottom Links */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="https://chat.whatsapp.com/DGzg4BlkxL57nIahGMG2CH?mode=gi_t" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#25D366] transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp Community
            </a>
            <a href="https://drive.google.com/file/d/1tFjXL1miRzDCVinvYhUv7IThnHW8Ble7/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
              <Download className="w-4 h-4" /> Download App
            </a>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal (Ultra-modern) */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowForgotPassword(false)}></div>
          <div className="relative bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowForgotPassword(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-primary" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Reset Password</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Enter your Student ID to receive a secure password reset link on your linked email address.</p>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Student ID</label>
                <div className="relative flex items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                  <div className="pl-5 pr-3 text-gray-500"><Fingerprint className="w-5 h-5" /></div>
                  <input
                    type="text"
                    value={resetStudentId}
                    onChange={(e) => setResetStudentId(e.target.value)}
                    className="w-full bg-transparent py-4 pr-5 text-gray-900 dark:text-white placeholder:text-[#555] focus:outline-none font-medium"
                    placeholder="29212..."
                    required
                    disabled={resetLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setResetMethod('google')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${resetMethod === 'google' ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-white/5 hover:bg-[#1a1a1a]'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Personal</span>
                </button>
                <button type="button" onClick={() => setResetMethod('microsoft')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${resetMethod === 'microsoft' ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-white/5 hover:bg-[#1a1a1a]'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Institutional</span>
                </button>
              </div>

              <button type="submit" disabled={resetLoading} className="w-full bg-primary text-black font-bold text-lg py-4 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50">
                {resetLoading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLogin;