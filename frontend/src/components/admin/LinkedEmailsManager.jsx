import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Search, RefreshCw, AlertTriangle, User } from 'lucide-react';

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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Mail className="w-6 h-6 text-emerald-400" /> Linked Emails
          </h2>
          <p className="text-slate-400 text-sm mt-1">Students who have linked their Google accounts for SSO</p>
        </div>
        <button 
          onClick={fetchEmails}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
        <input 
          type="text"
          placeholder="Search by name, ID, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
        />
      </div>

      {/* List */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-20">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <AlertTriangle className="w-10 h-10 mb-3 text-slate-600" />
            <p className="font-bold">No linked emails found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredStudents.map(student => (
              <div key={student.id} className="p-6 hover:bg-white/[0.02] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <User className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{student.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="bg-white/5 text-slate-300 px-2 py-0.5 rounded text-xs font-mono">{student.id}</span>
                      <span className="text-slate-500 text-xs font-bold uppercase">Level {student.level}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-mono text-sm">{student.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedEmailsManager;
