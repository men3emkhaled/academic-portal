import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import { Send, Loader2, Sparkles, User, Volume2, Copy, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const ZagAIChat = () => {
  const { t, i18n } = useTranslation();
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
    <div className="min-h-screen bg-background text-foreground font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">

          <PageHeader
            title="Zag AI"
            description={isAr ? 'مساعدك الذكي للدراسة' : 'Your intelligent study assistant'}
            icon={Sparkles}
          />

          {/* Chat panel */}
          <div className="flex-1 flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto min-h-[400px] max-h-[600px] p-4 sm:p-5 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id} className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
                    <div
                      className={cn(
                        'shrink-0 size-9 rounded-lg border flex items-center justify-center',
                        isUser
                          ? 'bg-primary/10 border-primary/20 text-primary'
                          : msg.error
                            ? 'bg-destructive/10 border-destructive/20 text-destructive'
                            : 'bg-muted border-border text-muted-foreground'
                      )}
                    >
                      {isUser ? (
                        <User className="size-4" />
                      ) : msg.error ? (
                        <AlertCircle className="size-4" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                    </div>

                    <div className={cn('group max-w-[80%] flex flex-col', isUser ? 'items-end' : 'items-start')}>
                      <div
                        className={cn(
                          'px-4 py-2.5 text-sm leading-relaxed rounded-lg',
                          isUser
                            ? 'bg-primary/10 text-foreground border border-primary/20 rounded-se-sm'
                            : msg.error
                              ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-ss-sm'
                              : 'bg-muted text-foreground border border-border rounded-ss-sm'
                        )}
                      >
                        {msg.text}
                      </div>

                      {!isUser && !msg.error && (
                        <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleCopy(msg.text, msg.id)}
                            aria-label={isAr ? 'نسخ' : 'Copy'}
                            className="text-muted-foreground"
                          >
                            {copiedId === msg.id ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleSpeak(msg.text)}
                            aria-label={isAr ? 'استماع' : 'Speak'}
                            className="text-muted-foreground"
                          >
                            <Volume2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex gap-3">
                  <div className="shrink-0 size-9 rounded-lg border border-border bg-muted text-muted-foreground flex items-center justify-center">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="bg-muted border border-border px-4 py-3 rounded-lg rounded-ss-sm">
                    <div className="flex gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="border-t border-border p-3 sm:p-4">
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isAr ? 'اكتب رسالتك...' : 'Type your message...'}
                  rows={1}
                  className="flex-1 min-h-[40px] resize-none text-start"
                  style={{ maxHeight: '120px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                />
                <Button
                  size="icon-lg"
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  aria-label={isAr ? 'إرسال' : 'Send'}
                >
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </div>
              <p className="mt-2.5 text-center text-xs text-muted-foreground">
                Zag AI — {isAr ? 'النموذج قيد التدريب' : 'Model is being trained'}
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ZagAIChat;
