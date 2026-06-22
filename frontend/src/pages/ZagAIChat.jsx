import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useStudentAuth } from '../context/StudentAuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  Menu, Send, User, Sparkles, Copy, Check,
  Square, RotateCcw, ChevronDown,
  Plus, MessageSquare, Download, Loader2,
  Paperclip, X, Maximize2, BookOpen, GraduationCap, Calendar, HelpCircle, Bot, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';

const STORAGE_KEY = 'zag-ai-conversations';
const MAX_SIDEBAR_CHATS = 50;
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const loadConversations = () => {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; } catch { return []; }
};
const saveConversations = (convs) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(convs.slice(0, MAX_SIDEBAR_CHATS))); } catch { }
};

const genTitle = (msgs) => {
  const first = msgs.find(m => m.role === 'user')?.text || '';
  return first.length > 40 ? first.slice(0, 40) + '…' : first;
};

const highlightTheme = `
.hljs{display:block;overflow-x:auto;padding:1em;background:#1e1e2e;color:#cdd6f4;border-radius:12px;font-size:13px;line-height:1.6}
.hljs-keyword{color:#cba6f7}.hljs-string{color:#a6e3a1}.hljs-number{color:#fab387}.hljs-comment{color:#6c7086;font-style:italic}
.hljs-function{color:#89b4fa}.hljs-type{color:#f9e2af}.hljs-attr{color:#89dceb}.hljs-built_in{color:#f38ba8}
.hljs-title{color:#89b4fa}.hljs-params{color:#f2cdcd}.hljs-literal{color:#fab387}.hljs-meta{color:#f38ba8}
.hljs-tag{color:#89b4fa}.hljs-name{color:#89b4fa}.hljs-attribute{color:#a6e3a1}
`;

const uiTheme = `
  @keyframes msg-in {
    from { opacity: 0; transform: translateY(10px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .msg-bubble {
    animation: msg-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .skeleton-line {
    background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.07) 50%, rgba(0,0,0,0.04) 75%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 8px;
  }
  .dark .skeleton-line {
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite;
  }
  .textarea-smooth {
    transition: height 0.15s ease;
  }
  .send-btn-active:active {
    transform: scale(0.88);
    opacity: 0.75;
    transition: transform 0.08s ease, opacity 0.08s ease;
  }
  .conv-item {
    transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
  }
  .conv-item:not(.active):hover {
    box-shadow: inset 0 0 0 1px rgba(16,185,129,0.08);
  }
  .input-dock-wrap:focus-within {
    box-shadow: 0 0 0 3px rgba(16,185,129,0.08), 0 20px 50px rgba(0,0,0,0.04);
    border-color: rgba(16,185,129,0.35) !important;
    transition: box-shadow 0.25s ease, border-color 0.25s ease;
  }
`;

const splitStreamTokens = (buffer) => {
  const events = [];
  const lines = buffer.split('\n');
  let leftover = '';
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('data: ')) {
      try { events.push(JSON.parse(t.slice(6))); } catch { leftover += t + '\n'; }
    }
  }
  return { events, leftover };
};

