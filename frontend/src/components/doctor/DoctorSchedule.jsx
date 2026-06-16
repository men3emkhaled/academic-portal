import React, { useState, useMemo, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Plus, Edit3, Trash2, Save,
  Zap, BarChart3, Building2, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  PageHeader, StatCard, StatusBadge, Modal, FormField,
} from '@/components/common';

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
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { y: 8, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const todayCount = groupedSchedule[DAYS[new Date().getDay()]]?.length || 0;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 pb-20">
      {/* Header */}
      <PageHeader
        icon={Calendar}
        title={t('doctor.timetable.title')}
        description={t('doctor.timetable.description')}
        actions={
          <>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="h-8 w-44" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.logs.filters.all_modules')}</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="size-4" />
              <span>{t('doctor.timetable.add_class')}</span>
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label={t('doctor.timetable.stats.today')} value={todayCount} icon={Zap} accent />
        <StatCard label={t('doctor.timetable.stats.weekly')} value={timetable?.length || 0} icon={BarChart3} />
        <StatCard label={t('doctor.timetable.stats.depts')} value={departments.length} icon={Building2} />
      </div>

      {/* Weekly calendar grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
        {DAYS.map((day) => (
          <div key={day} className="space-y-3">
            <div className="rounded-lg border bg-card px-3 py-2.5">
              <h3 className="text-center text-xs font-medium text-muted-foreground">
                {t(`admin.timetable.days.${day}`).slice(0, 3)}
              </h3>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {groupedSchedule[day].length > 0 ? (
                groupedSchedule[day].map((entry) => (
                  <motion.div
                    variants={itemVariants}
                    key={entry.id}
                    className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    {/* Green start-spine */}
                    <div className="absolute inset-y-0 start-0 w-1 bg-primary" />

                    <div className="mb-3 flex items-start justify-between gap-2">
                      <StatusBadge variant="neutral">{entry.type}</StatusBadge>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenModal(entry)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={t('doctor.timetable.edit_class')}
                        >
                          <Edit3 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(entry.id)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={t('doctor.timetable.messages.confirm_remove')}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <h4 className="mb-3 line-clamp-2 text-sm font-medium leading-snug text-foreground">
                      {entry.course_name}
                    </h4>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="size-3.5 shrink-0" />
                        <span>{entry.start_time.slice(0, 5)} – {entry.end_time.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{entry.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="size-3.5 shrink-0" />
                        <span className="truncate">{t('doctor.timetable.section_label')} {entry.section}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex h-28 flex-col items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                  {t('doctor.timetable.free')}
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Class Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal
            open={showModal}
            onOpenChange={setShowModal}
            size="lg"
            title={editingEntry ? t('doctor.timetable.edit_class') : t('doctor.timetable.add_class')}
            description={t('doctor.timetable.form.settings')}
            footer={
              <div className="flex w-full gap-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" form="schedule-form" disabled={loading} className="flex-1">
                  {loading ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  ) : (
                    <>
                      <Save className="size-4" />
                      <span>{editingEntry ? t('doctor.timetable.form.update_session') : t('doctor.timetable.add_class')}</span>
                    </>
                  )}
                </Button>
              </div>
            }
          >
            <form id="schedule-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label={t('doctor.timetable.form.dept')} required className="md:col-span-2">
                <Select
                  value={formData.department_id ? formData.department_id.toString() : ''}
                  onValueChange={(v) => setFormData({ ...formData, department_id: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('doctor.timetable.form.choose_dept')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label={t('doctor.timetable.form.course')} className="md:col-span-2">
                <Input
                  required
                  type="text"
                  placeholder="e.g. Programming 2"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {courses.map(c => {
                    const selected = formData.course_name === c.name;
                    return (
                      <Button
                        key={c.id}
                        type="button"
                        variant={selected ? 'default' : 'outline'}
                        size="xs"
                        onClick={() => setFormData({ ...formData, course_name: c.name, department_id: c.department_id })}
                      >
                        {c.name}
                      </Button>
                    );
                  })}
                </div>
              </FormField>

              <FormField label={t('doctor.timetable.form.section')} required>
                <Input
                  type="text"
                  required
                  placeholder="e.g. 1"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                />
              </FormField>

              <FormField label={t('doctor.timetable.form.type')}>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lecture">{t('doctor.timetable.types.lecture')}</SelectItem>
                    <SelectItem value="Section">{t('doctor.timetable.types.section')}</SelectItem>
                    <SelectItem value="Lab">{t('doctor.timetable.types.lab')}</SelectItem>
                    <SelectItem value="Office Hours">{t('doctor.timetable.types.office')}</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label={t('doctor.timetable.form.day')}>
                <Select
                  value={formData.day_of_week}
                  onValueChange={(v) => setFormData({ ...formData, day_of_week: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(day => (
                      <SelectItem key={day} value={day}>{t(`admin.timetable.days.${day}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label={t('doctor.timetable.form.location')} required>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Hall 4"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </FormField>

              <FormField label={t('doctor.timetable.form.start')} required>
                <Input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </FormField>

              <FormField label={t('doctor.timetable.form.end')} required>
                <Input
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </FormField>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorSchedule;
