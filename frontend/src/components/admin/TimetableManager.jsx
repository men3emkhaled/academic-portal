import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Calendar, ArrowLeftRight, Upload, Trash2,
  Eye, EyeOff, Edit3, Filter, FileSpreadsheet,
  CheckCircle, AlertCircle, Clock, MapPin, User,
  Activity, ChevronRight, LayoutDashboard, Copy,
  Plus, Settings, Layout, Info, UploadCloud, Layers, Zap
} from 'lucide-react';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TimetableManager = () => {
  const { t } = useTranslation();
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

  const handleEditEntry = (entry) => toast('Edit coming soon');

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/timetable/admin/${id}`);
      toast.success('Deleted');
      fetchAllTimetables();
    } catch { toast.error('Failed to delete'); }
  };

  const handleDeleteSection = async (section, deptId) => {
    if (!window.confirm(`Clear section ${section}?`)) return;
    try {
      await api.delete(`/timetable/admin/section/${section}`, { data: { department_id: parseInt(deptId, 10) } });
      toast.success('Section cleared');
      fetchAllTimetables();
    } catch { toast.error('Failed to clear section'); }
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
      toast.error('Please select an Excel or CSV file');
      return;
    }
    if (!selectedDepartmentId) {
      toast.error('Please select a department first');
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
      toast.error(error.response?.data?.message || 'Error uploading schedule');
    } finally {
      setUploadingTimetable(false);
    }
  };

  const toggleHideEntry = async (entry) => {
    const newHidden = !entry.is_hidden;
    try {
      await api.patch(`/timetable/admin/${entry.id}/hide`, { is_hidden: newHidden });
      toast.success(newHidden ? 'Entry hidden' : 'Entry is now visible');
      fetchTimetableByDepartment(selectedDepartmentId);
    } catch (error) {
      toast.error('Failed to update visibility');
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
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <Calendar className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.timetable.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.timetable.description')}</p>
          </div>
        </div>
        
        <div className="bg-emerald-500 text-white p-8 rounded-[2.5rem] shadow-lg shadow-emerald-500/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">Temporal Sync</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{allTimetables.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Scheduled Events</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Content Area: Day Switcher + Class List */}
        <div className="flex-1 w-full space-y-8">
          {/* Day Switcher */}
          <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2rem] p-2 shadow-inner flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex-1 min-w-[110px] py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-[color,background-color,border-color,transform,opacity] duration-500 ${
                  activeDay === day
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 scale-[1.02]'
                    : 'text-gray-400 dark:text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-600'
                }`}
              >
                {t(`admin.timetable.days.${day}`)}
              </button>
            ))}
          </div>

          {/* Class List Table */}
          <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm relative">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t(`admin.timetable.days.${activeDay}`)} {t('admin.timetable.title')}</h3>
                </div>
                <label className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest cursor-pointer hover:border-emerald-500/30 transition-[color,background-color,border-color,transform,opacity]">
                  <input
                    type="checkbox"
                    checked={showHidden}
                    onChange={(e) => setShowHidden(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-black text-emerald-600 focus:ring-emerald-500/30 cursor-pointer transition-[color,background-color,border-color,transform,opacity]"
                  />
                  {t('admin.timetable.show_hidden')}
                </label>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                    <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-start">{t('admin.timetable.time_details')}</th>
                    <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-start">{t('admin.timetable.course_instructor')}</th>
                    <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-start">{t('admin.timetable.type')}</th>
                    <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-end">{t('admin.timetable.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  <>
                  {filteredTimetables.length === 0 ? (
                    <tr  >
                      <td colSpan="4" className="text-center py-32">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Calendar className="w-10 h-10 text-gray-200 dark:text-gray-800" />
                        </div>
                        <p className="text-[11px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.3em]">{t('admin.timetable.no_classes', { day: t(`admin.timetable.days.${activeDay}`) })}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTimetables.map((entry, idx) => (
                      <tr
                        key={entry.id}
                        
                        
                        
                        className={`group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${entry.is_hidden ? 'opacity-40 grayscale-[0.5]' : ''}`}
                      >
                        <td className="py-6 px-8">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2.5 text-gray-900 dark:text-white font-black text-lg tracking-tight group-hover:text-emerald-500 transition-colors">
                              <Clock className="w-5 h-5 text-emerald-500" />
                              {entry.start_time?.substring(0, 5)} — {entry.end_time?.substring(0, 5)}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors group-hover:border-emerald-500/20">
                                    <LayoutDashboard className="w-4 h-4" /> {entry.department_code || 'Global'}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                    <Activity className="w-4 h-4" /> {t('admin.timetable.section')} {entry.section}
                                </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex flex-col gap-3">
                            <p className="text-gray-900 dark:text-white font-black tracking-tight text-xl leading-tight">{entry.course_name}</p>
                            <div className="flex items-center gap-6">
                              <span className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-emerald-500/70 transition-colors">
                                <User className="w-4 h-4" /> {entry.instructor || 'Unassigned'}
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> {entry.location || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-inner transition-[color,background-color,border-color,transform,opacity] ${
                                entry.type === 'Lecture' ? 'bg-blue-500/5 border-blue-500/10 text-blue-600' :
                                entry.type === 'Lab' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600' :
                                'bg-purple-500/5 border-purple-500/10 text-purple-600'
                              }`}>
                              {entry.type || 'Lecture'}
                            </span>
                            {entry.is_quiz && (
                              <span className="px-4 py-2 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                                <Zap className="w-4 h-4" /> Quiz Mode
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-[color,background-color,border-color,transform,opacity] scale-95 group-hover:scale-100">
                            <button
                              onClick={() => toggleHideEntry(entry)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-[color,background-color,border-color,transform,opacity] shadow-sm ${entry.is_hidden
                                  ? 'bg-rose-500 text-white shadow-rose-500/20'
                                  : 'bg-white dark:bg-white/10 text-gray-400 hover:text-emerald-500 hover:border-emerald-500/30'
                                } border border-transparent`}
                              title={entry.is_hidden ? 'Hidden' : 'Visible'}
                            >
                              {entry.is_hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/10 hover:bg-blue-500 hover:text-white transition-[color,background-color,border-color,transform,opacity] shadow-sm"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-[color,background-color,border-color,transform,opacity] shadow-sm"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  </>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full xl:w-[400px] space-y-10 shrink-0">
          {/* Filters & Upload */}
          <div className="bg-white/80 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">

            <div className="relative z-10 space-y-10">
                {/* Department Filter */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 ml-1">
                        <Filter className="w-5 h-5 text-emerald-500" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Filter Context</span>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedDepartmentId || ''}
                            onChange={(e) => setSelectedDepartmentId(e.target.value ? parseInt(e.target.value, 10) : '')}
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black text-[11px] text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner appearance-none uppercase tracking-widest"
                        >
                            <option value="">All Faculty Nodes</option>
                            {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                    </div>
                </div>

                {/* Upload Form */}
                <div className="space-y-6 pt-10 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm">
                            <UploadCloud className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.timetable.upload.title')}</h4>
                    </div>

                    <form onSubmit={handleUploadTimetable} className="space-y-6">
                        <label className="relative flex flex-col items-center justify-center gap-5 cursor-pointer bg-white/30 dark:bg-white/[0.01] border-2 border-gray-100 dark:border-white/5 border-dashed rounded-[2.5rem] p-10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-[color,background-color,border-color,transform,opacity] group/label shadow-inner overflow-hidden text-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/label:opacity-100 transition-opacity"></div>
                            <FileSpreadsheet className="w-10 h-10 text-gray-300 group-hover/label:text-emerald-500 group-hover/label:scale-110 transition-[color,background-color,border-color,transform,opacity] duration-500 relative z-10" />
                            <span className="text-gray-500 dark:text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] relative z-10">
                                {timetableFile ? (
                                    <span className="text-emerald-600 dark:text-emerald-400">{timetableFile.name}</span>
                                ) : t('admin.timetable.upload.click_to_upload')}
                            </span>
                            <input id="timetableFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setTimetableFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </label>
                        
                        <button
                            type="submit"
                            disabled={uploadingTimetable || !timetableFile || !selectedDepartmentId}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 transition-[color,background-color,border-color,transform,opacity] hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {uploadingTimetable ? <Activity className="w-6 h-6 animate-spin" /> : <><Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> <span className="uppercase tracking-widest text-xs">{t('admin.timetable.upload.upload_button')}</span></>}
                        </button>
                        
                        {!selectedDepartmentId && (
                            <div className="flex items-start gap-4 p-5 bg-amber-500/5 border border-amber-500/20 rounded-[2rem]">
                                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-relaxed">{t('admin.timetable.upload.select_dept_hint')}</p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
          </div>

          {/* Day Visibility Controls */}
          <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm">
                <Eye className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.timetable.visibility.title')}</h4>
            </div>

            <div className="space-y-4">
              {DAYS.map(day => (
                <div key={day} className="flex items-center justify-between p-5 bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-[1.5rem] group/day hover:border-emerald-500/20 transition-[color,background-color,border-color,transform,opacity]">
                  <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{t(`admin.timetable.days.${day}`)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleHideAllDay(day)}
                      className="px-5 py-2.5 text-[9px] font-black bg-gray-100 dark:bg-black text-gray-500 hover:bg-rose-500 hover:text-white rounded-xl transition-[color,background-color,border-color,transform,opacity] uppercase tracking-widest"
                    >
                      {t('admin.timetable.visibility.hide')}
                    </button>
                    <button
                      onClick={() => handleShowAllDay(day)}
                      className="px-5 py-2.5 text-[9px] font-black bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20 transition-[color,background-color,border-color,transform,opacity] uppercase tracking-widest"
                    >
                      {t('admin.timetable.visibility.show')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions (Delete Sections) */}
          <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-sm">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.timetable.clear_sections.title')}</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedDepartmentId ? [1, 2, 3, 4, 5, 6].map(sec => (
                <button
                  key={sec}
                  onClick={() => handleDeleteSection(sec, selectedDepartmentId)}
                  className="py-4 text-[10px] font-black text-rose-500 bg-rose-500/5 border border-rose-500/10 rounded-2xl hover:bg-rose-500 hover:text-white transition-[color,background-color,border-color,transform,opacity] uppercase tracking-widest shadow-sm"
                >
                  {t('admin.timetable.clear_sections.sec_label', { num: sec })}
                </button>
              )) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-[2rem] opacity-40">
                    <Info className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-4" />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{t('admin.timetable.clear_sections.select_dept_hint')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(16, 185, 129, 0.1); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.2); }
      `}</style>
    </div>
  );
};

export default TimetableManager;