import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Plus, Edit3, Trash2, X, Search, Briefcase, Building2, Tag, Check } from 'lucide-react';

const initialForm = {
  title: '', company_name: '', company_logo_url: '', track_ids: [],
  work_mode: '', description: '', requirements: '',
  duration: '', application_deadline: '', application_link: '', status: 'Open',
  min_level: 1
};

const InternshipManager = () => {
  const { t, i18n } = useTranslation();
  const [internships, setInternships] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(initialForm);

  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [trackNameInput, setTrackNameInput] = useState('');

  const fetchTracks = useCallback(async () => {
    try {
      const res = await api.get('/internships/tracks');
      setTracks(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/internships');
      setInternships(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_failed'));
    } finally { setLoading(false); }
  }, [t]);

  useEffect(() => { fetchInternships(); fetchTracks(); }, [fetchInternships, fetchTracks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/admin/internships/${editing.id}`, formData);
        toast.success(t('admin.internships.updated'));
      } else {
        await api.post('/admin/internships', formData);
        toast.success(t('admin.internships.created'));
      }
      setModalOpen(false);
      setEditing(null);
      setFormData(initialForm);
      fetchInternships();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.internships.delete_confirm'))) return;
    try {
      await api.delete(`/admin/internships/${id}`);
      toast.success(t('admin.internships.deleted'));
      fetchInternships();
    } catch (error) {
      toast.error(t('admin.messages.operation_failed'));
    }
  };

  const openEdit = (internship) => {
    setEditing(internship);
    setFormData({
      title: internship.title || '',
      company_name: internship.company_name || '',
      company_logo_url: internship.company_logo_url || '',
      track_ids: internship.tracks?.map(t => t.id) || [],
      work_mode: internship.work_mode || '',
      description: internship.description || '',
      requirements: internship.requirements || '',
      duration: internship.duration || '',
      application_deadline: internship.application_deadline ? internship.application_deadline.split('T')[0] : '',
      application_link: internship.application_link || '',
      status: internship.status || 'Open',
      min_level: internship.min_level || 1,
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    const name = trackNameInput.trim();
    if (!name) return;
    try {
      if (editingTrack) {
        await api.put(`/admin/internship-tracks/${editingTrack.id}`, { name });
        toast.success(t('common.success'));
      } else {
        await api.post('/admin/internship-tracks', { name });
        toast.success(t('common.success'));
      }
      setTrackNameInput('');
      setEditingTrack(null);
      fetchTracks();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    }
  };

  const handleDeleteTrack = async (id) => {
    if (!window.confirm(t('admin.internships.delete_confirm'))) return;
    try {
      await api.delete(`/admin/internship-tracks/${id}`);
      toast.success(t('admin.internships.deleted'));
      fetchTracks();
    } catch (error) {
      toast.error(t('admin.messages.operation_failed'));
    }
  };

  const openTrackEdit = (track) => {
    setEditingTrack(track);
    setTrackNameInput(track.name);
  };

  const openTrackCreate = () => {
    setEditingTrack(null);
    setTrackNameInput('');
  };

  const filtered = internships.filter(i =>
    i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const colors = {
      Open: 'bg-emerald-500/10 text-emerald-500',
      Closed: 'bg-red-500/10 text-red-500',
      Upcoming: 'bg-amber-500/10 text-amber-500',
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-500/10 text-gray-500'}`;
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto w-full px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.internships.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{internships.length} {t('admin.internships.active_count')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { openTrackCreate(); setTrackModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <Tag className="w-4 h-4" />{t('admin.internships.tracks')}
          </button>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />{t('admin.internships.create')}
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('admin.internships.search_placeholder')}
          className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400">{t('admin.internships.no_internships')}</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.company_logo_url ? (
                      <img src={item.company_logo_url} alt={item.company_name} className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</h3>
                    <p className="text-xs text-gray-400 truncate">{item.company_name}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={statusBadge(item.status)}>{t(`internships.status_${item.status?.toLowerCase()}`)}</span>
                {item.tracks?.map(t => (
                  <span key={t.id} className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider">{t.name}</span>
                ))}
                {item.duration && <span className="text-[10px] text-gray-400 px-1">{item.duration}</span>}
              </div>
              <div className="flex gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => openEdit(item)} className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" />{t('common.edit')}
                </button>
                <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setModalOpen(false); setEditing(null); }} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg relative z-10 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                  {editing ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {editing ? t('admin.internships.edit') : t('admin.internships.create')}
                </h3>
              </div>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.title')} *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.company_name')} *</label>
                  <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} required
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.company_logo_url')}</label>
                  <input type="url" value={formData.company_logo_url} onChange={(e) => setFormData({...formData, company_logo_url: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.track_tag')}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {tracks.map(track => {
                      const selected = formData.track_ids.includes(track.id);
                      return (
                        <button key={track.id} type="button" onClick={() => {
                          setFormData({
                            ...formData,
                            track_ids: selected
                              ? formData.track_ids.filter(id => id !== track.id)
                              : [...formData.track_ids, track.id]
                          });
                        }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${selected ? 'bg-indigo-500/20 text-indigo-500 border-indigo-500/40' : 'bg-transparent text-gray-500 border-gray-200 dark:border-gray-700 hover:border-indigo-500/30'}`}>
                          {track.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.work_mode')}</label>
                  <select value={formData.work_mode} onChange={(e) => setFormData({...formData, work_mode: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                    <option value="">--</option>
                    <option value="Online">{t('internships.online')}</option>
                    <option value="Offline">{t('internships.offline')}</option>
                    <option value="Online + Offline">{t('internships.online_offline')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.min_level')}</label>
                  <select value={formData.min_level} onChange={(e) => setFormData({...formData, min_level: Number(e.target.value)})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                    {[1,2,3,4].map(l => (
                      <option key={l} value={l}>{t('settings.level_' + l)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.duration')}</label>
                  <input type="text" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.application_deadline')}</label>
                  <input type="date" value={formData.application_deadline} onChange={(e) => setFormData({...formData, application_deadline: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.application_link')}</label>
                  <input type="url" value={formData.application_link} onChange={(e) => setFormData({...formData, application_link: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.status')}</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                    <option value="Open">{t('internships.status_open')}</option>
                    <option value="Closed">{t('internships.status_closed')}</option>
                    <option value="Upcoming">{t('internships.status_upcoming')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.description')}</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none resize-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.internships.form.requirements')}</label>
                <textarea value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none resize-none" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" disabled={loading}
                  className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {loading ? '...' : t('admin.internships.save')}
                </button>
                <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                  {t('admin.internships.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {trackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setTrackModalOpen(false); setEditingTrack(null); setTrackNameInput(''); }} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md relative z-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('admin.internships.tracks')}</h3>
              </div>
              <button onClick={() => { setTrackModalOpen(false); setEditingTrack(null); setTrackNameInput(''); }} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleTrackSubmit} className="flex gap-2">
                <input type="text" value={trackNameInput} onChange={(e) => setTrackNameInput(e.target.value)}
                  placeholder={editingTrack ? t('common.rename') : t('common.add') + '...'}
                  className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
                <button type="submit" className="px-3 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
                  {editingTrack ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </form>

              <div className="space-y-1 max-h-60 overflow-y-auto">
                {tracks.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">{t('admin.internships.no_internships')}</p>
                ) : (
                  tracks.map(track => (
                    <div key={track.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.02] group">
                      <span className="text-sm text-gray-900 dark:text-white">{track.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { openTrackEdit(track); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-amber-500 transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteTrack(track.id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipManager;
