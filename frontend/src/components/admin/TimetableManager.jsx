import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Calendar, ArrowLeftRight, Upload, Trash2,
  Eye, EyeOff, Edit3, Filter, FileSpreadsheet,
  CheckCircle, AlertCircle, Clock, MapPin, User,
  Activity, ChevronRight, LayoutDashboard, Copy,
  Plus, Settings, Layout, Info, UploadCloud
} from 'lucide-react';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TimetableManager = ({
  allTimetables,
  fetchAllTimetables,
  timetableFile,
  setTimetableFile,
  uploadingTimetable,
  setUploadingTimetable,
  handleEditEntry,
  handleDeleteEntry,
  handleDeleteSection,
  departments,
  selectedDepartmentId,
  setSelectedDepartmentId,
  fetchTimetableByDepartment
}) => {
  const [showHidden, setShowHidden] = useState(true);
  const [activeDay, setActiveDay] = useState('Saturday');

  // Set initial active day based on current day if possible, or just default to Saturday
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (DAYS.includes(today)) {
      setActiveDay(today);
    }
  }, []);

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
      toast.success(`Successfully uploaded schedule for sections: ${res.data.sections.join(', ')}`);
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
    if (!window.confirm(`Hide ALL classes for ${day}?`)) return;
    try {
      await api.patch(`/timetable/admin/day/${day}/hide-all`, { department_id: parseInt(selectedDepartmentId, 10) });
      toast.success(`All ${day} classes are now hidden`);
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
      toast.success(`All ${day} classes are now visible`);
      fetchTimetableByDepartment(selectedDepartmentId);
    } catch (error) {
      toast.error('Failed to show classes');
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <Calendar className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Class Schedule
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Manage weekly classes and schedules</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Main Content Area: Day Switcher + Class List */}
        <div className="flex-1 w-full space-y-6">
          {/* Day Switcher */}
          <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-3 shadow-sm flex flex-wrap gap-2 relative overflow-hidden group">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex-1 min-w-[100px] py-3.5 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  activeDay === day
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-600'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* Class List Table */}
          <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm relative">
            <div className="p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{activeDay} Classes</h3>
                </div>
                <label className="flex items-center gap-2.5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showHidden}
                    onChange={(e) => setShowHidden(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-black text-emerald-600 focus:ring-emerald-500/30 cursor-pointer transition-all"
                  />
                  Show Hidden
                </label>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                    <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Time & Details</th>
                    <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Course & Instructor</th>
                    <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredTimetables.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-24">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">No classes found for {activeDay}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTimetables.map((entry) => (
                      <tr
                        key={entry.id}
                        className={`group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${entry.is_hidden ? 'opacity-50' : ''}`}
                      >
                        <td className="py-6 px-8">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-black text-base">
                              <Clock className="w-4.5 h-4.5 text-emerald-500" />
                              {entry.start_time?.substring(0, 5)} - {entry.end_time?.substring(0, 5)}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 text-[10px] font-black uppercase tracking-tight">
                                    <LayoutDashboard className="w-3.5 h-3.5" /> {entry.department_code || 'N/A'}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-tight">
                                    <Activity className="w-3.5 h-3.5" /> Section {entry.section}
                                </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex flex-col gap-2">
                            <p className="text-gray-900 dark:text-white font-black tracking-tight text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{entry.course_name}</p>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> {entry.instructor || 'Staff'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> {entry.location || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                entry.type === 'Lecture' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                                entry.type === 'Lab' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                'bg-purple-500/10 border-purple-500/20 text-purple-600'
                              }`}>
                              {entry.type || 'Lecture'}
                            </span>
                            {entry.is_quiz && (
                              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" /> Quiz
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => toggleHideEntry(entry)}
                              className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all shadow-sm ${entry.is_hidden
                                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'
                                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-white dark:hover:bg-white/20 hover:text-emerald-500'
                                }`}
                              title={entry.is_hidden ? 'Hidden' : 'Visible'}
                            >
                              {entry.is_hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            >
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

        {/* Sidebar Controls */}
        <div className="w-full xl:w-[380px] space-y-8">
          {/* Filters & Upload */}
          <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
                {/* Department Filter */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 ml-1">
                        <Filter className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Filter Department</span>
                    </div>
                    <select
                        value={selectedDepartmentId || ''}
                        onChange={(e) => setSelectedDepartmentId(e.target.value ? parseInt(e.target.value, 10) : '')}
                        className="w-full bg-gray-50/50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-black text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner appearance-none"
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                    </select>
                </div>

                {/* Upload Form */}
                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                            <UploadCloud className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h4 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Upload Schedule</h4>
                    </div>

                    <form onSubmit={handleUploadTimetable} className="space-y-4">
                        <label className="relative flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-50/50 dark:bg-black/40 border-2 border-gray-200 dark:border-white/10 border-dashed rounded-3xl p-8 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all group/label shadow-inner text-center">
                            <FileSpreadsheet className="w-8 h-8 text-gray-400 group-hover/label:text-emerald-500 transition-colors" />
                            <span className="text-gray-700 dark:text-gray-300 font-bold text-xs">
                                {timetableFile ? (
                                    <span className="text-emerald-600 font-black">{timetableFile.name}</span>
                                ) : 'Click to select Excel schedule'}
                            </span>
                            <input id="timetableFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setTimetableFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </label>
                        
                        <button
                            type="submit"
                            disabled={uploadingTimetable || !timetableFile || !selectedDepartmentId}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4.5 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {uploadingTimetable ? <Activity className="w-6 h-6 animate-spin" /> : <><Upload className="w-5 h-5" /> Upload Schedule</>}
                        </button>
                        
                        {!selectedDepartmentId && (
                            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-2xl">
                                <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest leading-relaxed">Please select a department before uploading.</p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
          </div>

          {/* Day Visibility Controls */}
          <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <Eye className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Daily Visibility</h4>
            </div>

            <div className="space-y-3">
              {DAYS.map(day => (
                <div key={day} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl group/day hover:bg-white dark:hover:bg-white/10 transition-all">
                  <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{day}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleHideAllDay(day)}
                      className="px-3.5 py-1.5 text-[10px] font-black bg-gray-100 dark:bg-black text-gray-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all uppercase"
                    >
                      Hide
                    </button>
                    <button
                      onClick={() => handleShowAllDay(day)}
                      className="px-3.5 py-1.5 text-[10px] font-black bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm transition-all uppercase"
                    >
                      Show
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions (Delete Sections) */}
          <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h4 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Clear Sections</h4>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {selectedDepartmentId && [1, 2, 3, 4, 5, 6].map(sec => (
                <button
                  key={sec}
                  onClick={() => handleDeleteSection(sec, selectedDepartmentId)}
                  className="py-3 text-[10px] font-black text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-600 hover:text-white transition-all uppercase"
                >
                  Sec {sec}
                </button>
              ))}
              {!selectedDepartmentId && (
                  <p className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center py-4 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-2xl">Select Dept to clear</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableManager;