import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, MoreVertical, Users, Archive, Edit3, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  SearchInput,
  Toolbar,
  FormField,
  Modal,
  SegmentedTabs,
  DataTable,
} from '@/components/common';

const DoctorCourses = ({ courses, onRefresh }) => {
  const { doctorApi } = useDoctorAuth();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState('active'); // active, archive
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  const [formData, setFormData] = useState({
    department_id: '',
    course_id: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (showAddModal && formData.department_id) {
      fetchCoursesByDepartment(formData.department_id);
    } else {
      setAvailableCourses([]);
    }
  }, [formData.department_id, showAddModal]);

  const fetchDepartments = async () => {
    try {
      const res = await doctorApi('get', '/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  const fetchCoursesByDepartment = async (deptId) => {
    try {
      const res = await doctorApi('get', `/courses/department/${deptId}`);
      const currentCourseIds = courses.map(c => c.id);
      const filtered = (res.data || []).filter(c => !currentCourseIds.includes(c.id));
      setAvailableCourses(filtered);
    } catch (err) {
      toast.error('Failed to load courses');
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(null);
    setFormData({ department_id: '', course_id: '', description: '' });
  };

  const handleAssignCourse = async (e) => {
    e.preventDefault();
    if (!formData.course_id) return toast.error('Please select a course');

    setLoading(true);
    try {
      await doctorApi('post', '/doctor/courses/assign', { courseId: formData.course_id });
      if (formData.description) {
         await doctorApi('put', `/doctor/courses/${formData.course_id}`, { description: formData.description });
      }
      toast.success('Course added successfully');
      setShowAddModal(false);
      setFormData({ department_id: '', course_id: '', description: '' });
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doctorApi('put', `/doctor/courses/${showEditModal.id}`, { description: formData.description });
      toast.success('Course updated');
      setShowEditModal(null);
      setFormData({ department_id: '', course_id: '', description: '' });
      onRefresh();
    } catch (err) {
      toast.error('Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async (courseId, currentStatus) => {
    const nextStatus = currentStatus === true ? false : true;
    try {
      await doctorApi('patch', `/doctor/courses/${courseId}/archive`, { is_archived: nextStatus });
      toast.success(nextStatus ? 'Archived' : 'Activated');
      if (onRefresh) await onRefresh();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openEdit = (course) => {
    setFormData({ department_id: course.department_id, course_id: course.id, description: course.description || '' });
    setShowEditModal(course);
  };

  const filteredCourses = courses.filter(c => {
    const isTabMatch = activeTab === 'active' ? !c.is_archived : c.is_archived;
    const isSearchMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const isDeptMatch = deptFilter === 'all' || c.department_id.toString() === deptFilter;
    return isTabMatch && isSearchMatch && isDeptMatch;
  });

  const activeCount = courses.filter(c => !c.is_archived).length;
  const archivedCount = courses.filter(c => c.is_archived).length;
  const totalStudents = courses.reduce((sum, c) => sum + (c.student_count || 0), 0);

  const columns = [
    {
      key: 'course',
      header: 'Course',
      render: (course) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
            <Layers className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{course.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-medium">{course.code}</span>
              <span>Sem {course.semester}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'students',
      header: 'Students',
      headClassName: 'hidden md:table-cell',
      cellClassName: 'hidden md:table-cell',
      render: (course) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-4" />
          <span>{course.student_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'syllabus',
      header: 'Syllabus',
      headClassName: 'hidden lg:table-cell',
      cellClassName: 'hidden lg:table-cell',
      render: (course) => {
        const progress = Math.min(100, Math.max(25, (course.id * 13) % 100));
        return (
          <div className="flex items-center gap-2 min-w-40">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <span className="w-9 shrink-0 text-end text-xs text-muted-foreground">{progress}%</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (course) => (
        course.is_archived
          ? <StatusBadge variant="neutral">Archived</StatusBadge>
          : <StatusBadge variant="success">Active</StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'w-10',
      cellClassName: 'text-end',
      render: (course) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Actions">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isAr ? 'start' : 'end'} className="w-44">
            <DropdownMenuItem onSelect={() => openEdit(course)}>
              <Edit3 className="size-4" /> Manage Info
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleToggleArchive(course.id, course.is_archived)}>
              <Archive className="size-4" />
              {course.is_archived ? 'Activate' : 'Archive'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookOpen}
        title="Courses Hub"
        description="Manage your academic curriculum, monitor class performance, and organize your teaching resources."
        actions={
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="size-4" />
            <span>Enroll New Course</span>
          </Button>
        }
      />

      {/* Summary metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Active Courses" value={activeCount} icon={BookOpen} accent />
        <StatCard label="Total Students" value={totalStudents} icon={Users} />
        <StatCard label="Archived" value={archivedCount} icon={Archive} />
      </div>

      {/* Controls */}
      <Toolbar>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SegmentedTabs
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: 'active', label: 'Active', count: activeCount },
              { value: 'archive', label: 'Archived', count: archivedCount },
            ]}
          />
          <SearchInput
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => (
              <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Toolbar>

      {/* Courses list */}
      <SectionCard bodyClassName="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${deptFilter}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <DataTable
              columns={columns}
              rows={filteredCourses}
              getRowKey={(row) => row.id}
              className="rounded-none border-0"
              empty={
                <EmptyState
                  icon={BookOpen}
                  title="No courses found"
                  description={
                    activeTab === 'active'
                      ? 'Enroll in a course to start managing your student materials.'
                      : 'No archived courses match your filters.'
                  }
                  action={
                    activeTab === 'active' ? (
                      <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="size-4" />
                        <span>Enroll New Course</span>
                      </Button>
                    ) : null
                  }
                />
              }
            />
          </motion.div>
        </AnimatePresence>
      </SectionCard>

      {/* Add / Edit Modal */}
      <Modal
        open={showAddModal || !!showEditModal}
        onOpenChange={(open) => { if (!open) closeModals(); }}
        size="lg"
        title={showAddModal ? 'Course Enrollment' : 'Edit Curriculum'}
        description={
          showAddModal
            ? 'Join a new academic course to begin managing your student materials.'
            : 'Keep your course description up to date for your students.'
        }
        footer={
          <Button
            type="submit"
            form="course-form"
            disabled={loading || (showAddModal && !formData.course_id)}
          >
            {loading
              ? (showAddModal ? 'Adding...' : 'Updating...')
              : (showAddModal ? 'Add to My Courses' : 'Update Curriculum')}
          </Button>
        }
      >
        <form
          id="course-form"
          onSubmit={showAddModal ? handleAssignCourse : handleUpdateCourse}
          className="space-y-4"
        >
          {showAddModal && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Department" required>
                <Select
                  value={formData.department_id ? formData.department_id.toString() : ''}
                  onValueChange={(val) => setFormData({ ...formData, department_id: val, course_id: '' })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Academic Course" required>
                <Select
                  value={formData.course_id ? formData.course_id.toString() : ''}
                  onValueChange={(val) => setFormData({ ...formData, course_id: val })}
                  disabled={!formData.department_id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          )}

          <FormField label="Description / Overview" htmlFor="course-description">
            <Textarea
              id="course-description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter a professional overview of your teaching approach..."
              className="resize-none"
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorCourses;
