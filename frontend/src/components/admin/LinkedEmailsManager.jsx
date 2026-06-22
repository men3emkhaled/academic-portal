import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Mail, Search, RefreshCw, User, Fingerprint } from 'lucide-react';

const LinkedEmailsManager = () => {
  const { t } = useTranslation();
  const [studentsWithEmail, setStudentsWithEmail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students');
      const students = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const filtered = students.filter(s => s.email && s.email.trim() !== '');
      setStudentsWithEmail(filtered);
    } catch (error) { toast.error(t('admin.emails.load_failed')); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmails(); }, []);

  const filteredStudents = studentsWithEmail.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.emails.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.emails.description')}</p>
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.emails.search_placeholder')}
            className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none" />
        </div>
        <button onClick={fetchEmails} disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />{t('admin.emails.refresh_button')}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-sm text-gray-400">{t('admin.emails.loading')}</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <p className="font-medium">{t('admin.emails.no_results')}</p>
          <p className="text-xs mt-1">{t('admin.emails.no_results_hint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-[#059669]/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{student.name}</h3>
                  <p className="text-xs text-gray-400">{t('admin.emails.level', { num: student.level })} • {t('admin.emails.section', { num: student.section })}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5" />{t('admin.emails.student_id')}</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{student.id}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#059669]/5 border border-[#059669]/10 rounded-lg">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#059669]" />{t('admin.emails.email_label')}</span>
                  <span className="text-xs font-medium text-[#059669] truncate max-w-[180px]">{student.email}</span>
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
