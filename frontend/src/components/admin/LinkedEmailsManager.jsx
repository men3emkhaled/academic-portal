import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Search, RefreshCw, AlertTriangle, User, ShieldCheck, ChevronRight, Fingerprint } from 'lucide-react';

const LinkedEmailsManager = () => {
  const [studentsWithEmail, setStudentsWithEmail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students');
      // Filter only students who have an email
      const filtered = res.data.filter(s => s.email && s.email.trim() !== '');
      setStudentsWithEmail(filtered);
    } catch (error) {
      toast.error('Failed to load linked emails');
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
    <div className="animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <Mail className="w-6 h-6 text-indigo-500 dark:text-indigo-400" /> Linked Accounts
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Identity & Authentication Mapping</p>
          </div>
        </div>
        <button 
          onClick={fetchEmails}
          disabled={loading}
          className="admin-btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Synchronize
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-10 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text"
          placeholder="Filter by name, identifier, or email matrix..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2rem] pl-16 pr-6 py-5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm dark:shadow-2xl"
        />
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="col-span-full py-20 text-center grayscale opacity-20 border border-gray-200 dark:border-white/5 border-dashed rounded-[2.5rem]">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">No identity mappings detected.</p>
          </div>
        ) : (
          filteredStudents.map(student => (
            <div key={student.id} className="group bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-500 shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{student.name}</h3>
                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">Level {student.level} • Section {student.section}</p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                   <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-4 py-3 rounded-2xl group-hover:border-indigo-500/20 transition-all">
                      <Fingerprint className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                      <span className="text-xs font-mono font-bold text-gray-600 dark:text-slate-300">{student.id}</span>
                   </div>
                   
                   <div className="flex items-center gap-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 px-4 py-3 rounded-2xl group-hover:border-emerald-500/30 transition-all">
                      <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 truncate">{student.email}</span>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Verified Identity</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-500 transition-all translate-x-0 group-hover:translate-x-1" />
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LinkedEmailsManager;
