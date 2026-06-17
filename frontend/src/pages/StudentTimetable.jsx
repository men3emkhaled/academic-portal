import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserCheck, MapPin, Coffee,
  CheckCircle2, Clock,
  ArrowRight, QrCode, ScanLine, RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import studentApi from '../services/studentApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatusBadge,
  EmptyState,
  LoadingState,
  SegmentedTabs,
  Modal,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const StudentTimetable = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const { timetable: myTimetable, departmentTimetable, exams, loadingTimetable, loadingExams, gradesData } = useStudentData();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [viewMode, setViewMode] = useState('my-section'); // 'my-section' or 'all-sections'
  const [scheduleType, setScheduleType] = useState('lectures'); // 'lectures' or 'exams'
  const [qrModal, setQrModal] = useState(null); // { courseName, token } | null
  const [qrLoading, setQrLoading] = useState(false);

  const days = [
    { id: 'Sunday', name: t('days.sunday'), arabic: 'الأحد' },
    { id: 'Monday', name: t('days.monday'), arabic: 'الإثنين' },
    { id: 'Tuesday', name: t('days.tuesday'), arabic: 'الثلاثاء' },
    { id: 'Wednesday', name: t('days.wednesday'), arabic: 'الأربعاء' },
    { id: 'Thursday', name: t('days.thursday'), arabic: 'الخميس' },
    { id: 'Friday', name: t('days.friday'), arabic: 'الجمعة' },
    { id: 'Saturday', name: t('days.saturday'), arabic: 'السبت' },
  ];

  const isAr = i18n.language === 'ar';

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const isLectureCompleted = (entry) => {
    if (!entry.start_time) return false;
    const now = new Date();
    const [hours, minutes] = entry.start_time.split(':');
    const lectureTime = new Date();
    lectureTime.setHours(parseInt(hours), parseInt(minutes), 0);
    return now > new Date(lectureTime.getTime() + 10 * 60000);
  };

  const isLectureNow = (entry) => {
    if (!entry.start_time || !entry.end_time) return false;
    const now = new Date();
    const [startHours, startMinutes] = entry.start_time.split(':');
    const [endHours, endMinutes] = entry.end_time.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);
    const endTime = new Date();
    endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);
    return now >= startTime && now <= endTime;
  };

  useEffect(() => {
    const today = new Date();
    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
    setSelectedDay(todayName);
    const weekStart = getStartOfWeek(today);
    setCurrentWeekStart(weekStart);
  }, []);

  const loading = loadingTimetable || loadingExams;

  const timetable = useMemo(() => {
    if (viewMode === 'my-section') {
      return myTimetable || [];
    } else {
      if (!student?.department_id) return [];
      const data = departmentTimetable || [];
      const uniqueMap = new Map();
      for (const entry of data) {
        const key = `${entry.day_of_week}|${entry.start_time}|${entry.end_time}|${entry.course_name}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, { ...entry, sections: [entry.section] });
        } else {
          const existing = uniqueMap.get(key);
          if (!existing.sections.includes(entry.section)) {
            existing.sections.push(entry.section);
          }
        }
      }
      return Array.from(uniqueMap.values()).map(entry => ({
        ...entry,
        sections_text: entry.sections.sort((a, b) => a - b).join(', ')
      }));
    }
  }, [myTimetable, departmentTimetable, viewMode, student]);

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const handleLectureClick = useCallback(async (entry) => {
    let courseId = entry.course_id;
    if (!courseId && gradesData?.grades) {
      const matched = gradesData.grades.find(g =>
        g.course_name?.trim().toLowerCase() === entry.course_name?.trim().toLowerCase()
      );
      if (matched) {
        courseId = matched.course_id;
      }
    }

    if (!courseId) {
      toast.error(isAr ? 'عذراً، لم يتم العثور على رمز هذه المادة في حسابك' : 'Course ID not found for this lecture');
      return;
    }

    setQrLoading(true);
    setQrModal({ courseName: entry.course_name, courseId: courseId, token: null });
    try {
      const res = await studentApi.get(`/student/attendance/token/${courseId}`);
      setQrModal({ courseName: entry.course_name, courseId: courseId, token: res.data.token });
    } catch (err) {
      toast.error(isAr ? 'تعذر تحميل رمز QR' : 'Failed to load QR code');
      setQrModal(null);
    } finally {
      setQrLoading(false);
    }
  }, [gradesData, isAr]);

  const formatTime = (time) => {
    if (!time) return '—';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? t('common.pm') : t('common.am');
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimetableForDay = (dayId) => {
    if (scheduleType === 'lectures') {
      return timetable.filter(item => item.day_of_week === dayId);
    } else {
      return (exams || []).sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date)).map(exam => ({
        ...exam,
        type: exam.exam_type || 'Exam',
        instructor: exam.instructor || 'Department',
        location: exam.location || t('mavi.matrix_node')
      }));
    }
  };

  // Whether a row belongs to the student's own section (drives the green start-spine).
  const isOwnSection = (entry) => {
    if (!student?.section) return false;
    if (viewMode === 'my-section') return true;
    const own = String(student.section);
    if (Array.isArray(entry.sections)) {
      return entry.sections.map(String).includes(own);
    }
    if (entry.section != null) return String(entry.section) === own;
    return false;
  };

  const currentDayEntries = getTimetableForDay(selectedDay);
  const hasEntries = currentDayEntries.length > 0;
  const currentDayObj = days.find(d => d.id === selectedDay);
  const currentDayName = scheduleType === 'lectures'
    ? (isAr ? currentDayObj?.arabic : currentDayObj?.name)
    : t('timetable.exams');

  const scheduleTabs = [
    { value: 'lectures', label: t('timetable.lectures') },
    { value: 'exams', label: t('timetable.exams') },
  ];

  const sectionTabs = [
    { value: 'my-section', label: `${t('timetable.my_section')}${student?.section ? ` (${student.section})` : ''}` },
    { value: 'all-sections', label: t('timetable.all_sections') },
  ];

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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen">
        <PageContainer>
          <PageHeader
            title={scheduleType === 'lectures' ? currentDayName : t('timetable.exams')}
            description={t('sidebar.timetable')}
            actions={
              <SegmentedTabs
                value={scheduleType}
                onChange={setScheduleType}
                options={scheduleTabs}
              />
            }
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* LEFT COLUMN: Filters & Day Selector */}
            <div className="space-y-6 lg:col-span-4">
              <SectionCard title={t('common.filter')}>
                <SegmentedTabs
                  value={viewMode}
                  onChange={setViewMode}
                  options={sectionTabs}
                  className="w-full"
                />
              </SectionCard>

              <SectionCard
                title={t('common.navigation')}
                className={cn(
                  'transition-opacity',
                  scheduleType === 'exams' && 'pointer-events-none opacity-50'
                )}
              >
                <div className="grid grid-cols-2 gap-2">
                  {days.map(day => {
                    const isActive = selectedDay === day.id;
                    return (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDay(day.id)}
                        aria-pressed={isActive}
                        className={cn(
                          'flex items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                          isAr ? 'font-arabic' : '',
                          isActive
                            ? 'border-primary/30 bg-primary/10 text-primary'
                            : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        )}
                      >
                        {isAr ? day.arabic : day.name}
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            </div>

            {/* RIGHT COLUMN: Schedule */}
            <div className="lg:col-span-8">
              <SectionCard
                title={scheduleType === 'lectures' ? t('timetable.lectures') : t('timetable.exams')}
                actions={
                  <StatusBadge variant="neutral">
                    {currentDayEntries.length} {isAr ? 'محاضرة' : 'Lecture'}
                  </StatusBadge>
                }
                bodyClassName="p-3 sm:p-4"
              >
                {!hasEntries ? (
                  <EmptyState
                    icon={Coffee}
                    title={scheduleType === 'lectures' ? t('timetable.holiday') : t('timetable.no_exams')}
                    description={scheduleType === 'lectures' ? t('timetable.holiday_desc') : t('timetable.no_exams_desc')}
                  />
                ) : (
                  <div className="space-y-2">
                    {currentDayEntries.map((entry, idx) => {
                      const now = new Date();
                      const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];

                      let isLive = false;
                      let isCompleted = false;

                      if (scheduleType === 'lectures') {
                        const isToday = selectedDay === todayName;
                        isLive = isLectureNow(entry) && isToday;
                        isCompleted = isLectureCompleted(entry) && isToday;
                      } else if (entry.exam_date) {
                        const examDate = new Date(entry.exam_date);
                        const entryDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
                        const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                        if (entryDateOnly < todayDateOnly) {
                          isCompleted = true;
                        } else if (entryDateOnly.getTime() === todayDateOnly.getTime()) {
                          isLive = isLectureNow(entry);
                          isCompleted = isLectureCompleted(entry);
                        }
                      }

                      const ownSection = isOwnSection(entry);

                      return (
                        <div
                          key={entry?.id || idx}
                          onClick={() => scheduleType === 'lectures' ? handleLectureClick(entry) : navigate(`/student/course/${entry.course_id}`)}
                          className={cn(
                            'group relative flex cursor-pointer items-center justify-between gap-4 overflow-hidden rounded-lg border bg-card px-3 py-3 transition-colors hover:bg-muted/50',
                            isLive ? 'border-primary/40' : 'border-border'
                          )}
                        >
                          {/* Green start-spine for the student's own section */}
                          {ownSection && (
                            <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary" />
                          )}

                          <div className="flex min-w-0 flex-1 items-center gap-3 ps-1.5">
                            {/* Time chip */}
                            <div
                              className={cn(
                                'flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border',
                                isLive
                                  ? 'border-primary/30 bg-primary/10 text-primary'
                                  : 'border-border bg-muted/40 text-muted-foreground'
                              )}
                            >
                              <Clock className="mb-0.5 size-4" />
                              <span className="text-[10px] font-medium tabular-nums">{entry.start_time?.substring(0, 5)}</span>
                            </div>

                            <div className="min-w-0 flex-1 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <StatusBadge variant="neutral">{entry.type}</StatusBadge>
                                {isLive && (
                                  <StatusBadge variant="success">{t('mavi.live_now')}</StatusBadge>
                                )}
                                {viewMode === 'all-sections' && (
                                  <StatusBadge variant="neutral">SEC: {entry.sections_text}</StatusBadge>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <h3
                                  className={cn(
                                    'truncate text-sm font-medium text-foreground',
                                    isAr ? 'font-arabic' : '',
                                    isCompleted && 'text-muted-foreground line-through'
                                  )}
                                >
                                  {entry.course_name}
                                </h3>
                                {entry.exam_date && (
                                  <StatusBadge variant="success">
                                    {new Date(entry.exam_date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </StatusBadge>
                                )}
                              </div>

                              {(entry.instructor || entry.location) && (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                  {entry.instructor && (
                                    <div className="flex min-w-0 items-center gap-1.5">
                                      <UserCheck className="size-3.5 shrink-0" />
                                      <span className="truncate">{entry.instructor}</span>
                                    </div>
                                  )}
                                  {entry.location && (
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="size-3.5 shrink-0" />
                                      <span className="truncate">{entry.location}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Trailing action / status */}
                          <div
                            className={cn(
                              'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                              isCompleted
                                ? 'border-primary/30 bg-primary/10 text-primary'
                                : 'border-border bg-muted/40 text-muted-foreground group-hover:text-foreground'
                            )}
                          >
                            {isCompleted
                              ? <CheckCircle2 className="size-4" />
                              : scheduleType === 'lectures'
                                ? <QrCode className="size-4" />
                                : <ArrowRight className={cn('size-4', isAr && 'rotate-180')} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </div>

          </div>
        </PageContainer>
      </main>

      {/* QR Attendance Modal */}
      <Modal
        open={!!qrModal}
        onOpenChange={(open) => { if (!open) setQrModal(null); }}
        title={qrModal?.courseName}
        description={isAr ? 'رمز الحضور' : 'Attendance QR'}
        size="sm"
      >
        {qrModal && (
          <div className="flex flex-col items-center gap-6 py-2">
            <div className="flex items-center justify-center">
              {qrLoading || !qrModal.token ? (
                <div className="flex size-[220px] flex-col items-center justify-center gap-3 rounded-lg border bg-muted/40">
                  <ScanLine className="size-8 text-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    {isAr ? 'جارٍ التحميل...' : 'Loading...'}
                  </span>
                </div>
              ) : (
                <div className="rounded-lg border bg-white p-4">
                  <QRCodeSVG
                    value={qrModal.token}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#1a1a2e"
                    level="H"
                    includeMargin={false}
                  />
                </div>
              )}
            </div>

            {qrModal.token && (
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {isAr ? 'اعرض الرمز للدكتور لتسجيل حضورك' : 'Show this QR to your instructor'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLectureClick({ course_id: qrModal.courseId, course_name: qrModal.courseName })}
                >
                  <RefreshCw className="size-3.5" />
                  {isAr ? 'تحديث' : 'Refresh'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentTimetable;
