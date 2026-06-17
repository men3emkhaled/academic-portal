import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, Award, Edit2,
  Save, X, BookOpen, Download,
  GraduationCap, Target, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  PageHeader, SectionCard, StatCard, StatusBadge,
  DataTable, EmptyState, SearchInput, Toolbar,
} from '@/components/common';

const DoctorGradesView = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState(null);
  const [editValues, setEditValues] = useState({ midterm_score: '', practical_score: '', oral_score: '' });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedCourseId) {
      fetchGrades();
    } else {
      setGrades([]);
    }
  }, [selectedCourseId]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/grades/${selectedCourseId}`);
      setGrades(res.data);
    } catch (err) {
      toast.error('Failed to synchronize grade data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (g) => {
    setEditingEnrollmentId(g.enrollment_id);
    setEditValues({
      midterm_score: g.midterm_score !== null ? g.midterm_score : '',
      practical_score: g.practical_score !== null ? g.practical_score : '',
      oral_score: g.oral_score !== null ? g.oral_score : ''
    });
  };

  const handleCancelEdit = () => {
    setEditingEnrollmentId(null);
    setEditValues({ midterm_score: '', practical_score: '', oral_score: '' });
  };

  const handleSaveGrade = async (enrollmentId) => {
    setSaving(true);
    try {
      await doctorApi('put', `/doctor/grades/${selectedCourseId}/enrollments/${enrollmentId}`, editValues);
      toast.success('Performance synchronized');
      setEditingEnrollmentId(null);
      fetchGrades();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update grade');
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    if (!grades.length) return toast.error('No data for export');

    const headers = ['Student ID', 'Student Name', 'Section', 'Midterm', 'Practical', 'Oral', 'Total'];
    const rows = grades.map(g => [
      g.student_id,
      g.student_name,
      g.section || 'N/A',
      g.midterm_score || 0,
      g.practical_score || 0,
      g.oral_score || 0,
      g.total_score || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const courseName = courses.find(c => c.id === parseInt(selectedCourseId))?.name || 'Course';
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${courseName}_Performance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Performance report exported');
  };

  const filteredGrades = grades.filter(g =>
    (g.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    String(g.student_id || '').includes(searchTerm)
  );

  const avgTotal = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.total_score || 0), 0) / (grades.length * 40) * 100).toFixed(1)
    : 0;

  const selectedCourse = courses.find(c => c.id === parseInt(selectedCourseId));

  const scoreCell = (value) =>
    value !== null && value !== undefined
      ? <span className="text-sm font-medium text-foreground">{value}</span>
      : <span className="text-sm text-muted-foreground">—</span>;

  const totalBadge = (g) => {
    const total = g.total_score !== null ? g.total_score : 0;
    const isHighPerformance = (g.total_score || 0) >= 30;
    const isRisk = (g.total_score || 0) < 20 && g.total_score !== null;
    const variant = isHighPerformance ? 'success' : isRisk ? 'danger' : 'neutral';
    return (
      <StatusBadge variant={variant}>
        {total} <span className="opacity-60">/40</span>
      </StatusBadge>
    );
  };

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (g) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-primary/10 text-sm font-medium text-primary">
            {g.avatar_url ? (
              <img src={g.avatar_url} alt={g.student_name} className="size-full object-cover" />
            ) : (
              g.student_name.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">{g.student_name}</div>
            <div className="text-xs text-muted-foreground">ID: {g.student_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'section',
      header: 'Section',
      headClassName: 'text-center',
      cellClassName: 'text-center',
      render: (g) => <span className="text-sm text-muted-foreground">{g.section || '—'}</span>,
    },
    {
      key: 'midterm',
      header: <>Midterm <span className="text-muted-foreground/60">/20</span></>,
      headClassName: 'text-center',
      cellClassName: 'text-center',
      render: (g) =>
        editingEnrollmentId === g.enrollment_id ? (
          <Input
            type="number" min="0" max="20" step="0.5"
            className="mx-auto h-8 w-20 text-center"
            value={editValues.midterm_score}
            onChange={(e) => setEditValues({ ...editValues, midterm_score: e.target.value })}
            autoFocus
          />
        ) : scoreCell(g.midterm_score),
    },
    {
      key: 'practical',
      header: <>Practical <span className="text-muted-foreground/60">/10</span></>,
      headClassName: 'text-center',
      cellClassName: 'text-center',
      render: (g) =>
        editingEnrollmentId === g.enrollment_id ? (
          <Input
            type="number" min="0" max="10" step="0.5"
            className="mx-auto h-8 w-20 text-center"
            value={editValues.practical_score}
            onChange={(e) => setEditValues({ ...editValues, practical_score: e.target.value })}
          />
        ) : scoreCell(g.practical_score),
    },
    {
      key: 'oral',
      header: <>Oral <span className="text-muted-foreground/60">/10</span></>,
      headClassName: 'text-center',
      cellClassName: 'text-center',
      render: (g) =>
        editingEnrollmentId === g.enrollment_id ? (
          <Input
            type="number" min="0" max="10" step="0.5"
            className="mx-auto h-8 w-20 text-center"
            value={editValues.oral_score}
            onChange={(e) => setEditValues({ ...editValues, oral_score: e.target.value })}
          />
        ) : scoreCell(g.oral_score),
    },
    {
      key: 'total',
      header: 'Total',
      headClassName: 'text-center',
      cellClassName: 'text-center',
      render: (g) =>
        editingEnrollmentId === g.enrollment_id
          ? <span className="text-xs text-muted-foreground">Editing…</span>
          : totalBadge(g),
    },
    {
      key: 'actions',
      header: 'Actions',
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (g) =>
        editingEnrollmentId === g.enrollment_id ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="icon-sm"
              onClick={() => handleSaveGrade(g.enrollment_id)}
              disabled={saving}
              aria-label="Save"
            >
              {saving
                ? <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                : <Save className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCancelEdit}
              disabled={saving}
              aria-label="Cancel"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleEditClick(g)}
            aria-label="Edit grades"
          >
            <Edit2 className="size-4" />
          </Button>
        ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <PageHeader
        icon={BarChart3}
        title="Academic Register"
        description="Record assessment results, analyze performance trends, and export academic reports."
        actions={
          selectedCourseId && grades.length > 0 ? (
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="size-4" />
              <span>Export CSV</span>
            </Button>
          ) : null
        }
      />

      {/* Course picker */}
      <SectionCard
        title="Course"
        description="Select a course to load its register."
        actions={
          <Select value={selectedCourseId ? String(selectedCourseId) : undefined} onValueChange={(v) => setSelectedCourseId(v)}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.name}{course.code ? ` · ${course.code}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => {
            const isActive = String(selectedCourseId) === String(course.id);
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-start transition-colors ${
                  isActive
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-card hover:bg-muted/50'
                }`}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md border ${
                    isActive ? 'border-primary/20 bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <BookOpen className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className={`truncate text-sm font-medium ${isActive ? 'text-foreground' : 'text-foreground'}`}>
                    {course.name}
                  </div>
                  {course.code && (
                    <div className={`text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{course.code}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Analytics summary */}
      <AnimatePresence>
        {selectedCourseId && grades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <StatCard label="Register Size" value={grades.length} icon={Users} hint="Active enrollments" />
            <StatCard label="Class Average" value={`${avgTotal}%`} icon={TrendingUp} accent hint="Average score" />
            <StatCard label="Target Score" value="40" icon={Award} hint="Maximum points" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register table */}
      <SectionCard
        header={
          <header className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                <GraduationCap className="size-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-medium text-foreground">
                  {selectedCourse ? selectedCourse.name : 'Student Register'}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Record and update student evaluations.</p>
              </div>
            </div>
            {selectedCourseId && grades.length > 0 && (
              <Toolbar className="sm:w-auto">
                <SearchInput
                  placeholder="Filter by name or ID…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Toolbar>
            )}
          </header>
        }
        bodyClassName="p-0"
      >
        {!selectedCourseId ? (
          <div className="p-4">
            <EmptyState
              icon={Target}
              title="No course selected"
              description="Select a course module above to load the academic register and manage student evaluations."
            />
          </div>
        ) : (
          <DataTable
            className="rounded-none border-0"
            columns={columns}
            rows={filteredGrades}
            loading={loading}
            getRowKey={(g) => g.enrollment_id || g.student_id}
            empty={
              <div className="p-4">
                <EmptyState
                  icon={Users}
                  title="No records found"
                  description="No students match your filter within this course."
                />
              </div>
            }
          />
        )}
      </SectionCard>
    </motion.div>
  );
};

export default DoctorGradesView;