const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ZagAIChat = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const [conversations, setConversations] = useState(loadConversations);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingThinking, setStreamingThinking] = useState('');
  const [showStreamingThinking, setShowStreamingThinking] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [showThinking, setShowThinking] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [zoomImage, setZoomImage] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem('zag-sidebar-open') !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handleToggle = () => {
      try {
        setIsSidebarOpen(localStorage.getItem('zag-sidebar-open') !== 'false');
      } catch {}
    };
    window.addEventListener('zag-sidebar-toggle', handleToggle);
    return () => window.removeEventListener('zag-sidebar-toggle', handleToggle);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const isOpen = window.visualViewport.height < window.innerHeight * 0.85;
        setIsKeyboardVisible(isOpen);
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  const hideBottomBar = isInputFocused || isKeyboardVisible;

  useEffect(() => {
    if (hideBottomBar) {
      document.body.classList.add('keyboard-open');
    } else {
      document.body.classList.remove('keyboard-open');
    }
    return () => document.body.classList.remove('keyboard-open');
  }, [hideBottomBar]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamContentRef = useRef('');

  useEffect(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages, streamingText]);
  useEffect(() => { inputRef.current?.focus(); }, [activeChatId]);

  useEffect(() => {
    if (activeChatId) {
      const chat = conversations.find(c => c.id === activeChatId);
      if (chat) setMessages(chat.messages);
    } else if (conversations.length > 0) {
      setActiveChatId(conversations[0].id);
    }
  }, []);


  const persist = useCallback((chatId, msgs) => {
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === chatId);
      const updated = [...prev];
      updated[idx >= 0 ? idx : updated.length] = {
        id: chatId, title: genTitle(msgs), messages: msgs, updatedAt: Date.now()
      };
      if (idx < 0) updated.unshift(updated.pop());
      saveConversations(updated);
      return updated;
    });
  }, []);

  const newChat = () => {
    const id = Date.now().toString();
    setActiveChatId(id); setMessages([]); setInput(''); setSelectedImages([]);
    setConversations(prev => {
      const updated = [{ id, title: 'New Chat', messages: [], updatedAt: Date.now() }, ...prev];
      saveConversations(updated); return updated;
    });
  };

  const switchChat = (id) => {
    const chat = conversations.find(c => c.id === id);
    if (chat) { setActiveChatId(id); setMessages(chat.messages); setInput(''); setSelectedImages([]); }
    setShowHistory(false);
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveConversations(updated); return updated;
    });
    if (activeChatId === id) { setActiveChatId(null); setMessages([]); }
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - selectedImages.length;
    if (files.length > remaining) {
      toast.error(t('ai.max_images', { count: MAX_IMAGES }));
      return;
    }
    for (const file of files) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        toast.error(t('ai.allowed_formats'));
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(t('ai.image_size_limit'));
        continue;
      }
      try {
        const dataUrl = await readFileAsDataURL(file);
        setSelectedImages(prev => [...prev, { id: Date.now().toString() + Math.random(), dataUrl, file }]);
      } catch {
        toast.error(t('ai.image_read_failed'));
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const buildMultimodalContent = (text, images) => {
    const parts = [];
    if (text.trim()) parts.push({ type: 'text', text: text.trim() });
    for (const img of images) {
      parts.push({ type: 'image_url', image_url: { url: img.dataUrl } });
    }
    return parts;
  };

  const handleSuggestClick = (text) => {
    inputRef.current?.focus();
    let currentText = '';
    let index = 0;
    const speed = Math.max(8, Math.floor(120 / text.length));
    setInput('');
    const timer = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        setInput(currentText);
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 130)}px`;
        }
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);
  };

  const sendMessage = async (textOverride) => {
    const text = (textOverride || input).trim();
    if ((!text && selectedImages.length === 0) || sending) return;
    if (!activeChatId) newChat();

    const hasImages = selectedImages.length > 0;
    const content = hasImages ? buildMultimodalContent(text, selectedImages) : text;

    const userMsg = { id: Date.now().toString(), role: 'user', text, images: hasImages ? selectedImages.map(i => i.dataUrl) : undefined, createdAt: Date.now() };
    const updatedMessages = [...messages, userMsg];
    // Optimistic update — message appears instantly
    setMessages(updatedMessages);
    setInput('');
    setSelectedImages([]);
    // Reset textarea height smoothly
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }
    setSending(true);
    setStreamingText('');
    setStreamingThinking('');
    setShowStreamingThinking(false);
    streamContentRef.current = '';

    const ac = new AbortController();
    setAbortController(ac);
    const chatId = activeChatId || (Date.now()).toString();

    try {
      const token = (() => { try { return localStorage.getItem('studentToken'); } catch { return null; } })();
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.images && m.images.length > 0
              ? [{ type: 'text', text: m.text || '' }, ...m.images.map(url => ({ type: 'image_url', image_url: { url } }))]
              : m.text
          })),
        }),
        signal: ac.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const { events, leftover } = splitStreamTokens(buf);
        buf = leftover;
        for (const evt of events) {
          if (evt.thinking) { setStreamingThinking(prev => prev + evt.thinking); }
          if (evt.token) { streamContentRef.current += evt.token; setStreamingText(streamContentRef.current); }
          if (evt.done) {
            const assistantMsg = { id: (Date.now() + 1).toString(), role: 'assistant', text: evt.response, thinking: evt.thinking || '', createdAt: Date.now() };
            const finalMsgs = [...updatedMessages, assistantMsg];
            setMessages(finalMsgs);
            setStreamingText(''); setStreamingThinking(''); streamContentRef.current = '';
            if (chatId) persist(chatId, finalMsgs);
          }
          if (evt.error) throw new Error(evt.error);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        const partial = streamContentRef.current.trim();
        if (partial) {
          const m = { id: (Date.now() + 1).toString(), role: 'assistant', text: partial + '\n\n_Stopped_', thinking: '', createdAt: Date.now() };
          const finalMsgs = [...updatedMessages, m];
          setMessages(finalMsgs);
          if (chatId) persist(chatId, finalMsgs);
        }
      } else {
        const isOffline = err.message === 'Failed to fetch' || err.message?.includes('NetworkError') || err.message?.includes('Network request failed') || err.message?.includes('load failed');
        const errorText = isOffline
          ? (isAr ? 'الموديل لسا تحت التدريب' : 'The model is still under training')
          : (err.message || 'Failed');
        const finalMsgs = [...updatedMessages, { id: (Date.now() + 1).toString(), role: 'assistant', text: errorText, error: true, createdAt: Date.now() }];
        setMessages(finalMsgs);
        if (chatId) persist(chatId, finalMsgs);
      }
    } finally {
      setSending(false); setStreamingText(''); setStreamingThinking(''); setAbortController(null); streamContentRef.current = '';
    }
  };

  const stopGeneration = () => abortController?.abort();

  const regenerate = (idx) => {
    const msgsUpTo = messages.slice(0, idx);
    setMessages(msgsUpTo);
    const lastUser = [...msgsUpTo].reverse().find(m => m.role === 'user');
    if (lastUser) sendMessage(lastUser.text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'ArrowUp' && !input && selectedImages.length === 0) {
      const lastUser = [...messages].reverse().find(m => m.role === 'user');
      if (lastUser) setInput(lastUser.text);
    }
  };

  const handleCopy = async (text, id) => {
    try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); toast.success(t('ai.copied')); } catch { }
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = isAr ? 'ar-SA' : 'en-US'; u.rate = 0.9;
      speechSynthesis.speak(u);
    }
  };

  const exportChat = () => {
    const md = messages.map(m => {
      let body = m.text;
      if (m.thinking) body = `_${m.thinking}_\n\n${body}`;
      return `### **${m.role === 'user' ? 'You' : 'Zag AI'}**\n${body}\n`;
    }).join('---\n');
    const blob = new Blob([`# Zag AI Chat\n\n${md}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `zag-ai-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('ai.exported'));
  };

  const handleLogout = () => { logout(); navigate('/student/login'); };
  const canSend = input.trim().length > 0 || selectedImages.length > 0;
  const isEmptyChat = activeChatId ? messages.length === 0 : true;

  const suggestions = [
    { text: t('ai.suggest_1'), icon: BookOpen, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20', desc: isAr ? 'تصفح المقررات الدراسية المتاحة' : 'Explore active courses' },
    { text: t('ai.suggest_2'), icon: GraduationCap, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', desc: isAr ? 'احسب المعدل التراكمي الخاص بك' : 'Calculate your GPA value' },
    { text: t('ai.suggest_3'), icon: Calendar, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', desc: isAr ? 'اطلع على مواعيد الاختبارات الرسمية' : 'View official exam timetable' }
  ];

  return (
    <div className="transition-colors duration-500" dir={isAr ? 'rtl' : 'ltr'}>

      <style>{highlightTheme}</style>
      <style>{uiTheme}</style>
      <style>{`
        .image-preview-scroll::-webkit-scrollbar { height: 4px; }
        .image-preview-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body.keyboard-open .fixed.bottom-0 {
          display: none !important;
        }
        .chat-scroll-area {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        @media (min-width: 1024px) {
          .zag-content-area {
            padding-inline-start: ${isSidebarOpen ? '39.5rem' : '21rem'} !important;
            transition: padding 500ms cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
      `}</style>

      <div className="h-screen h-[100dvh] w-screen overflow-hidden bg-slate-50 dark:bg-[#07070c] text-gray-900 dark:text-white font-sans flex" style={{ touchAction: 'none' }}>

        <Sidebar onLogout={handleLogout} />

        {/* Content wrapper — dynamic padding handles the floating sidebar offsets */}
        <div className="h-full flex-1 flex flex-col zag-content-area relative transition-all duration-500">
          
          {/* Subtle background glow effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />

          {/* ── Mobile / Tablet top bar (< lg) ── */}
          <div className="lg:hidden flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#0d0d14]/80 backdrop-blur-md z-10">
            <button onClick={() => setShowHistory(p => !p)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-gray-900 dark:text-white uppercase">{t('ai.title')}</span>
            </div>
            <div className="ms-auto flex items-center gap-1.5">
              <button
                onClick={newChat}
                disabled={isEmptyChat}
                className={`p-2 rounded-xl transition-colors ${isEmptyChat ? 'opacity-20 pointer-events-none cursor-not-allowed text-gray-300 dark:text-gray-700' : 'text-gray-950 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
                title={t('ai.new_chat')}
              >
                <Plus className="w-5 h-5" />
              </button>
              {messages.length > 0 && (
                <button onClick={exportChat} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" title={t('ai.export')}>
                  <Download className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* ── Desktop secondary sidebar (≥ lg) ── */}
          <aside className="hidden lg:flex lg:flex-col w-72 fixed z-40 bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/10 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.05)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] transition-all duration-500 overflow-hidden"
                 style={{
                   insetInlineStart: isSidebarOpen ? '20.5rem' : '-20rem',
                   top: '1rem',
                   bottom: '1rem',
                   opacity: isSidebarOpen ? 1 : 0,
                   pointerEvents: isSidebarOpen ? 'auto' : 'none'
                 }}>
            
            {/* Secondary Sidebar Header (matching main sidebar style) */}
            <div className="p-8 pb-4 text-center border-b border-gray-100 dark:border-white/5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full overflow-hidden shadow-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xs font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white opacity-40 mt-3">Zag AI</h1>
              <p className="text-[9px] text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] font-black mt-1">qwen3-vl:4b</p>
            </div>

            {/* Actions */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex gap-2">
              <button
                onClick={newChat}
                disabled={isEmptyChat}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 text-white ${isEmptyChat ? 'opacity-20 pointer-events-none cursor-not-allowed bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600' : 'hover:scale-[1.02] shadow-lg shadow-emerald-500/10'}`}
              >
                {t('ai.new_chat')}
              </button>
              {messages.length > 0 && (
                <button onClick={exportChat} className="flex items-center justify-center px-3 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300">
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Chat list (matching main sidebar navigation items style) */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-1.5 hidden-scrollbar">
              {conversations.length === 0 && (
                <div className="space-y-3 pt-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl">
                      <div className="skeleton-line w-4 h-4 flex-shrink-0 rounded-full" />
                      <div className="skeleton-line flex-1 h-2.5" style={{ width: `${60 + i * 15}%` }} />
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-300 dark:text-white/15 text-center pt-4 italic">{t('ai.no_conversations')}</p>
                </div>
              )}
              {conversations.map(chat => {
                const isActive = chat.id === activeChatId;
                return (
                  <div key={chat.id} onClick={() => switchChat(chat.id)} className={`conv-item relative group/item flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer ${isActive ? 'active text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                    {isActive && (
                      <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-2xl" />
                    )}
                    <MessageSquare className={`relative z-10 w-4 h-4 flex-shrink-0 transition-all duration-200 ${isActive ? 'scale-110 text-primary' : 'group-hover/item:scale-110'}`} />
                    <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] truncate">{chat.title}</span>
                    {isActive && (
                      <div className="absolute start-0 w-1 h-6 bg-primary rounded-full shadow-[4px_0_15px_rgba(46,204,113,0.5)]" />
                    )}
                    <button onClick={(e) => deleteChat(chat.id, e)} className="relative z-20 ms-auto p-1 rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* ── Main chat panel ── */}
          <main className="flex-1 flex flex-col min-h-0 relative bg-transparent">

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 lg:p-8 space-y-6 pb-6 custom-scrollbar chat-scroll-area" onClick={() => inputRef.current?.blur()} onTouchEnd={() => inputRef.current?.blur()}>

              {/* Empty state */}
              {messages.length === 0 && !sending && !streamingText && (
                <div className="flex flex-col items-center justify-center text-center min-h-[60vh] max-w-xl mx-auto w-full px-4">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 mb-6">
                    <Bot className="w-8 h-8" />
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tight text-gray-950 dark:text-white mb-2">Zag AI</h2>
                  <p className="text-sm text-gray-500 dark:text-white/40 font-medium">How can I help you today?</p>
                </div>
              )}

              {/* Chat bubbles */}
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const showThink = showThinking[msg.id];
                return (
                  <div key={msg.id} className={`msg-bubble flex gap-4 max-w-3xl mx-auto w-full ${isUser ? 'flex-row-reverse' : ''}`} style={{ animationDelay: `${Math.min(idx * 30, 200)}ms` }}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all overflow-hidden ${isUser ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white dark:bg-[#0c0c14] border-gray-150 dark:border-white/5 text-emerald-500 shadow-sm'}`}>
                      {isUser ? (
                        student?.avatar_url ? (
                          <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4.5 h-4.5" />
                        )
                      ) : (
                        <Bot className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <div className={`group max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      
                      {/* Thinking process for AI */}
                      {!isUser && msg.thinking && (
                        <button onClick={() => setShowThinking(p => ({ ...p, [msg.id]: !showThink }))} className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-white/30 hover:text-emerald-500 mb-1.5 transition-all font-bold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                          <span>{showThink ? t('ai.hide_reasoning') : t('ai.show_reasoning')}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showThink ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                      {!isUser && msg.thinking && showThink && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400/80 border-s-2 border-emerald-500/30 pl-4 py-1.5 mb-3 font-mono leading-relaxed whitespace-pre-wrap w-full max-w-full">
                          {msg.thinking}
                        </div>
                      )}

                      {/* Bubble box */}
                      <div className={`overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-none ${isUser
                        ? 'bg-emerald-50/70 dark:bg-emerald-500/5 text-emerald-950 dark:text-emerald-300 border border-emerald-500/10 dark:border-emerald-500/10 rounded-[1.75rem] rounded-tr-none'
                        : msg.error
                          ? 'bg-red-50/70 dark:bg-red-500/5 text-red-950 dark:text-red-300 border border-red-500/10 rounded-[1.75rem] rounded-tl-none'
                          : 'bg-white dark:bg-[#0c0c14] text-gray-900 dark:text-gray-100 border border-gray-150 dark:border-white/5 rounded-[1.75rem] rounded-tl-none'
                        }`}>
                        {isUser && msg.images && msg.images.length > 0 && (
                          <div className={`grid gap-2 p-2 ${msg.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {msg.images.map((url, i) => (
                              <button key={i} onClick={() => setZoomImage(url)} className="group/img relative overflow-hidden rounded-xl aspect-square">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                                  <Maximize2 className="w-5 h-5 text-white/0 group-hover/img:text-white/80 transition-all" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {isUser && msg.text && (
                          <div className="px-6 py-4 text-sm leading-relaxed font-medium">
                            {msg.text}
                          </div>
                        )}
                        {!isUser && (
                          <div className="px-6 py-4 text-sm leading-relaxed">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      {!isUser && (
                        <div className="flex gap-1 mt-1.5">
                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${copiedId === msg.id ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            title={t('ai.copy')}
                          >
                            {copiedId === msg.id
                              ? <Check className="w-3.5 h-3.5" />
                              : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          {idx === messages.length - 1 && !msg.error && (
                            <button onClick={() => regenerate(idx)} className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200" title="Regenerate">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming with content */}
              {sending && streamingText && (
                <div className="flex gap-4 max-w-3xl mx-auto w-full">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-[#0c0c14] border border-gray-150 dark:border-white/5 flex items-center justify-center text-emerald-500 shadow-sm overflow-hidden">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="max-w-[85%] flex flex-col items-start">
                    {streamingThinking && (
                      <>
                        <button onClick={() => setShowStreamingThinking(p => !p)} className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-white/30 hover:text-emerald-500 mb-1.5 transition-all font-bold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                          <span>{showStreamingThinking ? t('ai.hide_reasoning') : t('ai.show_reasoning')}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showStreamingThinking ? 'rotate-180' : ''}`} />
                        </button>
                        {showStreamingThinking && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400/80 border-s-2 border-emerald-500/30 pl-4 py-1.5 mb-3 font-mono leading-relaxed whitespace-pre-wrap w-full max-w-full">
                            {streamingThinking}
                          </div>
                        )}
                      </>
                    )}
                    <div className="bg-white dark:bg-[#0c0c14] text-gray-900 dark:text-gray-100 border border-gray-150 dark:border-white/5 px-6 py-4 rounded-[1.75rem] rounded-tl-none w-full shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-none">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                          {streamingText}
                        </ReactMarkdown>
                      </div>
                      <span className="inline-block w-2 h-4 bg-emerald-500/70 ml-0.5 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Thinking indicator (no content yet) */}
              {sending && !streamingText && (
                <div className="flex gap-4 max-w-3xl mx-auto w-full">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-[#0c0c14] border border-gray-150 dark:border-white/5 flex items-center justify-center text-emerald-500 shadow-sm overflow-hidden">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    {streamingThinking && (
                      <>
                        <button onClick={() => setShowStreamingThinking(p => !p)} className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-white/30 hover:text-emerald-500 transition-all font-bold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                          <span>{showStreamingThinking ? t('ai.hide_reasoning') : t('ai.show_reasoning')}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showStreamingThinking ? 'rotate-180' : ''}`} />
                        </button>
                        {showStreamingThinking && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400/80 border-s-2 border-emerald-500/30 pl-4 py-1.5 font-mono leading-relaxed whitespace-pre-wrap w-full max-w-full">
                            {streamingThinking}
                          </div>
                        )}
                      </>
                    )}
                    <div className="bg-white dark:bg-[#0c0c14] border border-gray-150 dark:border-white/5 px-5 py-3.5 rounded-[1.5rem] rounded-tl-none shadow-sm">
                      <div className="flex gap-1.5 items-center justify-center py-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Image preview chips */}
            {selectedImages.length > 0 && (
              <div className="flex-shrink-0 px-4 max-w-3xl mx-auto w-full pt-2">
                <div className="flex items-center gap-2 overflow-x-auto image-preview-scroll pb-2">
                  {selectedImages.map((img) => (
                    <div key={img.id} className="relative flex-shrink-0 group/preview">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]">
                        <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg opacity-0 group-hover/preview:opacity-100 transition-opacity hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <span className="text-[10px] text-gray-450 dark:text-white/30 font-bold whitespace-nowrap px-1">
                    {selectedImages.length}/{MAX_IMAGES}
                  </span>
                </div>
              </div>
            )}

            {/* Input dock */}
            <div className={`flex-shrink-0 border-t border-gray-150 dark:border-white/5 bg-transparent p-4 transition-all duration-300 ${hideBottomBar ? 'pb-4' : 'pb-24'} md:pb-6 max-w-3xl mx-auto w-full`}>
              <div className="input-dock-wrap relative flex gap-2 items-end bg-white dark:bg-[#0c0c14] border border-gray-250/60 dark:border-white/10 rounded-[2.25rem] p-3 pl-4 pr-3 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-300">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending || selectedImages.length >= MAX_IMAGES}
                  className="flex-shrink-0 p-2.5 rounded-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all disabled:opacity-30 self-center"
                >
                  <Paperclip className="w-[18px] h-[18px]" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={t('ai.placeholder')}
                  rows={1}
                  disabled={sending}
                  className="textarea-smooth flex-1 bg-transparent py-2.5 text-sm text-[16px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 resize-none focus:outline-none leading-relaxed"
                  style={{ minHeight: '36px', maxHeight: '130px' }}
                  onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`; }}
                />
                {sending ? (
                  <button onClick={stopGeneration} className="send-btn-active flex-shrink-0 h-[42px] w-[42px] rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 flex items-center justify-center transition-all self-center">
                    <Square className="w-3 h-3 fill-red-500" />
                  </button>
                ) : (
                  <button
                    onClick={() => sendMessage()}
                    disabled={!canSend}
                    className="send-btn-active flex-shrink-0 h-[42px] w-[42px] rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 hover:opacity-95 disabled:from-gray-100 disabled:to-gray-100 dark:disabled:from-white/5 dark:disabled:to-white/5 disabled:text-gray-400 dark:disabled:text-gray-600 text-white flex items-center justify-center transition-all shadow-md shadow-emerald-500/10 self-center"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </main>
        </div>

        {/* ── Mobile drawer overlay (< lg) ── */}
        <AnimatePresence>
          {showHistory && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowHistory(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="relative w-[280px] bg-white/90 dark:bg-[#0d0d14]/90 backdrop-blur-md h-full shadow-2xl border-e border-gray-100 dark:border-white/5 flex flex-col"
              >
                <div className="flex-shrink-0 p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <span className="font-black text-base text-gray-900 dark:text-white">{t('ai.title')}</span>
                  <button onClick={() => setShowHistory(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-shrink-0 p-3 flex gap-2">
                  <button
                    onClick={() => { newChat(); setShowHistory(false); }}
                    disabled={isEmptyChat}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#10b981] dark:bg-[#2cfc7d] rounded-xl text-[10px] font-black uppercase tracking-[0.15em] ${isEmptyChat ? 'opacity-20 pointer-events-none cursor-not-allowed bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600' : 'text-white dark:text-black'}`}
                  >
                    {t('ai.new_chat')}
                  </button>
                  {messages.length > 0 && (
                    <button onClick={() => { exportChat(); setShowHistory(false); }} className="flex items-center justify-center px-3 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em]">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-0.5">
                  {conversations.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-8">{t('ai.no_conversations')}</p>
                  )}
                  {conversations.map(chat => (
                    <div key={chat.id} onClick={() => switchChat(chat.id)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${chat.id === activeChatId
                      ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}>
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1 text-xs truncate">{chat.title}</span>
                      <button onClick={(e) => deleteChat(chat.id, e)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Image zoom modal */}
        {zoomImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setZoomImage(null)}>
            <button onClick={() => setZoomImage(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <img src={zoomImage} alt="" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        )}

      </div>
    </div>
  );
};

export default ZagAIChat;
