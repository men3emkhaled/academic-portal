import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useStudentAuth } from '../context/StudentAuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  Send, User, Sparkles, Volume2, Copy, Check,
  Square, RotateCcw, ChevronDown, Mic, StopCircle,
  Plus, MessageSquare, Download, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';

const STORAGE_KEY = 'zag-ai-conversations';
const MAX_SIDEBAR_CHATS = 50;

const loadConversations = () => {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; } catch { return []; }
};
const saveConversations = (convs) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(convs.slice(0, MAX_SIDEBAR_CHATS))); } catch {}
};

const genTitle = (msgs) => {
  const first = msgs.find(m => m.role === 'user')?.text || '';
  return first.length > 40 ? first.slice(0, 40) + '…' : first;
};

let speechRecognition = null;
try { speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; } catch {}

const highlightTheme = `
.hljs{display:block;overflow-x:auto;padding:1em;background:#1e1e2e;color:#cdd6f4;border-radius:12px;font-size:13px;line-height:1.6}
.hljs-keyword{color:#cba6f7}.hljs-string{color:#a6e3a1}.hljs-number{color:#fab387}.hljs-comment{color:#6c7086;font-style:italic}
.hljs-function{color:#89b4fa}.hljs-type{color:#f9e2af}.hljs-attr{color:#89dceb}.hljs-built_in{color:#f38ba8}
.hljs-title{color:#89b4fa}.hljs-params{color:#f2cdcd}.hljs-literal{color:#fab387}.hljs-meta{color:#f38ba8}
.hljs-tag{color:#89b4fa}.hljs-name{color:#89b4fa}.hljs-attribute{color:#a6e3a1}
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
  const [listening, setListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamContentRef = useRef('');

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingText]);
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
    setActiveChatId(id); setMessages([]); setInput('');
    setConversations(prev => {
      const updated = [{ id, title: 'New Chat', messages: [], updatedAt: Date.now() }, ...prev];
      saveConversations(updated); return updated;
    });
  };

  const switchChat = (id) => {
    const chat = conversations.find(c => c.id === id);
    if (chat) { setActiveChatId(id); setMessages(chat.messages); setInput(''); }
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

  const sendMessage = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || sending) return;
    if (!activeChatId) newChat();

    const userMsg = { id: Date.now().toString(), role: 'user', text, createdAt: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
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
          messages: updatedMessages.map(m => ({ role: m.role, content: m.text })),
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
        const finalMsgs = [...updatedMessages, { id: (Date.now() + 1).toString(), role: 'assistant', text: err.message || 'Failed', error: true, createdAt: Date.now() }];
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
    if (e.key === 'ArrowUp' && !input) {
      const lastUser = [...messages].reverse().find(m => m.role === 'user');
      if (lastUser) setInput(lastUser.text);
    }
  };

  const handleCopy = async (text, id) => {
    try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); toast.success(t('ai.copied')); } catch {}
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = isAr ? 'ar-SA' : 'en-US'; u.rate = 0.9;
      speechSynthesis.speak(u);
    }
  };

  const toggleVoice = () => {
    if (!speechRecognition) { toast.error(t('ai.speak_not_supported')); return; }
    if (listening) { setListening(false); return; }
    const r = new speechRecognition();
    r.lang = isAr ? 'ar' : 'en-US'; r.interimResults = false;
    r.onresult = (e) => { setInput(prev => prev + e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.start(); setListening(true);
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

  return (
    <div className="transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>

      <style>{highlightTheme}</style>
      <style>{`
        @keyframes ultraLightFade { from { opacity: 0.7; } to { opacity: 1; } }
        .chat-fade { animation: ultraLightFade 0.08s ease-out forwards; }
        @media (max-width: 767px) { .sidebar-offset { padding-inline-start: 0 !important; } }
      `}</style>

      <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans">

        {/* Background Decor */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full" />
        </div>

        <Sidebar onLogout={handleLogout} />

        <main className="md:ps-72 min-h-screen relative z-10 chat-fade">
          <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-10">

            {/* Hero */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">AI</span>
              </div>
              <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white">
                {t('ai.title')}
              </h1>
              <p className="text-sm text-gray-400 dark:text-white/40 mt-2">{t('ai.subtitle')}</p>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button onClick={newChat} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-700 dark:text-white/70 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-500">
                  <Plus className="w-4 h-4" />
                  {isAr ? 'محادثة جديدة' : 'New Chat'}
                </button>
                {/* Model badge - read only */}
                <div className="px-4 py-2.5 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-[#2cfc7d]/70 select-none">
                  qwen3-vl:4b
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-white/50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-500">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{conversations.length}</span>
                </button>
                {messages.length > 0 && (
                  <button onClick={exportChat} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-white/50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-500">
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isAr ? 'تحميل' : 'Export'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* History Panel */}
            {showHistory && (
              <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 space-y-1 max-h-64 overflow-y-auto shadow-sm">
                {conversations.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">{isAr ? 'لا توجد محادثات' : 'No conversations yet'}</p>
                )}
                {conversations.map(chat => (
                  <div key={chat.id} onClick={() => switchChat(chat.id)} className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${chat.id === activeChatId ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{chat.title}</span>
                    <button onClick={(e) => deleteChat(chat.id, e)} className="p-1 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Card */}
            <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col min-h-[500px]">

              {/* Messages */}
              <div className="flex-1 p-8 lg:p-10 space-y-5 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin">
                {messages.length === 0 && !sending && !streamingText && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 flex items-center justify-center mb-8 shadow-sm">
                      <Sparkles className="w-10 h-10 text-[#2cfc7d]" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white/80">{t('ai.title')}</h2>
                    <p className="text-sm text-gray-400 dark:text-white/30 max-w-md mt-2">{t('ai.subtitle')}</p>
                    <div className="flex flex-wrap gap-3 mt-10 justify-center">
                      {[t('ai.suggest_1'), t('ai.suggest_2'), t('ai.suggest_3')].map((q, i) => (
                        <button key={i} onClick={() => { setInput(q); inputRef.current?.focus(); }} className="px-6 py-3 rounded-[2rem] bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:-translate-y-1 hover:shadow-lg transition-all duration-500">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  const showThink = showThinking[msg.id];
                  return (
                    <div key={msg.id} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center border ${isUser ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40'}`}>
                        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[#2cfc7d]" />}
                      </div>
                      <div className={`group max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        {!isUser && msg.thinking && (
                          <button onClick={() => setShowThinking(p => ({ ...p, [msg.id]: !showThink }))} className="flex items-center gap-1 text-[10px] text-gray-400/50 hover:text-gray-300 mb-1.5 transition-colors">
                            <ChevronDown className={`w-3 h-3 transition-transform ${showThink ? 'rotate-180' : ''}`} />
                            {showThink ? t('ai.hide_reasoning') : t('ai.show_reasoning')}
                          </button>
                        )}
                        {!isUser && msg.thinking && showThink && (
                          <div className="text-xs text-gray-400/60 bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-2 font-mono leading-relaxed whitespace-pre-wrap w-full">
                            {msg.thinking}
                          </div>
                        )}
                        <div className={`px-6 py-4 text-sm leading-relaxed ${
                          isUser
                            ? 'bg-emerald-500/10 text-gray-900 dark:text-white border border-emerald-500/20 rounded-[2rem] rounded-tr-md'
                            : msg.error
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-[2rem] rounded-tl-md'
                              : 'bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-[2rem] rounded-tl-md'
                        }`}>
                          {isUser ? msg.text : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                        {!isUser && (
                          <div className="flex gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleCopy(msg.text, msg.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => handleSpeak(msg.text)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            {idx === messages.length - 1 && !msg.error && (
                              <button onClick={() => regenerate(idx)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {sending && streamingText && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#2cfc7d]" />
                    </div>
                    <div className="max-w-[85%] flex flex-col items-start">
                      {streamingThinking && (
                        <>
                          <button onClick={() => setShowStreamingThinking(p => !p)} className="flex items-center gap-1 text-[10px] text-gray-400/50 hover:text-gray-300 mb-1.5 transition-colors">
                            <ChevronDown className={`w-3 h-3 transition-transform ${showStreamingThinking ? 'rotate-180' : ''}`} />
                            {showStreamingThinking ? t('ai.hide_reasoning') : t('ai.show_reasoning')}
                          </button>
                          {showStreamingThinking && (
                            <div className="text-xs text-gray-400/60 bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-2 font-mono leading-relaxed whitespace-pre-wrap w-full">
                              {streamingThinking}
                            </div>
                          )}
                        </>
                      )}
                      <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 px-6 py-4 rounded-[2rem] rounded-tl-md w-full">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                            {streamingText}
                          </ReactMarkdown>
                        </div>
                        <span className="inline-block w-2 h-4 bg-[#2cfc7d]/70 ml-0.5 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {sending && !streamingText && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#2cfc7d]" />
                    </div>
                    <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 px-6 py-4 rounded-[2rem] rounded-tl-md">
                      <div className="flex gap-2">
                        <span className="w-2 h-2 bg-[#2cfc7d]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-[#2cfc7d]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-[#2cfc7d]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 dark:border-white/5 p-6 lg:p-8">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('ai.placeholder')}
                      rows={1}
                      disabled={sending}
                      className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-[2rem] px-6 py-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 resize-none focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all pr-14"
                      style={{ minHeight: '52px', maxHeight: '130px' }}
                      onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`; }}
                    />
                    {speechRecognition && (
                      <button onClick={toggleVoice} className={`absolute bottom-3 ${isAr ? 'left-3' : 'right-3'} p-2 rounded-xl transition-colors ${listening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        {listening ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {sending ? (
                    <button onClick={stopGeneration} className="flex-shrink-0 h-[52px] w-[52px] rounded-[1.5rem] bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 flex items-center justify-center transition-all active:scale-95">
                      <Square className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim()}
                      className="flex-shrink-0 h-[52px] w-[52px] rounded-[1.5rem] bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:text-gray-300 dark:disabled:text-gray-600 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-1 h-1 rounded-full bg-[#2cfc7d]/50" />
                  <p className="text-[9px] text-gray-400 dark:text-white/20 uppercase tracking-widest font-medium">{t('ai.press_enter')}</p>
                </div>
              </div>

            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ZagAIChat;
