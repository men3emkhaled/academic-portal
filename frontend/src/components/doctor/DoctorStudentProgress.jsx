import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { Activity, Users } from 'lucide-react';
import {
  PageHeader,
  Toolbar,
  SearchInput,
  DataTable,
  EmptyState,
} from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const DoctorStudentProgress = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    if (selectedCourseId) {
      fetchProgress();
    } else {
      setStudents([]);
    }
  }, [selectedCourseId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/progress/${selectedCourseId}`);
      setStudents(res.data);
    } catch (err) {
      toast.error('Failed to load student progress');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students
    .filter(s =>
      s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.student_id).includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return (a.student_name || '').localeCompare(b.student_name || '');
      if (sortBy === 'quiz') return (b.avg_quiz_score || 0) - (a.avg_quiz_score || 0);
      if (sortBy === 'grade') return (b.grade_total || 0) - (a.grade_total || 0);
      if (sortBy === 'progress') return (b.progress_percentage || 0) - (a.progress_percentage || 0);
      return 0;
    });

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-muted-foreground';
    if (score >= 75) return 'text-primary';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-destructive';
  };

  // Neutral track + green fill. Keeps the same threshold computation as before;
  // fill stays green (primary) for the calm single-accent look.
  const getProgressBar = (value, max = 100) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    );
  };

  const columns = [
    {
      key: 'student',
      header: 'Student',
      headClassName: 'min-w-[180px]',
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" className="shrink-0">
            <AvatarImage src={s.avatar_url} alt={s.student_name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {s.student_name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{s.student_name}</p>
            <p className="text-xs text-muted-foreground">
              ID: {s.student_id} {s.section && `· Sec ${s.section}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'quizzes',
      header: 'Quizzes',
      headClassName: 'min-w-[140px]',
      render: (s) => (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Completed</span>
            <span className="text-xs font-medium text-foreground">{s.quizzes_completed}/{s.quizzes_total}</span>
          </div>
          {getProgressBar(s.quizzes_completed, s.quizzes_total)}
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Avg Score',
      headClassName: 'min-w-[140px]',
      render: (s) => (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Score</span>
            <span className={`text-xs font-semibold ${getScoreColor(s.avg_quiz_score)}`}>
              {s.avg_quiz_score !== null ? `${s.avg_quiz_score}%` : '—'}
            </span>
          </div>
          {getProgressBar(s.avg_quiz_score || 0)}
        </div>
      ),
    },
    {
      key: 'tasks',
      header: 'Tasks',
      headClassName: 'min-w-[140px]',
      render: (s) => (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Completed</span>
            <span className="text-xs font-medium text-foreground">{s.tasks_completed}/{s.tasks_total}</span>
          </div>
          {getProgressBar(s.tasks_completed, s.tasks_total)}
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      headClassName: 'min-w-[140px]',
      render: (s) => (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className={`text-xs font-semibold ${
              s.grade_total >= 30 ? 'text-primary' : s.grade_total >= 20 ? 'text-amber-600 dark:text-amber-400' : 'text-destructive'
            }`}>
              {s.grade_total}/40
            </span>
          </div>
          {getProgressBar(s.grade_total, 40)}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Activity}
        title="Student Progress"
        description="Track quiz completion, task progress, and overall performance"
      />

      {/* Controls */}
      <Toolbar>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
          <Select
            value={selectedCourseId}
            onValueChange={(value) => { setSelectedCourseId(value); setSearchTerm(''); }}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {students.length > 0 && (
            <>
              <SearchInput
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sm:w-56"
              />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort: Name</SelectItem>
                  <SelectItem value="quiz">Sort: Quiz Score</SelectItem>
                  <SelectItem value="grade">Sort: Grade</SelectItem>
                  <SelectItem value="progress">Sort: Progress</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </Toolbar>

      {/* Content */}
      {!selectedCourseId ? (
        <EmptyState
          icon={Users}
          title="Select a course to view student progress"
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(s) => s.student_id}
          loading={loading}
          empty={
            <EmptyState
              icon={Users}
              title={searchTerm ? 'No students match your search' : 'No students enrolled in this course'}
            />
          }
        />
      )}
    </div>
  );
};

export default DoctorStudentProgress;
