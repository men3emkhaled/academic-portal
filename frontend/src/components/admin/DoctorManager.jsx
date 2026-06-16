import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Plus, Edit3, Trash2, BookOpen, GraduationCap,
  Mail, Shield, Building2, UserCircle, Users, Box, Check
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  StatCard,
  Toolbar,
  SearchInput,
  DataTable,
  FormField,
  Modal,
  EmptyState,
  StatusBadge,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DoctorManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [doctors, setDoctors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add', 'edit', 'courses'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorCourses, setDoctorCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchCourses();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/doctors');
      setDoctors(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_doctors_failed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      console.error(t('admin.messages.load_courses_failed'));
    }
  };

  const handleOpenModal = (type, doctor = null) => {
    setModalType(type);
    setSelectedDoctor(doctor);

    if (type === 'add') {
      setFormData({ name: '', email: '', password: '', department: '' });
    } else if (type === 'edit') {
      setFormData({
        name: doctor.name,
        email: doctor.email,
        password: '',
        department: doctor.department || ''
      });
    } else if (type === 'courses') {
      fetchDoctorCourses(doctor.id);
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedDoctor(null);
    setDoctorCourses([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'add') {
        if (!formData.password) return toast.error(t('admin.messages.password_req'));
        await api.post('/admin/doctors', formData);
        toast.success(t('common.success'));
      } else if (modalType === 'edit') {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/doctors/${selectedDoctor.id}`, payload);
        toast.success(t('common.success'));
      }
      handleCloseModal();
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.doctors.delete_confirm'))) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      toast.success(t('common.success'));
      fetchDoctors();
    } catch (error) {
      toast.error(t('admin.messages.delete_doctor_failed'));
    }
  };

  const fetchDoctorCourses = async (doctorId) => {
    try {
      const res = await api.get(`/admin/doctors/${doctorId}/courses`);
      setDoctorCourses(res.data.map(c => c.id));
    } catch (error) {
      toast.error(t('admin.messages.load_doctor_courses_failed'));
    }
  };

  const handleToggleCourse = async (courseId) => {
    const isAssigned = doctorCourses.includes(courseId);
    try {
      if (isAssigned) {
        await api.delete(`/admin/doctors/${selectedDoctor.id}/courses/${courseId}`);
        setDoctorCourses(prev => prev.filter(id => id !== courseId));
        toast.success(t('admin.doctors.remove'));
      } else {
        await api.post(`/admin/doctors/${selectedDoctor.id}/courses/${courseId}`);
        setDoctorCourses(prev => [...prev, courseId]);
        toast.success(t('admin.doctors.assign'));
      }
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.toggle_course_failed'));
    }
  };

  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFormModal = modalType === 'add' || modalType === 'edit';

  const columns = [
    {
      key: 'name',
      header: t('admin.doctors.name'),
      render: (doctor) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
            {doctor.name?.charAt(0)}
          </div>
          <span className={`truncate font-medium text-foreground ${isAr ? 'font-arabic' : ''}`}>
            {doctor.name}
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      header: t('admin.doctors.email'),
      render: (doctor) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="size-4 shrink-0" />
          <span className="truncate">{doctor.email}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: t('admin.doctors.department'),
      render: (doctor) => (
        <StatusBadge variant="neutral">
          {doctor.department || t('admin.doctors.department')}
        </StatusBadge>
      ),
    },
    {
      key: 'courses',
      header: t('admin.doctors.assigned_courses'),
      headClassName: 'text-center',
      cellClassName: 'text-center',
      render: (doctor) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleOpenModal('courses', doctor)}
        >
          {t('admin.doctors.courses_count', { count: doctor.courses_count })}
        </Button>
      ),
    },
    {
      key: 'actions',
      header: t('admin.doctors.actions'),
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (doctor) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleOpenModal('edit', doctor)}
            aria-label={t('admin.doctors.edit_instructor')}
          >
            <Edit3 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleDelete(doctor.id)}
            aria-label={t('admin.doctors.actions')}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        icon={Users}
        title={t('admin.doctors.title')}
        description={t('admin.sidebar.tabs.doctors')}
        actions={
          <Button onClick={() => handleOpenModal('add')}>
            <Plus className="size-4" />
            {t('admin.doctors.add_instructor')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          accent
          icon={Users}
          label={t('admin.doctors.authorized_entities')}
          value={doctors.length}
        />
      </div>

      <Toolbar>
        <SearchInput
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Toolbar>

      <DataTable
        columns={columns}
        rows={filteredDoctors}
        getRowKey={(doctor) => doctor.id}
        loading={loading}
        empty={
          <EmptyState
            icon={GraduationCap}
            title={t('admin.doctors.no_doctors')}
          />
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        open={isFormModal}
        onOpenChange={(open) => { if (!open) handleCloseModal(); }}
        size="md"
        title={modalType === 'add' ? t('admin.doctors.add_new_instructor') : t('admin.doctors.edit_instructor')}
        description={t('admin.doctors.identity_registration')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="doctor-form">
              <Check className="size-4" />
              {modalType === 'add' ? t('admin.doctors.create_instructor') : t('admin.doctors.save_changes')}
            </Button>
          </>
        }
      >
        <form id="doctor-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label={t('admin.doctors.full_name')} htmlFor="doctor-name" required>
            <div className="relative">
              <UserCircle className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="doctor-name"
                type="text"
                required
                className="ps-8"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
          </FormField>

          <FormField label={t('admin.doctors.email_label')} htmlFor="doctor-email" required>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="doctor-email"
                type="email"
                required
                className="ps-8"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@academy.edu"
              />
            </div>
          </FormField>

          <FormField
            label={t('admin.doctors.password')}
            htmlFor="doctor-password"
            hint={modalType === 'edit' ? t('admin.doctors.password_hint') : undefined}
          >
            <div className="relative">
              <Shield className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="doctor-password"
                type="password"
                required={modalType === 'add'}
                className="ps-8"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder={modalType === 'edit' ? t('admin.doctors.password_hint') : '••••••••'}
              />
            </div>
          </FormField>

          <FormField label={t('admin.doctors.department')} htmlFor="doctor-department">
            <div className="relative">
              <Building2 className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="doctor-department"
                type="text"
                className="ps-8"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Computer Science"
              />
            </div>
          </FormField>
        </form>
      </Modal>

      {/* Courses Assignment Modal */}
      <Modal
        open={modalType === 'courses' && !!selectedDoctor}
        onOpenChange={(open) => { if (!open) handleCloseModal(); }}
        size="lg"
        title={t('admin.doctors.assign_courses')}
        description={selectedDoctor ? `${t('admin.doctors.instructor_prefix')} ${selectedDoctor.name}` : undefined}
        contentClassName="max-h-[60vh] overflow-y-auto"
      >
        {courses.length === 0 ? (
          <EmptyState
            icon={Box}
            title={t('admin.doctors.void_registry')}
          />
        ) : (
          <div className="space-y-2">
            {courses.map(course => {
              const isAssigned = doctorCourses.includes(course.id);
              return (
                <div
                  key={course.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${
                        isAssigned
                          ? 'border-primary/20 bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <BookOpen className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{course.name}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{t('admin.doctors.semester')}: {course.semester}</span>
                        <span className="size-1 rounded-full bg-border" />
                        <span>{t('admin.doctors.dept_code')}: {course.department_id}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isAssigned ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleToggleCourse(course.id)}
                  >
                    {isAssigned ? t('admin.doctors.remove') : t('admin.doctors.assign')}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default DoctorManager;
