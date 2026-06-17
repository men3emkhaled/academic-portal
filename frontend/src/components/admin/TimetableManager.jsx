import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar, Upload, Trash2,
  Eye, EyeOff, FileSpreadsheet,
  Clock, MapPin, User, Filter, UploadCloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  PageHeader, SectionCard, StatCard, DataTable, SegmentedTabs,
  StatusBadge, EmptyState, FormField, Toolbar,
} from '@/components/common';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TimetableManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
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

  const dayOptions = DAYS.map(day => ({ value: day, label: t(`admin.timetable.days.${day}`) }));

  const columns = [
    {
      key: 'time',
      header: t('admin.timetable.time_details'),
      cellClassName: 'align-top',
      render: (entry) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground tabular-nums">
            <Clock className="size-4 text-primary" />
            {entry.start_time?.substring(0, 5)} — {entry.end_time?.substring(0, 5)}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge variant="neutral">{entry.department_code || t('admin.timetable.faculty_label')}</StatusBadge>
            <StatusBadge variant="accent">{t('admin.timetable.section')} {entry.section}</StatusBadge>
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      header: t('admin.timetable.course_instructor'),
      cellClassName: 'align-top',
      render: (entry) => (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">{entry.course_name}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5" /> {entry.instructor || t('common.unassigned')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {entry.location || t('common.n_a')}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: t('admin.timetable.type'),
      cellClassName: 'align-top',
      render: (entry) => (
        <StatusBadge variant="neutral">{entry.type || t('admin.timetable.lecture_label')}</StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: t('admin.timetable.actions'),
      headClassName: 'text-end',
      cellClassName: 'align-top text-end',
      render: (entry) => (
        <div className="inline-flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleHideEntry(entry)}
            aria-label={entry.is_hidden ? t('admin.timetable.visibility.show') : t('admin.timetable.visibility.hide')}
            className={cn(entry.is_hidden ? 'text-amber-600 dark:text-amber-400' : 'text-primary')}
          >
            {entry.is_hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDeleteEntry(entry.id)}
            aria-label={t('admin.timetable.actions')}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={cn('space-y-6 text-start', isAr && 'font-arabic')}>
      <PageHeader
        icon={Calendar}
        title={t('admin.timetable.title')}
        description={t('admin.timetable.description')}
        actions={
          <StatCard
            label={t('admin.timetable.stats.scheduled_events')}
            value={allTimetables.length}
            icon={Clock}
            accent
            className="min-w-[180px] py-3"
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main: day switcher + class list */}
        <div className="space-y-4 xl:col-span-2">
          <Toolbar>
            <div className="min-w-0 overflow-x-auto">
              <SegmentedTabs value={activeDay} onChange={setActiveDay} options={dayOptions} size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="showHidden"
                checked={showHidden}
                onCheckedChange={setShowHidden}
              />
              <label htmlFor="showHidden" className="text-xs font-medium text-muted-foreground cursor-pointer">
                {t('admin.timetable.show_hidden')}
              </label>
            </div>
          </Toolbar>

          <SectionCard
            title={t(`admin.timetable.days.${activeDay}`)}
            actions={
              <StatusBadge variant="accent">
                {filteredTimetables.length} {t('admin.timetable.units_label')}
              </StatusBadge>
            }
            bodyClassName="p-0"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <DataTable
                  columns={columns}
                  rows={filteredTimetables}
                  getRowKey={(entry) => entry.id}
                  className="rounded-none border-0"
                  empty={
                    <div className="p-4">
                      <EmptyState
                        icon={Calendar}
                        title={t('admin.timetable.no_classes', { day: t(`admin.timetable.days.${activeDay}`) })}
                      />
                    </div>
                  }
                />
              </motion.div>
            </AnimatePresence>
          </SectionCard>
        </div>

        {/* Sidebar controls */}
        <div className="space-y-6">
          {/* Department filter + upload */}
          <SectionCard
            title={t('admin.timetable.filter_context')}
            bodyClassName="space-y-5"
          >
            <FormField label={t('admin.timetable.filter_context')} htmlFor="dept-filter">
              <Select
                value={selectedDepartmentId ? String(selectedDepartmentId) : 'all'}
                onValueChange={(v) => setSelectedDepartmentId(v === 'all' ? '' : parseInt(v, 10))}
              >
                <SelectTrigger id="dept-filter" className="w-full">
                  <span className="inline-flex items-center gap-2">
                    <Filter className="size-4 text-muted-foreground" />
                    <SelectValue placeholder={t('admin.timetable.all_faculty_nodes')} />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.timetable.all_faculty_nodes')}</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name} ({d.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="space-y-4 border-t pt-5">
              <div className="flex items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                  <UploadCloud className="size-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-foreground">{t('admin.timetable.upload.title')}</h3>
                  <p className="text-xs text-muted-foreground">{t('admin.timetable.upload.select_dept_hint')}</p>
                </div>
              </div>

              <form onSubmit={handleUploadTimetable} className="space-y-4">
                <label
                  htmlFor="timetableFileInput"
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 p-6 text-center transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg border bg-card text-primary">
                    <FileSpreadsheet className="size-5" />
                  </span>
                  <span className="text-sm">
                    {timetableFile ? (
                      <span className="font-medium text-foreground">{timetableFile.name}</span>
                    ) : (
                      <span className="text-muted-foreground">{t('admin.timetable.upload.click_to_upload')}</span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">.xlsx, .xls, .csv</span>
                  <input
                    id="timetableFileInput"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setTimetableFile(e.target.files[0])}
                    className="sr-only"
                  />
                </label>

                <Button
                  type="submit"
                  size="lg"
                  disabled={uploadingTimetable || !timetableFile || !selectedDepartmentId}
                  className="w-full"
                >
                  <Upload className="size-4" />
                  {uploadingTimetable ? t('common.loading') : t('admin.timetable.upload.upload_button')}
                </Button>
              </form>
            </div>
          </SectionCard>

          {/* Day visibility controls */}
          <SectionCard
            title={t('admin.timetable.visibility.title')}
            bodyClassName="p-0"
          >
            <ul className="divide-y">
              {DAYS.map(day => (
                <li key={day} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <span className="text-sm text-foreground">{t(`admin.timetable.days.${day}`)}</span>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => handleHideAllDay(day)}>
                      {t('admin.timetable.visibility.hide')}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleShowAllDay(day)}>
                      {t('admin.timetable.visibility.show')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Clear sections (destructive) */}
          <SectionCard
            title={t('admin.timetable.clear_sections.title')}
            description={t('admin.timetable.clear_sections.select_dept_hint')}
          >
            {selectedDepartmentId ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(sec => (
                  <Button
                    key={sec}
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSection(sec, selectedDepartmentId)}
                  >
                    <Trash2 className="size-3.5" />
                    {t('admin.timetable.clear_sections.sec_label', { num: sec })}
                  </Button>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Filter}
                title={t('admin.timetable.clear_sections.select_dept_hint')}
              />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default TimetableManager;
