import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Mail, Search, RefreshCw, AlertTriangle, User, ShieldCheck, 
  ChevronRight, Fingerprint, Sparkles, Activity, X, 
  CheckCircle2, Globe, Shield, CreditCard, Zap, Link as LinkIcon
} from 'lucide-react';

const LinkedEmailsManager = () => {
  const { t } = useTranslation();
  const [studentsWithEmail, setStudentsWithEmail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students');
      const filtered = res.data.filter(s => s.email && s.email.trim() !== '');
      setStudentsWithEmail(filtered);
    } catch (error) {
      toast.error('Failed to load linked accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const filteredStudents = studentsWithEmail.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-start">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <Mail className="w-8 h-8 text-primary dark:text-primary" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.emails.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.emails.description')}</p>
          </div>
        </div>
        
        <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">Identity Hub</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{studentsWithEmail.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.emails.active_emails', { count: '' })}</p>
          </div>
        </div>
      </div>

      {/* Actions & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder={t('admin.emails.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2rem] ps-16 pe-8 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner uppercase tracking-widest text-[11px]"
          />
        </div>
        
        <button 
          onClick={fetchEmails}
          disabled={loading}
          className="flex items-center justify-center gap-3 bg-white dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-black py-4.5 px-10 rounded-[2rem] shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.08] active:scale-95 transition-all whitespace-nowrap group"
        >
          <RefreshCw className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin text-primary' : ''}`} /> 
          <span className="uppercase tracking-widest text-xs">{t('admin.emails.refresh_button')}</span>
        </button>
      </div>

      <>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 opacity-50">
           <Activity className="w-16 h-16 text-primary animate-spin mb-8" />
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">{t('admin.emails.loading')}</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white/50 dark:bg-white/[0.01] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] py-48 text-center flex flex-col items-center group transition-all duration-500 shadow-sm">
            <div className="w-24 h-24 bg-primary/5 dark:bg-primary/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <AlertTriangle className="w-12 h-12 text-primary/30" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">{t('admin.emails.no_results')}</h4>
            <p className="text-[10px] font-black mt-4 uppercase tracking-widest text-gray-400">{t('admin.emails.no_results_hint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredStudents.map((student) => (
            <div 
              key={student.id} 
              className="group relative bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 text-start"
            >
                <div className="flex items-center gap-5 mb-8 relative z-10">
                  <div className="w-16 h-16 bg-primary/5 dark:bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 text-primary shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-700">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight group-hover:text-primary transition-colors uppercase truncate">{student.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
                        <span className="text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest whitespace-nowrap">{t('admin.emails.level', { num: student.level })}</span>
                        <div className="w-1 h-1 bg-gray-200 dark:bg-slate-800 rounded-full shrink-0"></div>
                        <span className="text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest whitespace-nowrap">{t('admin.emails.section', { num: student.section })}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <div className="flex items-center justify-between bg-gray-50/50 dark:bg-black/30 border border-gray-100 dark:border-white/5 px-6 py-4 rounded-2xl group-hover:border-primary/20 transition-all shadow-inner">
                      <div className="flex items-center gap-3">
                        <Fingerprint className="w-4 h-4 text-gray-400 dark:text-slate-700" />
                        <span className="text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">{t('admin.emails.student_id')}</span>
                      </div>
                      <span className="text-xs font-black text-gray-900 dark:text-white tracking-[0.2em]">{student.id}</span>
                   </div>
                   
                   <div className="flex items-center justify-between bg-primary/5 dark:bg-primary/[0.02] border border-primary/10 dark:border-white/5 px-6 py-4 rounded-2xl group-hover:border-primary/30 transition-all shadow-inner">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-primary" />
                        <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">{t('admin.emails.email_label')}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-primary/80 truncate max-w-[150px]">{student.email}</span>
                   </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(46,204,113,0.5)]"></div>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary dark:text-primary">{t('admin.emails.active_account')}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-slate-800 group-hover:text-primary group-hover:border-primary/30 group-hover:bg-white dark:group-hover:bg-white/5 transition-all shadow-sm">
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    </div>
                </div>

                {/* Subtle Identity Glyph */}
                <div className="absolute inset-inline-end-10 bottom-10 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 pointer-events-none">
                    <Fingerprint className="w-24 h-24 text-primary" />
                </div>
            </div>
          ))}
        </div>
      )}
      </>
    </div>
  );
};

export default LinkedEmailsManager;
