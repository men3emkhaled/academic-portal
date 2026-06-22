import React, { useState, useEffect, useCallback } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { Users, Plus, X, Search, BookOpen, Mail, Phone, Key, Trash2, Loader2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DoctorTAManager = ({ courses }) => {
  const { t } = useTranslation();
  const { doctorApi } = useDoctorAuth();
  const [tas, setTAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTA, setNewTA] = useState({ name: '', email: '', password: '', phone: '' });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTA, setSelectedTA] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const fetchTAs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', '/doctor/my-tas');
      setTAs(res.data);
    } catch (err) {
      toast.error(t('doctor.ta.messages.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [doctorApi]);

  useEffect(() => { fetchTAs(); }, [fetchTAs]);

  const handleCreateTA = async (e) => {
    e.preventDefault();
    if (!newTA.name || !newTA.email || !newTA.password) {
      return toast.error(t('doctor.ta.messages.required_fields'));
    }
    setCreating(true);
    try {
      await doctorApi('post', '/doctor/tas', newTA);
      toast.success(t('doctor.ta.messages.created_success'));
      setShowCreateModal(false);
      setNewTA({ name: '', email: '', password: '', phone: '' });
      fetchTAs();
    } catch (err) {
      toast.error(err.response?.data?.message || t('doctor.ta.messages.create_failed'));
    } finally {
      setCreating(false);
    }
  };

  const handleAssignTA = async (courseId) => {
    if (!selectedTA) return;
    setAssigning(true);
    try {
      await doctorApi('post', `/doctor/tas/${selectedTA.id}/assign/${courseId}`);
      toast.success(t('doctor.ta.messages.assigned_success'));
      fetchTAs();
    } catch (err) {
      toast.error(err.response?.data?.message || t('doctor.ta.messages.assign_failed'));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveTA = async (taId, courseId) => {
    if (!window.confirm(t('doctor.ta.messages.remove_confirm'))) return;
    try {
      await doctorApi('delete', `/doctor/tas/${taId}/assign/${courseId}`);
      toast.success(t('doctor.ta.messages.removed_success'));
      fetchTAs();
    } catch (err) {
      toast.error(t('doctor.ta.messages.remove_failed'));
    }
  };

  const openAssignModal = (ta) => {
    setSelectedTA(ta);
    setShowAssignModal(true);
  };

  const taCourses = selectedTA
    ? (courses || []).filter(c => selectedTA.course_ids ? !selectedTA.course_ids.includes(c.id) : true)
    : [];

  const filteredTAs = tas.filter(ta =>
    ta.name?.toLowerCase().includes(search.toLowerCase()) ||
    ta.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#059669]" /> {t('doctor.ta.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
            {t('doctor.ta.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-[#059669]/20 active:scale-95 flex items-center gap-2 text-sm"
        >
          <UserPlus className="w-5 h-5" /> {t('doctor.ta.create_button')}
        </button>
      </div>

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-6">
        <div className="relative mb-6">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('doctor.ta.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 ps-12 pe-4 text-sm outline-none focus:border-[#059669]/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#059669] animate-spin" />
          </div>
        ) : filteredTAs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-500 font-medium">
              {search ? t('doctor.ta.empty_search') : t('doctor.ta.empty')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTAs.map((ta) => (
              <div key={ta.id} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-[#059669]/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#059669]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#059669]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{ta.name}</h4>
                      <p className="text-xs text-gray-400">{ta.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openAssignModal(ta)}
                    className="text-xs font-bold text-[#059669] hover:text-[#047857] bg-[#059669]/10 hover:bg-[#059669]/20 px-3 py-1.5 rounded-lg transition-all"
                  >
                    {t('doctor.ta.assign_course_button')}
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {ta.courses_count || 0} {t('doctor.ta.courses_label')}</span>
                  {ta.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {ta.phone}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('doctor.ta.modal.create_title')}</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTA} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ms-1">{t('doctor.ta.modal.name_label')}</label>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 mt-1">
                    <Users className="w-5 h-5 text-gray-400" />
                    <input type="text" value={newTA.name} onChange={(e) => setNewTA({ ...newTA, name: e.target.value })} placeholder={t('doctor.ta.modal.name_placeholder')} className="bg-transparent flex-1 outline-none text-gray-900 dark:text-white font-medium" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ms-1">{t('doctor.ta.modal.email_label')}</label>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 mt-1">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <input type="email" value={newTA.email} onChange={(e) => setNewTA({ ...newTA, email: e.target.value })} placeholder={t('doctor.ta.modal.email_placeholder')} className="bg-transparent flex-1 outline-none text-gray-900 dark:text-white font-medium" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ms-1">{t('doctor.ta.modal.password_label')}</label>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 mt-1">
                    <Key className="w-5 h-5 text-gray-400" />
                    <input type="password" value={newTA.password} onChange={(e) => setNewTA({ ...newTA, password: e.target.value })} placeholder={t('doctor.ta.modal.password_placeholder')} className="bg-transparent flex-1 outline-none text-gray-900 dark:text-white font-medium" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ms-1">{t('doctor.ta.modal.phone_label')}</label>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 mt-1">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <input type="text" value={newTA.phone} onChange={(e) => setNewTA({ ...newTA, phone: e.target.value })} placeholder={t('doctor.ta.modal.phone_placeholder')} className="bg-transparent flex-1 outline-none text-gray-900 dark:text-white font-medium" />
                  </div>
                </div>
                <button type="submit" disabled={creating} className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {t('doctor.ta.modal.create_account')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showAssignModal && selectedTA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowAssignModal(false); setSelectedTA(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {t('doctor.ta.assign_modal.title_prefix')} <span className="text-[#059669]">{selectedTA.name}</span>
                </h3>
                <button onClick={() => { setShowAssignModal(false); setSelectedTA(null); }} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {(!courses || courses.length === 0) ? (
                <p className="text-gray-400 text-center py-8">{t('doctor.ta.assign_modal.no_courses')}</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {courses.map((course) => {
                    const isAssigned = selectedTA.course_ids && selectedTA.course_ids.includes(course.id);
                    return (
                      <div key={course.id} className="flex items-center justify-between bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{course.name}</p>
                            <p className="text-xs text-gray-400">{course.code || ''}</p>
                          </div>
                        </div>
                        {isAssigned ? (
                          <button
                            onClick={() => handleRemoveTA(selectedTA.id, course.id)}
                            disabled={assigning}
                            className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> {t('doctor.ta.assign_modal.remove')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAssignTA(course.id)}
                            disabled={assigning}
                            className="text-xs font-bold text-[#059669] hover:text-[#047857] bg-[#059669]/10 hover:bg-[#059669]/20 px-3 py-1.5 rounded-lg transition-all"
                          >
                            {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('doctor.ta.assign_modal.assign')}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorTAManager;
