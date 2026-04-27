import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Calendar, ArrowLeftRight, Upload, Trash2,
  Eye, EyeOff, Edit3, Filter, FileSpreadsheet,
  CheckCircle, AlertCircle, Clock, MapPin, User,
  Activity, ChevronRight, LayoutDashboard, Copy
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
  const [copySourceDept, setCopySourceDept] = useState('');
  const [copyTargetDept, setCopyTargetDept] = useState('');
  const [copyLoading, setCopyLoading] = useState(false);

  const filteredTimetables = allTimetables.filter(entry => {
    if (!selectedDepartmentId) return true;
    if (entry.department_id != selectedDepartmentId) return false;
    if (!showHidden && entry.is_hidden) return false;
    return true;
  });

  const handleUploadTimetable = async (e) => {
    e.preventDefault();
    if (!timetableFile) {
      toast.error('Please select a file');
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
      toast.success(`Uploaded ${res.data.count} entries for sections: ${res.data.sections.join(', ')}`);
      setTimetableFile(null);
      document.getElementById('timetableFileInput').value = '';
      fetchTimetableByDepartment(selectedDepartmentId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading timetable');
    } finally {
      setUploadingTimetable(false);
    }
  };

  const handleCopyDepartment = async () => {
    if (!copySourceDept || !copyTargetDept) {
      toast.error('Select both source and target departments');
      return;
    }
    if (copySourceDept === copyTargetDept) {
      toast.error('Source and target must be different');
      return;
    }
    if (!window.confirm(`Copy all timetable entries from ${departments.find(d => d.id == copySourceDept)?.name} to ${departments.find(d => d.id == copyTargetDept)?.name}?`)) return;
    setCopyLoading(true);
    try {
      const res = await api.post('/timetable/admin/copy', {
        source_department_id: parseInt(copySourceDept, 10),
        target_department_id: parseInt(copyTargetDept, 10)
      });
      toast.success(`Copied ${res.data.count} entries successfully`);
      fetchTimetableByDepartment(copyTargetDept);
      setCopySourceDept('');
      setCopyTargetDept('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Copy failed');
    } finally {
      setCopyLoading(false);
    }
  };

  const toggleHideEntry = async (entry) => {
    const newHidden = !entry.is_hidden;
    try {
      await api.patch(`/timetable/admin/${entry.id}/hide`, { is_hidden: newHidden });
      toast.success(newHidden ? 'Entry hidden' : 'Entry visible');
      fetchTimetableByDepartment(selectedDepartmentId);
    } catch (error) {
      toast.error('Failed to update entry visibility');
    }
  };

  const handleHideAllDay = async (day) => {
    if (!selectedDepartmentId) {
      toast.error('Select a department first');
      return;
    }
    if (!window.confirm(`Hide ALL entries for ${day} in current department?`)) return;
    try {
      await api.patch(`/timetable/admin/day/${day}/hide-all`, { department_id: parseInt(selectedDepartmentId, 10) });
      toast.success(`All ${day} entries hidden`);
      fetchTimetableByDepartment(selectedDepartmentId);
    } catch (error) {
      toast.error('Failed to hide entries');
    }
  };

  const handleShowAllDay = async (day) => {
    if (!selectedDepartmentId) {
      toast.error('Select a department first');
      return;
    }
    try {
      await api.patch(`/timetable/admin/day/${day}/show-all`, { department_id: parseInt(selectedDepartmentId, 10) });
      toast.success(`All ${day} entries shown`);
      fetchTimetableByDepartment(selectedDepartmentId);
    } catch (error) {
      toast.error('Failed to show entries');
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Calendar className="w-6 h-6 text-emerald-400" /> Timetable Control
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Schedule Architecture & Synchronization</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
          <Filter className="w-4 h-4 text-slate-500 ml-3" />
          <select
            value={selectedDepartmentId || ''}
            onChange={(e) => setSelectedDepartmentId(e.target.value ? parseInt(e.target.value, 10) : '')}
            className="bg-transparent border-none text-white text-sm font-bold focus:ring-0 cursor-pointer pr-10"
          >
            <option value="" className="bg-slate-900">Global View</option>
            {departments.map(d => (
              <option key={d.id} value={d.id} className="bg-slate-900">{d.name} ({d.code})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Synchronize Node (Copy) */}
        <div className="admin-card relative overflow-hidden group border-blue-500/10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Copy className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Sync Departments</h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Source Node</label>
                <select
                  value={copySourceDept}
                  onChange={(e) => setCopySourceDept(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="admin-input appearance-none"
                >
                  <option value="">Select source</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <ArrowLeftRight className="w-5 h-5 text-slate-600 mt-6 hidden sm:block" />
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Target Node</label>
                <select
                  value={copyTargetDept}
                  onChange={(e) => setCopyTargetDept(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="admin-input appearance-none"
                >
                  <option value="">Select target</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleCopyDepartment}
              disabled={copyLoading || !copySourceDept || !copyTargetDept}
              className="w-full admin-btn-primary mt-6 h-[55px] flex items-center justify-center gap-2"
            >
              {copyLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" /> : <><Copy className="w-5 h-5" /> REPLICATE DATA</>}
            </button>
          </div>
        </div>

        {/* Upload Data Node */}
        <div className="admin-card relative overflow-hidden group border-emerald-500/10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <Upload className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Matrix Upload</h3>
            </div>

            <form onSubmit={handleUploadTimetable} className="space-y-4">
              <label className="relative flex items-center justify-center gap-3 cursor-pointer bg-slate-900/50 border border-white/5 border-dashed rounded-2xl px-6 py-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group/label">
                <FileSpreadsheet className="w-5 h-5 text-slate-500 group-hover/label:text-emerald-400 transition-colors" />
                <span className="text-slate-300 font-bold text-sm truncate max-w-[200px]">
                  {timetableFile ? timetableFile.name : 'Choose Excel Matrix'}
                </span>
                <input id="timetableFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setTimetableFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={uploadingTimetable || !timetableFile || !selectedDepartmentId}
                  className="flex-1 admin-btn-primary h-[55px]"
                >
                  {uploadingTimetable ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" /> : 'EXECUTE UPLOAD'}
                </button>
                {!selectedDepartmentId && (
                  <div className="flex items-center gap-2 text-yellow-500/80 text-[10px] font-black uppercase tracking-widest px-4 border border-yellow-500/20 rounded-xl bg-yellow-500/5">
                    <AlertCircle className="w-4 h-4" /> Locked: Select Dept
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Visibility Matrix Dashboard */}
      <div className="admin-card mb-10 overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
            <Eye className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Active Visibility Matrix</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAYS.map(day => (
            <div key={day} className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex flex-col gap-3 group/day hover:bg-white/[0.04] transition-all">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center py-1 border-b border-white/5">{day.substring(0, 3)}</span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleHideAllDay(day)}
                  className="w-full text-[10px] font-black text-slate-400 bg-white/5 py-2 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all uppercase"
                >
                  Off
                </button>
                <button
                  onClick={() => handleShowAllDay(day)}
                  className="w-full text-[10px] font-black text-slate-400 bg-white/5 py-2 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-400 transition-all uppercase"
                >
                  On
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Visualizer Table */}
      <div className="bg-[#111111]/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.1em]">Entry Registry</h3>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer group">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
                className="w-5 h-5 rounded-lg border-white/10 bg-slate-900 text-blue-500 focus:ring-blue-500/20 cursor-pointer"
              />
              Include Staged
            </label>

            <div className="flex gap-2">
              {selectedDepartmentId && [1, 2, 3, 4, 5, 6].map(sec => (
                <button
                  key={sec}
                  onClick={() => handleDeleteSection(sec, selectedDepartmentId)}
                  className="px-3 py-1.5 text-[9px] font-black text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400 hover:text-white transition-all uppercase"
                >
                  Sec {sec}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Matrix Loc</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Execution Flow</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Target Course</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredTimetables.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-24">
                    <Calendar className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold uppercase tracking-widest">No entries found for current matrix filter.</p>
                  </td>
                </tr>
              ) : (
                filteredTimetables.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`group hover:bg-white/[0.02] transition-colors ${entry.is_hidden ? 'bg-red-500/[0.02] opacity-70' : ''}`}
                  >
                    <td className="py-6 px-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-tight self-start">
                          <LayoutDashboard className="w-3 h-3" /> {entry.department_code || 'N/A'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-tight self-start">
                          <Activity className="w-3 h-3" /> Section {entry.section}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex flex-col gap-1.5">
                        <p className="text-white font-black text-xs uppercase flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          {entry.day_of_week}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                          <span>{entry.start_time?.substring(0, 5) || '--:--'}</span>
                          <ChevronRight className="w-3 h-3" />
                          <span>{entry.end_time?.substring(0, 5) || '--:--'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex flex-col gap-1.5">
                        <p className="text-white font-black tracking-tight leading-tight max-w-[200px] truncate">{entry.course_name}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {entry.location || 'Unknown'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                            <User className="w-3 h-3" /> {entry.instructor || 'Staff'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${entry.type === 'Lecture' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            entry.type === 'Lab' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              'bg-purple-500/10 border-purple-500/20 text-purple-400'
                          }`}>
                          {entry.type || 'Lecture'}
                        </span>
                        {entry.is_quiz && (
                          <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" /> QUIZ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleHideEntry(entry)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-lg ${entry.is_hidden
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                              : 'bg-slate-900 text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                          title={entry.is_hidden ? 'Staged (Hidden)' : 'Production (Visible)'}
                        >
                          {entry.is_hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEditEntry(entry)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
};

export default TimetableManager;