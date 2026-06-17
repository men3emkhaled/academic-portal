import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, CheckCircle2, BookOpen, Target,
  Award, GraduationCap, Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  LoadingState,
  SegmentedTabs,
} from '@/components/common';

const StudentGrades = () => {
  const { student, logout } = useStudentAuth();
  const { gradesData, loadingGrades } = useStudentData();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isAr = i18n.language === 'ar';
  const allGrades = gradesData.grades || [];
  const loading = loadingGrades;

  const [selectedSemester, setSelectedSemester] = useState(null);

  const availableSemesters = useMemo(() => {
    // Use semester from the course data (always present even if no grades yet)
    const sems = allGrades
      .map(g => g.semester)
      .filter(s => s !== null && s !== undefined);
    return [...new Set(sems)].sort((a, b) => Number(a) - Number(b));
  }, [allGrades]);

  useEffect(() => {
    if (availableSemesters.length > 0 && selectedSemester === null) {
      setSelectedSemester(availableSemesters[0]);
    }
  }, [availableSemesters, selectedSemester]);

  const grades = useMemo(() => {
    if (selectedSemester === null) return allGrades;
    return allGrades.filter(g => Number(g.semester) === Number(selectedSemester));
  }, [allGrades, selectedSemester]);

  const summary = useMemo(() => {
    let totalEarned = 0;
    let totalPossible = 0;
    let coursesPassed = 0;

    grades.forEach(grade => {
      const midterm = parseFloat(grade.midterm_score) || 0;
      const practical = parseFloat(grade.practical_score) || 0;
      const oral = parseFloat(grade.oral_score) || 0;

      const earned = midterm + practical + oral;
      totalPossible += grade.max_score;
      totalEarned += earned;

      const allExist = (grade.midterm_score !== null && grade.midterm_score !== undefined) &&
                       (grade.practical_score !== null && grade.practical_score !== undefined);

      if (allExist) {
        const percentage = (earned / grade.max_score) * 100;
        if (percentage >= 50) coursesPassed++;
      }
    });

    const overallPercentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

    return {
      totalEarned,
      totalPossible,
      overallPercentage,
      coursesPassed,
      totalCourses: grades.length
    };
  }, [grades]);

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const getGradeColor = (score, maxScore) => {
    if (score === null || score === undefined) return 'text-muted-foreground';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 50) return 'text-primary';
    return 'text-destructive';
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return '-';
    const num = Number(score);
    return Number.isInteger(num) ? num : num.toFixed(1).replace(/\.0$/, '');
  };

  const getCourseStatus = (grade) => {
    const midterm = parseFloat(grade.midterm_score) || 0;
    const practical = parseFloat(grade.practical_score) || 0;
    const oral = parseFloat(grade.oral_score) || 0;
    const total = midterm + practical + oral;
    const percentage = (total / grade.max_score) * 100;
    if (grade.midterm_score !== null && grade.practical_score !== null) {
        return percentage >= 50 ? t('grades.passing') : t('grades.failing');
    }
    return t('grades.pending');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={isAr ? 'rtl' : 'ltr'}>
        <Sidebar onLogout={handleLogout} />
        <main className="md:ps-72 min-h-screen">
          <LoadingState />
        </main>
      </div>
    );
  }

  const semesterOptions = availableSemesters.map((sem) => ({
    value: sem,
    label: isAr ? `الترم ${sem}` : `Semester ${sem}`,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen">
        <PageContainer>
          <PageHeader
            icon={TrendingUp}
            title={t('mavi.academic')}
            description={t('grades.title')}
            actions={
              availableSemesters.length > 0 ? (
                <SegmentedTabs
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                  options={semesterOptions}
                />
              ) : null
            }
          />

          {/* Stat row */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={t('grades.overall')}
              value={`${summary.overallPercentage || 0}%`}
              icon={Award}
              accent
            />
            <StatCard
              label={t('grades.total_score')}
              value={summary.totalEarned || 0}
              icon={Target}
              hint={`/ ${summary.totalPossible || 0} ${t('mavi.max_potential')}`}
            />
            <StatCard
              label={t('grades.passed')}
              value={summary.coursesPassed || 0}
              icon={CheckCircle2}
            />
            <StatCard
              label={t('grades.enrolled')}
              value={grades.length}
              icon={BookOpen}
            />
          </div>

          {/* Academic standing */}
          <SectionCard
            title={isAr ? 'حالة القيد الأكاديمي' : 'Academic Standing'}
            description={isAr ? 'المستوى الدراسي والشعبة المقيد بها الطالب حالياً' : 'Current registered level and section details'}
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                  <GraduationCap className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{isAr ? 'المستوى' : 'Level'}</p>
                  <p className="text-sm font-medium text-foreground">
                    {isAr ? `مستوى ${student?.level || 1}` : `Level ${student?.level || 1}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                  <Layers className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{isAr ? 'الشعبة' : 'Section'}</p>
                  <p className="text-sm font-medium text-foreground">
                    {isAr ? `شعبة ${student?.section || '—'}` : `Section ${student?.section || '—'}`}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Grades breakdown */}
          <SectionCard
            title={t('grades.breakdown')}
            actions={
              <span className="text-xs text-muted-foreground">
                {grades.length} {t('mavi.total')}
              </span>
            }
            bodyClassName="p-0"
          >
            {grades.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={BookOpen}
                  title={t('grades.breakdown')}
                  description={t('mavi.grades_desc')}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                {grades.map((grade, idx) => {
                  const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                  const status = getCourseStatus(grade);
                  const isPassing = status === t('grades.passing');
                  const isFailing = status === t('grades.failing');
                  const statusVariant = isPassing ? 'success' : isFailing ? 'danger' : 'neutral';

                  return (
                    <div
                      key={grade?.course_id || idx}
                      className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                            <BookOpen className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">{t('mavi.module')} {idx + 1}</p>
                            <h3 className={`truncate text-sm font-medium text-foreground ${isAr ? 'font-arabic' : ''}`}>
                              {grade.course_name}
                            </h3>
                          </div>
                        </div>
                        <StatusBadge variant={statusVariant}>{status}</StatusBadge>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground">{t('grades.midterm')}</span>
                          <span className={`text-sm font-semibold ${getGradeColor(grade.midterm_score, grade.midterm_max)}`}>
                            {formatScore(grade.midterm_score)}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground">{t('grades.practical')}</span>
                          <span className={`text-sm font-semibold ${getGradeColor(grade.practical_score, grade.practical_max)}`}>
                            {formatScore(grade.practical_score)}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground">{t('grades.oral')}</span>
                          <span className={`text-sm font-semibold ${getGradeColor(grade.oral_score, grade.oral_max)}`}>
                            {formatScore(grade.oral_score)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                        <span className="text-xs font-medium text-muted-foreground">{t('grades.total_score')}</span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-semibold ${getGradeColor(total, grade.max_score)}`}>
                            {formatScore(total)}
                          </span>
                          <span className="text-xs text-muted-foreground">/ {grade.max_score}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </PageContainer>
      </main>
    </div>
  );
};

export default StudentGrades;
