import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Calendar, ArrowLeftRight, Upload, Trash2,
  Eye, EyeOff, Edit3, Filter, FileSpreadsheet,
  Clock, MapPin, User,
  Activity, ChevronRight, 
  UploadCloud, Database, Zap, Layers, Settings, X, Save
} from 'lucide-react';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TimetableManager = () => {
  const { t, i18n } = useTranslation();
  const [showHidden, setShowHidden] = useState(true);
  const [activeDay, setActiveDay] = useState('Saturday');
  const [allTimetables, setAllTimetables] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [timetableFile, setTimetableFile] = useState(null);
  const [uploadingTimetable, setUploadingTimetable] = useState(false);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (DAYS.includes(today)) setActiveDay(today);
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchTimetableByDepartment(selectedDepartmentId);
  }, [selectedDepartmentId]);

  const fetchDepartments = async () => {
    try { const res = await api.get('/departments'); setDepartments(res.data || []); } catch {}
  };

  const fetchTimetableByDepartment = async (deptId) => {
    try {
      const url = deptId ? `/timetable/admin/all?department_id=${deptId}` : '/timetable/admin/all';
      const res = await api.get(url);
      setAllTimetables(res.data || []);
    } catch {}
  };

  const fetchAllTimetables = () => fetchTimetableByDepartment(selectedDepartmentId);

  const handleDeleteEntry = async (id) => {
    if (!window.confirm(t('admin.messages.delete_notif_confirm'))) return;
    try {
      await api.delete(`/timetable/admin/${id}`);
      toast.success(t('common.success'));
      fetchAllTimetables();
    } catch { toast.error(t('admin.messages.delete_failed')); }
  };

  const handleDeleteSection = async (section, deptId) => {
    if (!window.confirm(t('admin.timetable.clear_sections.hide_confirm', { section }))) return;
    try {
      await api.delete(`/timetable/admin/section/${section}`, { data: { department_id: parseInt(deptId, 10) } });
      toast.success(t('common.success'));
      fetchAllTimetables();
    } catch { toast.error(t('admin.messages.operation_failed')); }
  };

  const filteredTimetables = allTimetables.filter(entry => {
    if (entry.day_of_week !== activeDay) return false;
    if (selectedDepartmentId && entry.department_id != selectedDepartmentId) return false;
    if (!showHidden && entry.is_hidden) return false;
    return true;
  });

  const handleUploadTimetable = async (e) => {
    e.preventDefault();
    if (!timetableFile) {
      toast.error(t('admin.messages.upload_file_req'));
      return;
    }
    if (!selectedDepartmentId) {
      toast.error(t('admin.timetable.upload.select_dept_hint'));
      return;
    }
    const formData = new FormData();
    formData.append('file', timetableFile);
    formData.append('department_id', parseInt(selectedDepartmentId, 10));
    setUploadingTimetable(true);
    try {
      const res = await api.post('/timetable/admin/upload-all', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(t('admin.timetable.upload.success_msg', { sections: res.data.sections.join(', ') }));
      setTimetableFile(null);
      const fileInput = document.getElementById('timetableFileInput');
      if (fileInput) fileInput.value = '';
      fetchTimetableByDepartment(selectedDepartmentId);
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.upload_failed'));
    } finally {
      setUploadingTimetable(false);
    }
  };

  const toggleHideEntry = async (entry) => {
    const newHidden = !entry.is_hidden;
    try {
      await api.patch(`/timetable/admin/${entry.id}/hide`, { is_hidden: newHidden });
      toast.success(newHidden ? t('admin.timetable.visibility.hidden_msg') : t('admin.timetable.visibility.visible_msg'));
      fetchTimetableByDepartment(selectedDepartmentId);
    } catch (error) {
      toast.error(t('admin.messages.operation_failed'));
    }
  };

  const handleHideAllDay = async (day) => {
    if (!selectedDepartmentId) {
      toast.error('Select a department first');
      return;
    }
    if (!window.confirm(t('admin.timetable.visibility.hide_confirm', { day: t(`admin.timetable.days.${day}`) }))) return;
    try {
      await api.patch(`/timetable/admin/day/${day}/hide-all`, { department_id: parseInt(selectedDepartmentId, 10) });
      toast.success(t('common.success'));
      fetchTimetableByDepartment(selectedDepartmentId);
    } catch (error) {
      toast.error('Failed to hide classes');
    }
  };

  const handleShowAllDay = async (day) => {
    if (!selectedDepartmentId) {
      toast.error('Select a department first');
      return;
    }
    try {
      await api.patch(`/timetable/admin/day/${day}/show-all`, { department_id: parseInt(selectedDepartmentId, 10) });
      toast.success(t('common.success'));
      fetchTimetableByDepartment(selectedDepartmentId);
    } catch (error) {
      toast.error('Failed to show classes');
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-700 pb-10 text-start px-4 sm:px-0 relative z-10">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 relative z-10">
        <div className="lg:col-span-2 flex items-center gap-5 sm:gap-8 bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 rounded-[1.5rem] sm:rounded-[1.75rem] flex items-center justify-center border border-[#8b5cf6]/20 shadow-inner group-hover:scale-110 transition-transform duration-500 relative z-10">
            <Calendar className="w-7 h-7 sm:w-10 sm:h-10 text-[#8b5cf6]" />
          </div>
          <div className="relative z-10">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
              {t('admin.timetable.title')}
            </h2>
            <p className="text-gray-400 text-[10px] sm:text-[11px] font-black mt-2 sm:mt-3 uppercase tracking-widest opacity-60">{t('admin.timetable.description')}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl shadow-[#8b5cf6]/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1.25rem] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black/10 px-3 sm:px-4 py-1.5 rounded-full backdrop-blur-md">{t('admin.timetable.stats.temporal_sync')}</span>
          </div>
          <div className="mt-6 sm:mt-8 relative z-10">
            <p className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">{allTimetables.length}</p>
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] opacity-60 mt-2 sm:mt-3">{t('admin.timetable.stats.scheduled_events')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 sm:gap-10 items-start relative z-10">

        {/* Main Content Area: Day Switcher + Class List */}
        <div className="flex-1 w-full space-y-10">
          {/* Day Switcher - Swipeable on mobile */}
          <div className="bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2.5rem] sm:rounded-[3rem] p-2 sm:p-3 shadow-inner flex overflow-x-auto gap-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-3">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`shrink-0 py-3 sm:py-5 px-4 sm:px-4 rounded-[1.5rem] sm:rounded-[2rem] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all duration-500 ${
                  activeDay === day
                    ? 'bg-[#8b5cf6] text-white shadow-xl scale-[1.02]'
                    : 'text-gray-400 dark:text-slate-500 hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6]'
                }`}
              >
                {t(`admin.timetable.days.${day}`)}
              </button>
            ))}
          </div>


          {/* Class Matrix */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{t(`admin.timetable.days.${activeDay}`)}</h2>
                    <div className="bg-primary/10 px-4 py-2 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                       {filteredTimetables.length} UNITS
                    </div>
                </div>
                <label className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:border-primary/30 transition-all shadow-sm">
                  <input
                    type="checkbox"
                    checked={showHidden}
                    onChange={(e) => setShowHidden(e.target.checked)}
                    className="w-4 h-4 rounded-full border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-black text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  {t('admin.timetable.show_hidden')}
                </label>
            </div>

            <div className="bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3.5rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
                      <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-start">{t('admin.timetable.time_details')}</th>
                      <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-start">{t('admin.timetable.course_instructor')}</th>
                      <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-start">{t('admin.timetable.type')}</th>
                      <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-end">{t('admin.timetable.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {filteredTimetables.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-48 opacity-30">
                          <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                              <Calendar className="w-12 h-12 text-gray-400" />
                          </div>
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] italic">{t('admin.timetable.no_classes', { day: t(`admin.timetable.days.${activeDay}`) })}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTimetables.map((entry) => (
                        <tr
                          key={entry.id}
                          className={`group hover:bg-primary/5 transition-all duration-500 ${entry.is_hidden ? 'opacity-40 grayscale' : ''}`}
                        >
                          <td className="py-8 px-10">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3 font-black text-2xl tracking-tighter leading-none">
                                <Clock className="w-5 h-5 text-primary" />
                                {entry.start_time?.substring(0, 5)} — {entry.end_time?.substring(0, 5)}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                  <span className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest shadow-inner">
                                      {entry.department_code || 'FACULTY'}
                                  </span>
                                  <span className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest shadow-inner">
                                      {t('admin.timetable.section')} {entry.section}
                                  </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-8 px-10">
                            <div className="flex flex-col gap-3">
                              <p className="font-black tracking-tighter text-2xl uppercase leading-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors">{entry.course_name}</p>
                              <div className="flex items-center gap-6 opacity-40">
                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                                  <User className="w-4 h-4 text-primary" /> {entry.instructor || t('common.unassigned')}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                                  <MapPin className="w-4 h-4 text-primary" /> {entry.location || t('common.n_a')}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-8 px-10">
                             <span className="px-4 py-2 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest shadow-inner">
                                {entry.type || 'Lecture'}
                             </span>
                          </td>
                          <td className="py-8 px-10">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                              <button onClick={() => toggleHideEntry(entry)} className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${entry.is_hidden ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                {entry.is_hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                              <button onClick={() => handleDeleteEntry(entry.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full xl:w-[450px] space-y-10 shrink-0">
          {/* Filters & Upload */}
          <div className="bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 space-y-12 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 space-y-12">
                {/* Department Filter */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Filter className="w-6 h-6 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">{t('admin.timetable.filter_context')}</span>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedDepartmentId || ''}
                            onChange={(e) => setSelectedDepartmentId(e.target.value ? parseInt(e.target.value, 10) : '')}
                            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-6 font-black text-[11px] text-gray-900 dark:text-white focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none uppercase tracking-widest shadow-inner"
                        >
                            <option value="">{t('admin.timetable.all_faculty_nodes')}</option>
                            {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                            ))}
                        </select>
                        <ChevronRight className={`absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary rotate-90 ${i18n.language === 'ar' ? 'rotate-[-90deg]' : ''}`} />
                    </div>
                </div>

                {/* Upload Form */}
                <div className="space-y-10 pt-12 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                            <UploadCloud className="w-9 h-9" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{t('admin.timetable.upload.title')}</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic opacity-60">Source Matrix Ingestion</p>
                        </div>
                    </div>

                    <form onSubmit={handleUploadTimetable} className="space-y-10">
                        <label className="relative flex flex-col items-center justify-center gap-8 cursor-pointer bg-gray-50 dark:bg-black/40 border-2 border-gray-100 dark:border-white/10 border-dashed rounded-[3rem] p-12 hover:border-primary/40 hover:bg-primary/5 transition-all group/label shadow-inner text-center">
                            <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-[1.75rem] flex items-center justify-center shadow-sm group-hover/label:scale-110 group-hover/label:bg-primary/10 transition-all border border-gray-100 dark:border-white/5">
                                <FileSpreadsheet className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-3">
                                <span className="text-gray-900 dark:text-white font-black text-sm block uppercase tracking-[0.2em] leading-tight">
                                    {timetableFile ? (
                                        <span className="text-primary">{timetableFile.name}</span>
                                    ) : t('admin.timetable.upload.click_to_upload')}
                                </span>
                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] italic">Binary Data Stream</span>
                            </div>
                            <input id="timetableFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setTimetableFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </label>
                        
                        <button
                            type="submit"
                            disabled={uploadingTimetable || !timetableFile || !selectedDepartmentId}
                            className="w-full bg-primary text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
                        >
                            {uploadingTimetable ? <Activity className="w-7 h-7 animate-spin" /> : <><Upload className="w-7 h-7 group-hover:-translate-y-1 transition-transform" /> <span className="uppercase tracking-[0.3em] text-[11px]">{t('admin.timetable.upload.upload_button')}</span></>}
                        </button>
                    </form>
                </div>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 space-y-12 shadow-sm group relative overflow-hidden">
             <div className="flex items-center gap-5 relative z-10">
                <div className="w-16 h-16 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center text-blue-500 shadow-inner">
                   <Eye className="w-9 h-9" />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{t('admin.timetable.visibility.title')}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic opacity-60">Locus Visibility Control</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 gap-4 relative z-10">
                {DAYS.map(day => (
                   <div key={day} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group/day border border-transparent hover:border-gray-100 dark:hover:border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest ml-4 text-gray-400 group-hover/day:text-primary transition-colors italic">{t(`admin.timetable.days.${day}`)}</span>
                      <div className="flex gap-2">
                         <button onClick={() => handleHideAllDay(day)} className="px-5 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">{t('admin.timetable.visibility.hide')}</button>
                         <button onClick={() => handleShowAllDay(day)} className="px-5 py-2.5 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">{t('admin.timetable.visibility.show')}</button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Quick Actions (Delete Sections) */}
          <div className="bg-[#0a0a0a] text-white rounded-[3.5rem] p-10 lg:p-12 space-y-12 shadow-2xl group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-rose-500/20 rounded-[1.5rem] flex items-center justify-center text-rose-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-inner">
                   <Trash2 className="w-9 h-9" />
                </div>
                <div>
                   <h4 className="text-2xl font-black tracking-tighter uppercase leading-none">{t('admin.timetable.clear_sections.title')}</h4>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic mt-2">{t('admin.timetable.clear_sections.select_dept_hint')}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 relative z-10">
                {selectedDepartmentId ? [1, 2, 3, 4, 5, 6].map(sec => (
                  <button
                    key={sec}
                    onClick={() => handleDeleteSection(sec, selectedDepartmentId)}
                    className="py-6 text-[10px] font-black bg-white/5 border border-white/10 rounded-2xl hover:bg-rose-500 hover:border-rose-500 transition-all uppercase tracking-[0.3em] shadow-sm"
                  >
                    {t('admin.timetable.clear_sections.sec_label', { num: sec })}
                  </button>
                )) : (
                  <div className="col-span-2 py-12 border border-white/10 rounded-[2.5rem] text-center opacity-20 italic text-[11px] font-black uppercase tracking-[0.4em]">
                     Awaiting Auth
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(46, 204, 113, 0.2); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(46, 204, 113, 0.4); }
      `}</style>
    </div>
  );
};

export default TimetableManager;