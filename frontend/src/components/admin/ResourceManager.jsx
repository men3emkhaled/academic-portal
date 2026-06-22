import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../../services/api';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Plus, Edit3, Trash2, Video, FileText, Mic, Link as LinkIcon, PlayCircle, ExternalLink, BookOpen, X } from 'lucide-react';

const convertToEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
};

const ResourceManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({ type: 'video', title: '', url: '', batch: 2025 });
  const [loading, setLoading] = useState(false);
  const [recordingFile, setRecordingFile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [showForm, setShowForm] = useState(false);
  const dropdownRef = useRef(null);

  const uniqueCourses = useMemo(() => {
    const map = new Map();
    allCourses.forEach(course => { if (!map.has(course.name)) map.set(course.name, course.id); });
    return Array.from(map.entries()).map(([name, id]) => ({ name, id }));
  }, [allCourses]);

  const tabs = [
    { id: 'video', label: t('admin.resources.types.video'), icon: <Video className="w-4 h-4" /> },
    { id: 'recording', label: t('admin.resources.types.recording'), icon: <Mic className="w-4 h-4" /> },
    { id: 'pdf', label: t('admin.resources.types.pdf'), icon: <FileText className="w-4 h-4" /> },
    { id: 'summary', label: t('admin.resources.types.summary'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'playlist', label: t('admin.resources.types.playlist'), icon: <PlayCircle className="w-4 h-4" /> }
  ];

  const filteredResources = useMemo(() => resources.filter(r => r.type === activeTab), [resources, activeTab]);
  const getTabCount = (tabId) => resources.filter(r => r.type === tabId).length;

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (selectedCourseName) fetchResources();
  }, [selectedCourseName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setAllCourses(res.data);
    } catch (err) { toast.error(t('admin.messages.load_courses_failed')); }
  };

  const fetchResources = async () => {
    const selectedCourse = uniqueCourses.find(c => c.name === selectedCourseName);
    if (!selectedCourse) return;
    try {
      const res = await api.get(`/resources/course/${selectedCourse.id}`);
      setResources(res.data);
    } catch (err) { toast.error(t('admin.messages.load_resources_failed')); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error(t('admin.messages.title_req')); return; }
    if (formData.type === 'recording' && !recordingFile && !editingResource) { toast.error(t('admin.messages.file_req')); return; }
    if (formData.type !== 'recording' && !formData.url.trim()) { toast.error(t('admin.messages.url_req')); return; }
    if (!selectedCourseName) { toast.error(t('admin.messages.select_course_req')); return; }
    setLoading(true);
    try {
      let finalUrl = formData.url;
      if (formData.type === 'video') {
        finalUrl = convertToEmbedUrl(formData.url);
      } else if (formData.type === 'recording') {
        if (recordingFile) {
          const fileName = `${Date.now()}-${recordingFile.name}`;
          const { data, error } = await supabase.storage.from('course-recordings').upload(fileName, recordingFile, { cacheControl: '3600', upsert: false });
          if (error) throw error;
          const { data: publicUrlData } = supabase.storage.from('course-recordings').getPublicUrl(fileName);
          finalUrl = publicUrlData.publicUrl;
        } else { finalUrl = formData.url; }
      }
      const selectedCourse = uniqueCourses.find(c => c.name === selectedCourseName);
      const payload = { ...formData, url: finalUrl, courseId: selectedCourse.id };
      if (editingResource) {
        await api.put(`/resources/${editingResource.id}`, payload);
      } else {
        await api.post('/resources', payload);
      }
      toast.success(t('common.success'));
      resetForm();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.messages.save_resource_failed'));
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success(t('common.success'));
      fetchResources();
    } catch (err) { toast.error(t('admin.messages.delete_resource_failed')); }
  };

  const startEdit = (resource) => {
    setEditingResource(resource);
    setFormData({ type: resource.type, title: resource.title, url: resource.url, batch: resource.batch || 2025 });
    setRecordingFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingResource(null);
    setFormData({ type: 'video', title: '', url: '', batch: 2025 });
    setRecordingFile(null);
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.resources.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.resources.stored_units')}: {resources.length}</p>
        </div>
      </div>

      {/* Course Selector + Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="relative w-full sm:w-80" ref={dropdownRef}>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{t('admin.resources.select_course')}</label>
          <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none">
            <span className="truncate">{selectedCourseName || t('admin.resources.select_course')}</span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {uniqueCourses.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">{t('admin.messages.load_courses_failed')}</div>
              ) : (
                uniqueCourses.map(c => (
                  <button key={c.id} type="button" onClick={() => { setSelectedCourseName(c.name); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedCourseName === c.name ? 'bg-[#059669] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    {c.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <button onClick={() => { if (!selectedCourseName) { toast.error(t('admin.messages.select_course_req')); return; } setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />{t('admin.resources.modals.new_resource')}
        </button>
      </div>

      {/* Tabs */}
      {selectedCourseName && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => {
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                {tab.icon}
                <span>{tab.label}</span>
                {count > 0 && <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>{count}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!selectedCourseName ? (
          <div className="col-span-full text-center py-16 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            {t('admin.resources.course_hint')}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="col-span-full text-center py-16 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            {t('admin.resources.no_resources')}
          </div>
        ) : (
          filteredResources.map((item) => (
            <div key={item.id} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-[#059669]/30 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-gray-400 uppercase">{item.type}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#059669]/10 text-[#059669]">{t('admin.resources.year_label', { year: item.batch || 2025 })}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(item)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">{item.title}</h3>
              {activeTab === 'video' && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                  <iframe src={convertToEmbedUrl(item.url)} title={item.title} className="w-full h-full border-none" />
                </div>
              )}
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-[#059669] hover:underline pt-3 border-t border-gray-100 dark:border-gray-800">
                <ExternalLink className="w-3.5 h-3.5" />
                {activeTab === 'recording' ? t('admin.resources.modals.download') : t('admin.resources.modals.open_link')}
              </a>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={resetForm} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg relative z-10 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                  {editingResource ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {editingResource ? t('admin.resources.modals.edit_resource') : t('admin.resources.modals.new_resource')}
                </h3>
              </div>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.resources.modals.resource_type')}</label>
                <select value={formData.type} onChange={(e) => { setFormData({ ...formData, type: e.target.value }); setRecordingFile(null); }}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                  <option value="video">{t('admin.resources.types.video')}</option>
                  <option value="pdf">{t('admin.resources.types.pdf')}</option>
                  <option value="summary">{t('admin.resources.types.summary')}</option>
                  <option value="playlist">{t('admin.resources.types.playlist')}</option>
                  <option value="recording">{t('admin.resources.types.recording')}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.resources.modals.resource_title')} *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.resources.modals.target_year')}</label>
                  <select value={formData.batch} onChange={(e) => setFormData({ ...formData, batch: parseInt(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                    {[2026, 2025, 2024, 2023].map(yr => <option key={yr} value={yr}>{yr}</option>)}
                  </select>
                </div>
              </div>
              {formData.type === 'recording' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.resources.modals.upload_file')}</label>
                  <label className="flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#059669]/50 transition-colors">
                    <Mic className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500">{recordingFile ? recordingFile.name : (editingResource ? t('admin.resources.archive_locked') : t('admin.resources.modals.upload_hint'))}</span>
                    <input type="file" accept="audio/*,video/*" onChange={(e) => setRecordingFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.resources.modals.resource_url')} *</label>
                  <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {loading ? '...' : (editingResource ? t('common.save') : t('admin.resources.modals.new_resource'))}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
