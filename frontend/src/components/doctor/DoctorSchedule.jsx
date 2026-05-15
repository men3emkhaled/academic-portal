import React, { useState, useMemo, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Plus, Edit3, Trash2,
  ChevronLeft, ChevronRight, X, Save, Layers, Building2,
  Layout, Zap, BarChart3, Microscope, BookOpen, Map, GraduationCap
} from 'lucide-react';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DoctorSchedule = ({ timetable, onRefresh, courses }) => {
  const { t } = useTranslation();
  const { doctorApi } = useDoctorAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterDept, setFilterDept] = useState('all');
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    course_name: '',
    section: '',
    day_of_week: 'Saturday',
    start_time: '08:00',
    end_time: '09:30',
    location: '',
    type: 'Lecture',
    department_id: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await doctorApi('get', '/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error(t('doctor.timetable.messages.failed'));
    }
  };

  const groupedSchedule = useMemo(() => {
    const grouped = {};
    DAYS.forEach(day => {
      grouped[day] = (timetable || []).filter(item => {
        const isDayMatch = item.day_of_week === day;
        const isDeptMatch = filterDept === 'all' || item.department_id?.toString() === filterDept;
        return isDayMatch && isDeptMatch;
      });
    });
    return grouped;
  }, [timetable, filterDept]);

  const handleOpenModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        course_name: entry.course_name,
        section: entry.section,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time.slice(0, 5),
        end_time: entry.end_time.slice(0, 5),
        location: entry.location,
        type: entry.type,
        department_id: entry.department_id || ''
      });
    } else {
      setEditingEntry(null);
      setFormData({
        course_name: '',
        section: '',
        day_of_week: 'Saturday',
        start_time: '08:00',
        end_time: '09:30',
        location: '',
        type: 'Lecture',
        department_id: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEntry) {
        await doctorApi('put', `/doctor/timetable/${editingEntry.id}`, formData);
        toast.success(t('doctor.timetable.messages.updated'));
      } else {
        await doctorApi('post', '/doctor/timetable', formData);
        toast.success(t('doctor.timetable.messages.added'));
      }
      setShowModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(t('doctor.timetable.messages.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('doctor.timetable.messages.confirm_remove'))) return;
    try {
      await doctorApi('delete', `/doctor/timetable/${id}`);
      toast.success(t('doctor.timetable.messages.removed'));
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(t('doctor.timetable.messages.delete_failed'));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20 space-y-10 px-4">
      {/* Header Bento */}
      <div className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-3xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/30">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('doctor.timetable.title')}</h2>
                <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] font-black text-violet-500 uppercase tracking-widest">{t('doctor.timetable.timeline')}</span>
              </div>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" /> {t('doctor.timetable.description')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black text-xs uppercase tracking-widest [color-scheme:dark]"
            >
              <option value="all" className="dark:bg-[#0A0A0A]">{t('admin.logs.filters.all_modules')}</option>
              {departments.map(d => (
                <option key={d.id} value={d.id.toString()} className="dark:bg-[#0A0A0A]">{d.name}</option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenModal()}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-violet-600/20 transition-all text-xs font-black uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" /> {t('doctor.timetable.add_class')}
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: t('doctor.timetable.stats.today'), value: groupedSchedule[DAYS[new Date().getDay()]]?.length || 0, icon: Zap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { label: t('doctor.timetable.stats.weekly'), value: timetable?.length || 0, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: t('doctor.timetable.stats.depts'), value: departments.length, icon: Building2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shadow-sm ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timetable Flow */}
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-6">
        {DAYS.map((day) => (
          <div key={day} className="space-y-6">
            <div className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 py-4 px-6 rounded-2xl shadow-sm">
              <h3 className="text-gray-900 dark:text-white font-black text-center uppercase tracking-[0.2em] text-[10px]">
                {t(`admin.timetable.days.${day}`).slice(0, 3)}
              </h3>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {groupedSchedule[day].length > 0 ? (
                groupedSchedule[day].map((entry) => (
                  <motion.div
                    variants={itemVariants}
                    key={entry.id}
                    className="group bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] hover:border-violet-500/30 transition-all hover:bg-gray-50 dark:hover:bg-white/[0.01] hover:shadow-2xl hover:shadow-violet-500/5 relative overflow-hidden"
                  >
                    <div className={`absolute inset-y-0 start-0 w-1.5 ${entry.type === 'Lecture' ? 'bg-violet-600' : 'bg-emerald-500'}`}></div>

                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                        {entry.start_time.slice(0, 5)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleOpenModal(entry)} className="p-2 rounded-xl bg-white dark:bg-white/5 text-gray-400 hover:text-violet-500 border border-gray-100 dark:border-white/10 transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="p-2 rounded-xl bg-white dark:bg-white/5 text-gray-400 hover:text-rose-500 border border-gray-100 dark:border-white/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white font-black text-xs leading-relaxed mb-4 line-clamp-2 uppercase tracking-tight">
                      {entry.course_name}
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="w-3 h-3 text-violet-500" />
                        <span className="text-[10px] font-bold">{entry.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <GraduationCap className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-bold">{t('doctor.timetable.section_label')} {entry.section}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-32 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem] flex flex-col items-center justify-center opacity-20">
                  <span className="text-[9px] font-black uppercase tracking-widest">{t('doctor.timetable.free')}</span>
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Class Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/20">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                      {editingEntry ? t('doctor.timetable.edit_class') : t('doctor.timetable.add_class')}
                    </h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('doctor.timetable.form.settings')}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-gray-400 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 max-h-[65vh] overflow-y-auto hidden-scrollbar pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.timetable.form.dept')}</label>
                    <select
                      required
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black [color-scheme:dark]"
                    >
                      <option value="" disabled className="dark:bg-[#0A0A0A]">{t('doctor.timetable.form.choose_dept')}</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id} className="dark:bg-[#0A0A0A]">{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.timetable.form.course')}</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Programming 2"
                      value={formData.course_name}
                      onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black"
                    />
                    <div className="flex flex-wrap gap-2 mt-4">
                      {courses.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, course_name: c.name, department_id: c.department_id })}
                          className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${formData.course_name === c.name ? 'bg-violet-600 border-violet-600 text-white' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400'}`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.timetable.form.section')}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.timetable.form.type')}</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black [color-scheme:dark]"
                    >
                      <option value="Lecture" className="dark:bg-[#0A0A0A]">{t('doctor.timetable.types.lecture')}</option>
                      <option value="Section" className="dark:bg-[#0A0A0A]">{t('doctor.timetable.types.section')}</option>
                      <option value="Lab" className="dark:bg-[#0A0A0A]">{t('doctor.timetable.types.lab')}</option>
                      <option value="Office Hours" className="dark:bg-[#0A0A0A]">{t('doctor.timetable.types.office')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.timetable.form.day')}</label>
                    <select
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black [color-scheme:dark]"
                    >
                      {DAYS.map(day => <option key={day} value={day} className="dark:bg-[#0A0A0A]">{t(`admin.timetable.days.${day}`)}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.timetable.form.location')}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hall 4"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.timetable.form.start')}</label>
                    <input
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.timetable.form.end')}</label>
                    <input
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-violet-600/20 flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {loading ? <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Save className="w-4 h-4" /> {editingEntry ? t('doctor.timetable.form.update_session') : t('doctor.timetable.add_class')}</>}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-10 bg-gray-100 dark:bg-white/5 text-gray-400 font-black py-5 rounded-[1.5rem] hover:bg-rose-500/10 hover:text-rose-500 transition-all text-xs uppercase tracking-widest"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorSchedule;
