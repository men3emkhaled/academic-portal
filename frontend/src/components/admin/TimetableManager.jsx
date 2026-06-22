import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Calendar, Upload, Trash2, Eye, EyeOff, FileSpreadsheet,
  Clock, MapPin, User, UploadCloud, X
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
    if (selectedDepartmentId) fetchTimetables();
  }, [selectedDepartmentId]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchTimetables = async () => {
    try {
      const res = await api.get('/timetable/admin/all', { params: { department_id: selectedDepartmentId } });
      setAllTimetables(res.data?.data || res.data || []);
    } catch (error) { toast.error(t('admin.messages.load_timetables_failed')); }
  };

  const handleUploadTimetable = async (e) => {
    e.preventDefault();
    if (!timetableFile || !selectedDepartmentId) { toast.error(t('admin.timetable.upload.select_req')); return; }
    const formData = new FormData();
    formData.append('file', timetableFile);
    formData.append('department_id', selectedDepartmentId);
    setUploadingTimetable(true);
    try {
      await api.post('/timetable/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(t('common.success'));
      setTimetableFile(null);
      fetchTimetables();
    } catch (error) { toast.error(error.response?.data?.message || t('admin.messages.upload_failed')); }
    finally { setUploadingTimetable(false); }
  };

  const handleDeleteTimetable = async () => {
    if (!selectedDepartmentId || !window.confirm(t('admin.timetable.delete_confirm'))) return;
    try {
      await api.delete(`/timetable/admin/${selectedDepartmentId}`);
      toast.success(t('common.success'));
      setAllTimetables([]);
    } catch (error) { toast.error(t('admin.messages.delete_timetables_failed')); }
  };

  const dayEntries = allTimetables.filter(e => e.day === activeDay);
  const toggleHidden = () => setShowHidden(!showHidden);

  const filteredDepartments = departments.filter(d => allTimetables.some(t => t.department_id == d.id));

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.timetable.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.timetable.manage')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleHidden} className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            {showHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={handleDeleteTimetable} disabled={!selectedDepartmentId} className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Department Select + Upload */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <select value={selectedDepartmentId} onChange={(e) => setSelectedDepartmentId(e.target.value)}
            className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none">
            <option value="">{t('admin.timetable.select_dept')}</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <form onSubmit={handleUploadTimetable} className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-[#059669]/40 transition-colors text-sm text-gray-500">
            <FileSpreadsheet className="w-4 h-4" />
            {timetableFile ? <span className="text-[#059669] truncate max-w-[120px]">{timetableFile.name}</span> : t('admin.timetable.upload')}
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setTimetableFile(e.target.files[0])} className="hidden" />
          </label>
          <button type="submit" disabled={uploadingTimetable || !timetableFile || !selectedDepartmentId} className="px-3 py-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
          </button>
        </form>
      </div>

      {selectedDepartmentId && (
        <>
          {/* Day Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {DAYS.map(day => (
              <button key={day} onClick={() => setActiveDay(day)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
                  ${activeDay === day ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {t('days.' + day.toLowerCase())}
              </button>
            ))}
          </div>

          {/* Entries */}
          {dayEntries.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400">{t('admin.timetable.no_entries')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEntries
                .filter(e => showHidden || !e.is_hidden)
                .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                .map((entry, i) => (
                  <div key={entry.id || i} className={`bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-4 ${entry.is_hidden ? 'opacity-40' : ''}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#059669]" />
                        <span className="font-medium text-gray-900 dark:text-white">{entry.start_time || '—'} - {entry.end_time || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{entry.course_name || entry.subject || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{entry.doctor_name || entry.lecturer || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{entry.location || entry.hall || '—'}</span>
                      </div>
                    </div>
                    {entry.notes && <p className="text-xs text-gray-400 mt-2">{entry.notes}</p>}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimetableManager;
