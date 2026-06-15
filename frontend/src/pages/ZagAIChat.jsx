import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useStudentAuth } from '../context/StudentAuthContext';
import { Bot, Send, User, Loader2, Sparkles, Volume2, Copy, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';

const ZagAIChat = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: isAr
        ? 'مرحباً بك في Zag AI! أنا مساعدك الذكي. اسألني عن أي شيء يتعلق بالدراسة.'
        : 'Welcome to Zag AI! I\'m your intelligent assistant. Ask me anything about your studies.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await studentApi.post('/ai/chat', { message: text });
      const reply = res.data?.response || 'No response';
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: reply }]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to get response';
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: errorMsg, error: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success(isAr ? 'تم النسخ' : 'Copied');
    } catch {}
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isAr ? 'ar-SA' : 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 lg:px-10 pt-16 pb-8">
          
          {/* Page Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">Zag AI</span>
          </div>
          <h1 className={`text-[clamp(2rem,5vw,4rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white mb-2 ${isAr ? 'font-arabic' : ''}`}>
            Zag AI
          </h1>
          <p className="text-sm text-gray-400 dark:text-white/40 mb-10">
            {isAr ? 'مساعدك الذكي للدراسة' : 'Your intelligent study assistant'}
          </p>

          {/* Chat Container */}
          <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.05)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden flex-1">
            
            {/* Messages */}
            <div className="flex-1 p-6 lg:p-10 space-y-5 overflow-y-auto min-h-[400px] max-h-[600px] scrollbar-thin">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border ${
                      isUser
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}>
                      {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <div className={`group max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`px-6 py-4 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-emerald-500/10 text-gray-900 dark:text-white border border-emerald-500/20 rounded-[2rem] rounded-tr-md'
                          : msg.error
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-[2rem] rounded-tl-md'
                            : 'bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-[2rem] rounded-tl-md'
                      }`}>
                        {msg.text}
                      </div>
                      {!isUser && (
                        <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleSpeak(msg.text)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 px-6 py-4 rounded-[2rem] rounded-tl-md">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 dark:border-white/5 p-6 lg:p-8">
              <div className="flex gap-4 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isAr ? 'اكتب رسالتك...' : 'Type your message...'}
                    rows={1}
                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-[2rem] px-6 py-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 resize-none focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    style={{ minHeight: '52px', maxHeight: '120px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="flex-shrink-0 h-[52px] w-[52px] rounded-[1.5rem] bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:text-gray-300 dark:disabled:text-gray-600 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-1 h-1 rounded-full bg-emerald-400/50"></div>
                <p className="text-[10px] text-gray-400 dark:text-white/20 uppercase tracking-widest font-medium">
                  Zag AI — {isAr ? 'النموذج قيد التدريب' : 'Model is being trained'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ZagAIChat;
