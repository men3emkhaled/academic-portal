import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Briefcase, ExternalLink, CalendarDays, Clock, MapPin, FileText, Building2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import studentApi from '../services/studentApi';
import InternshipCard from '../components/InternshipCard';
import Sidebar from '../components/Sidebar';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const StudentInternships = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const [internships, setInternships] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [selectedInternship, setSelectedInternship] = useState(null);

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  useEffect(() => {
    fetchInternships();
    fetchTracks();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await studentApi.get('/internships');
      setInternships(res.data);
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      const res = await studentApi.get('/internships/tracks');
      setTracks(res.data);
    } catch { /* ignore */ }
  };

  const studentLevel = student?.level || 1;

  const filtered = useMemo(() => {
    return internships.filter(i => {
      if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.company_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (trackFilter && !i.tracks?.some(t => t.name === trackFilter)) return false;
      if (modeFilter && i.work_mode !== modeFilter) return false;
      return true;
    });
  }, [internships, search, trackFilter, modeFilter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white transition-colors duration-500" dir={isAr ? 'rtl' : 'ltr'}>
      <Sidebar onLogout={logout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col pb-28 md:pb-10">
        <div className="px-6 lg:px-10 pt-10 md:pt-16 pb-12 max-w-[1400px] mx-auto w-full space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('internships.title')}</h1>
            <p className="text-sm text-gray-400">{t('internships.subtitle')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('internships.search_placeholder')}
                className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl ps-9 pe-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute end-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <select
              value={trackFilter}
              onChange={e => setTrackFilter(e.target.value)}
              className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none"
            >
              <option value="">{t('internships.all_tracks')}</option>
              {tracks.map(track => (
                <option key={track.id} value={track.name}>{track.name}</option>
              ))}
            </select>
            <select
              value={modeFilter}
              onChange={e => setModeFilter(e.target.value)}
              className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none"
            >
              <option value="">{t('internships.all_modes')}</option>
              <option value="Online">{t('internships.online')}</option>
              <option value="Offline">{t('internships.offline')}</option>
              <option value="Online + Offline">{t('internships.online_offline')}</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white dark:bg-[#0e0e16] border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-white/10" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-16" />
                    <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-20" />
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-sm text-gray-400">{t('internships.no_results')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(internship => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  onViewDetails={setSelectedInternship}
                  isLocked={studentLevel < (internship.min_level || 1)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedInternship && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInternship(null)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative z-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/10">
                      {selectedInternship.company_logo_url ? (
                        <img src={selectedInternship.company_logo_url} alt={selectedInternship.company_name} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-7 h-7 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedInternship.title}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedInternship.company_name}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedInternship(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedInternship.status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      selectedInternship.status === 'Open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      selectedInternship.status === 'Closed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {t(`internships.status_${selectedInternship.status.toLowerCase()}`)}
                    </span>
                  )}
                  {studentLevel < (selectedInternship.min_level || 1) && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                      {t('internships.level_required', { level: selectedInternship.min_level })}
                    </span>
                  )}
                  {selectedInternship.tracks?.map(t => (
                    <span key={t.id} className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                      {t.name}
                    </span>
                  ))}
                  {selectedInternship.work_mode && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      selectedInternship.work_mode === 'Online' ? 'bg-violet-500/10 text-violet-500 border-violet-500/20' :
                      selectedInternship.work_mode === 'Offline' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {t(`internships.${selectedInternship.work_mode.toLowerCase().replace(/[\s\+]+/g, '_')}`)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {selectedInternship.duration && (
                    <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl p-3">
                      <Clock className="w-4 h-4 text-gray-400 mb-1" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('internships.duration')}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{selectedInternship.duration}</p>
                    </div>
                  )}
                  {selectedInternship.application_deadline && (
                    <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl p-3">
                      <CalendarDays className="w-4 h-4 text-gray-400 mb-1" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('internships.deadline')}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                        {new Date(selectedInternship.application_deadline).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {selectedInternship.work_mode && (
                    <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl p-3">
                      <MapPin className="w-4 h-4 text-gray-400 mb-1" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('internships.work_mode')}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{t(`internships.${selectedInternship.work_mode.toLowerCase().replace(/[\s\+]+/g, '_')}`)}</p>
                    </div>
                  )}
                </div>

                {selectedInternship.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {t('internships.description')}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{selectedInternship.description}</p>
                  </div>
                )}

                {selectedInternship.requirements && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {t('internships.requirements')}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{selectedInternship.requirements}</p>
                  </div>
                )}

                {selectedInternship.application_link && selectedInternship.status === 'Open' && (
                  <a
                    href={selectedInternship.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('internships.apply_now')}
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentInternships;
