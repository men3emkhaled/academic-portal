import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Mail, Search, RefreshCw, AlertTriangle, User, ShieldCheck, 
  ChevronRight, Fingerprint, Sparkles, Activity, X, 
  CheckCircle2, Globe, Shield, CreditCard
} from 'lucide-react';

const LinkedEmailsManager = () => {
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
    <div className="animate-in fade-in duration-700 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-3xl flex items-center justify-center border border-indigo-500/20 shadow-inner group">
            <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
              Linked Accounts
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Student Identity Mapping</span>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">{studentsWithEmail.length} Verified Emails</span>
            </div>
          </div>
        </div>

        <button 
          onClick={fetchEmails}
          disabled={loading}
          className="px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Registry
        </button>
      </div>

      {/* Search Interface */}
      <div className="relative mb-12 group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <div className="w-px h-4 bg-gray-200 dark:bg-white/10 group-focus-within:bg-indigo-500/50 transition-colors"></div>
        </div>
        <input 
          type="text"
          placeholder="Filter by name, student ID, or email address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[2rem] pl-20 pr-8 py-5 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 opacity-50">
           <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
           <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Syncing Identity Data...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white/50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] py-48 text-center flex flex-col items-center group transition-all duration-500 shadow-sm">
            <div className="w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <AlertTriangle className="w-12 h-12 text-indigo-400 opacity-50" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">Zero Results Detected</h4>
            <p className="text-sm font-bold mt-4 tracking-widest text-gray-500">No linked student accounts match your current search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredStudents.map(student => (
            <div 
              key={student.id} 
              className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/5"
            >
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Level {student.level}</span>
                        <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Section {student.section}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 px-6 py-4 rounded-2xl group-hover:border-indigo-500/20 transition-all">
                      <div className="flex items-center gap-3">
                        <Fingerprint className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student ID</span>
                      </div>
                      <span className="text-xs font-mono font-black text-gray-900 dark:text-white tracking-widest">{student.id}</span>
                   </div>
                   
                   <div className="flex items-center justify-between bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 px-6 py-4 rounded-2xl group-hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest">Email</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 truncate max-w-[140px]">{student.email}</span>
                   </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Active Account</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-gray-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkedEmailsManager;
