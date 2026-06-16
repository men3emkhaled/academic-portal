import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Video, FileText, BookOpen, Mic, ListVideo,
  CheckCircle, Circle, ListChecks, Play, Download,
  Activity, PlayCircle, ArrowRight, Monitor
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate, useLocation } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
  LoadingState,
  SegmentedTabs,
} from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const StudentMaterials = () => {
  const { student, logout } = useStudentAuth();
  const { gradesData, loadingGrades } = useStudentData();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(student?.batch || 2025);
  const [resources, setResources] = useState({ videos: [], pdfs: [], summaries: [], playlists: [], recordings: [] });
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('progress');
  const [progressData, setProgressData] = useState({ items: [], stats: { total: 0, completed: 0, pending: 0, percentage: 0 } });
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    studentApi.get('/student/active-semester')
      .then(res => setActiveSemester(Number(res.data?.active_semester) || null))
      .catch(() => setActiveSemester(null));
  }, []);

  const courses = useMemo(() => {
    const all = gradesData.grades || [];
    const grades = activeSemester !== null
      ? all.filter(g =>
          (g.enrollment_status === 'active' || !g.enrollment_status) &&
          Number(g.semester) >= activeSemester
        )
      : all.filter(g => g.enrollment_status === 'active' || !g.enrollment_status);
    const uniqueCourses = [];
    const courseMap = new Map();
    for (const grade of grades) {
      if (!courseMap.has(grade.course_id)) {
        courseMap.set(grade.course_id, {
          id: grade.course_id,
          name: grade.course_name,
          semester: grade.semester,
          description: grade.description || '',
          max_score: grade.max_score,
        });
        uniqueCourses.push(courseMap.get(grade.course_id));
      }
    }
    uniqueCourses.sort((a, b) => a.semester !== b.semester ? a.semester - b.semester : a.name.localeCompare(b.name));
    return uniqueCourses;
  }, [gradesData.grades, activeSemester]);

  useEffect(() => {
    if (!student) navigate('/student/login');
    else if (student.batch) setSelectedBatch(student.batch);
  }, [student, navigate]);

  useEffect(() => {
    if (!loadingGrades && courses.length > 0 && !selectedCourse) {
      // Check if we came from timetable with a specific course
      const courseNameFromState = location.state?.courseName;
      let targetCourse = courses[0];

      if (courseNameFromState) {
        const found = courses.find(c => c.name.toLowerCase() === courseNameFromState.toLowerCase());
        if (found) targetCourse = found;
      }

      setSelectedCourse(targetCourse);
      fetchAvailableBatches(targetCourse.id);
      fetchResources(targetCourse.id, student?.batch || 2025);
      fetchProgress(targetCourse.id);
    }
  }, [loadingGrades, courses, selectedCourse, location.state, student]);

  const fetchResources = async (courseId, batchVal) => {
    setLoading(true);
    try {
      const activeBatch = batchVal !== undefined ? batchVal : selectedBatch;
      const response = await studentApi.get(`/resources/course/${courseId}?batch=${activeBatch}`);
      const organized = { videos: [], pdfs: [], summaries: [], playlists: [], recordings: [] };
      response.data.forEach(resource => {
        if (resource.type === 'video') organized.videos.push(resource);
        else if (resource.type === 'pdf') organized.pdfs.push(resource);
        else if (resource.type === 'summary') organized.summaries.push(resource);
        else if (resource.type === 'playlist') organized.playlists.push(resource);
        else if (resource.type === 'recording') organized.recordings.push(resource);
      });
      setResources(organized);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error(t('common.error_load'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBatches = async (courseId) => {
    try {
      const response = await studentApi.get(`/resources/course/${courseId}?batch=all`);
      const batches = [...new Set(response.data.map(r => r.batch).filter(Boolean))]
        .sort((a, b) => b - a); // Descending
      setAvailableBatches(batches);
      // Auto-select student's own batch if present, else first available
      const studentBatch = student?.batch;
      const best = batches.includes(studentBatch) ? studentBatch : batches[0];
      if (best !== undefined && best !== selectedBatch) {
        setSelectedBatch(best);
        fetchResources(courseId, best);
      }
    } catch (error) {
      console.error('Error fetching available batches:', error);
    }
  };

  const fetchProgress = async (courseId) => {
    setLoadingProgress(true);
    try {
      const response = await studentApi.get(`/progress/course/${courseId}`);
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
      setProgressData({ items: [], stats: { total: 0, completed: 0, pending: 0, percentage: 0 } });
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleCourseChange = (course) => {
    setSelectedCourse(course);
    setAvailableBatches([]);
    fetchAvailableBatches(course.id);
    fetchResources(course.id, selectedBatch);
    fetchProgress(course.id);
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const isAudioFile = (url) => /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(url);

  if ((loading || loadingGrades) && courses.length === 0) {
    return (
      <div className="min-h-screen bg-background" dir={isAr ? 'rtl' : 'ltr'}>
        <LoadingState label={t('common.loading', 'Loading...')} className="min-h-screen" />
      </div>
    );
  }

  const tabs = [
    { value: 'progress', label: t('materials.progress'), icon: Activity, count: progressData.stats.total },
    { value: 'videos', label: t('materials.videos'), icon: Video, count: resources.videos.length },
    { value: 'recordings', label: t('materials.recordings'), icon: Mic, count: resources.recordings.length },
    { value: 'pdfs', label: t('materials.pdfs'), icon: FileText, count: resources.pdfs.length },
    { value: 'summaries', label: t('materials.summaries'), icon: BookOpen, count: resources.summaries.length },
    { value: 'playlists', label: t('materials.playlists'), icon: ListVideo, count: resources.playlists.length },
  ];

  const CircularProgress = ({ percentage }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="transform -rotate-90 w-36 h-36 sm:w-40 sm:h-40">
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted" />
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className="text-primary transition-all duration-700 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">{percentage}%</span>
          <span className={`text-xs text-muted-foreground mt-1 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? 'مكتمل' : 'Completed'}
          </span>
        </div>
      </div>
    );
  };

  const FakeWaveform = () => (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(32)].map((_, i) => (
        <div key={_?.id || i} className="w-1 bg-primary/30 rounded-full animate-pulse"
          style={{
            height: `${Math.random() * 80 + 20}%`,
            animationDelay: `${Math.random() * 1}s`,
            animationDuration: `${Math.random() * 0.5 + 0.5}s`
          }}>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir={isAr ? 'rtl' : 'ltr'}>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen">
        <PageContainer>

          <PageHeader
            icon={ListVideo}
            title={t('mavi.archive')}
            description={t('sidebar.materials')}
            actions={
              courses.length > 0 ? (
                <Select
                  value={selectedCourse ? String(selectedCourse.id) : undefined}
                  onValueChange={(val) => {
                    const course = courses.find(c => String(c.id) === val);
                    if (course) handleCourseChange(course);
                  }}
                >
                  <SelectTrigger className="w-[240px] max-w-full">
                    <SelectValue placeholder={t('materials.select_course')} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        <span className={isAr ? 'font-arabic' : ''}>{course.name}</span>
                        <span className="text-xs text-muted-foreground">SEM-{course.semester}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null
            }
          />

          {selectedCourse && (
            <div className="space-y-6">

              {/* Controls: tabs + academic-year toggle */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="overflow-x-auto no-scrollbar">
                  <SegmentedTabs
                    value={activeTab}
                    onChange={setActiveTab}
                    options={tabs}
                  />
                </div>

                {availableBatches.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">
                      {isAr ? 'العام الدراسي' : 'Academic Year'}
                    </span>
                    <SegmentedTabs
                      size="sm"
                      value={selectedBatch}
                      onChange={(b) => {
                        setSelectedBatch(b);
                        fetchResources(selectedCourse.id, b);
                      }}
                      options={availableBatches.map(b => ({ value: b, label: String(b) }))}
                    />
                  </div>
                )}
              </div>

              {/* CONTENT AREA */}
              <div className="min-h-[400px]">

                {/* PROGRESS TAB */}
                {activeTab === 'progress' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <SectionCard
                      title={t('materials.progress')}
                      className="lg:col-span-5"
                      bodyClassName="flex flex-col items-center justify-center gap-6 py-8"
                    >
                      <CircularProgress percentage={progressData.stats.percentage} />
                      <div className="grid w-full grid-cols-2 gap-3">
                        <StatCard label={t('mavi.inventory')} value={progressData.stats.total} />
                        <StatCard label={t('mavi.verified')} value={progressData.stats.completed} icon={CheckCircle} accent />
                      </div>
                    </SectionCard>

                    <SectionCard
                      title={t('materials.roadmap')}
                      description={t('mavi.deployment_map')}
                      actions={<ListChecks className="size-4 text-muted-foreground" />}
                      className="lg:col-span-7"
                      bodyClassName="text-start"
                    >
                      {loadingProgress ? (
                        <LoadingState label={t('common.loading', 'Loading...')} className="min-h-[280px]" />
                      ) : progressData.items.length === 0 ? (
                        <EmptyState
                          icon={CheckCircle}
                          title={t('materials.no_roadmap')}
                          className="min-h-[280px]"
                        />
                      ) : (
                        <div className="space-y-2 max-h-[480px] overflow-y-auto no-scrollbar">
                          {progressData.items.map((item, index) => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                                item.is_completed
                                  ? 'border-primary/20 bg-primary/5'
                                  : 'border-border bg-muted/30 hover:bg-muted/50'
                              }`}
                            >
                              <span
                                className={`flex size-9 shrink-0 items-center justify-center rounded-md border ${
                                  item.is_completed
                                    ? 'border-primary/20 bg-primary/10 text-primary'
                                    : 'border-border bg-card text-muted-foreground'
                                }`}
                              >
                                {item.is_completed ? <CheckCircle className="size-4" /> : <Circle className="size-4" />}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="block text-xs text-muted-foreground">
                                  {t('mavi.phase')} {index + 1}
                                </span>
                                <p
                                  className={`truncate text-sm font-medium ${
                                    item.is_completed ? 'text-muted-foreground line-through' : 'text-foreground'
                                  }`}
                                >
                                  {item.title}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </SectionCard>
                  </div>
                )}

                {/* VIDEOS & RECORDINGS */}
                {(activeTab === 'videos' || activeTab === 'recordings') && (
                  loading ? (
                    <LoadingState label={t('common.loading', 'Loading...')} />
                  ) : resources[activeTab].length === 0 ? (
                    <EmptyState icon={Monitor} title={t('dashboard.no_notifications')} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {resources[activeTab].map(item => (
                        <div
                          key={item.id}
                          className="overflow-hidden rounded-xl border bg-card transition-colors"
                        >
                          {activeTab === 'videos' ? (
                            <div className="aspect-video relative overflow-hidden bg-black">
                              <iframe src={getEmbedUrl(item.url)} title={item.title} className="w-full h-full border-none" allowFullScreen />
                            </div>
                          ) : (
                            <div className="space-y-4 bg-muted/40 p-5">
                              <span className="flex size-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                                <Mic className="size-5" />
                              </span>
                              <FakeWaveform />
                              {isAudioFile(item.url) && (
                                <audio controls className="w-full h-10 custom-audio"><source src={item.url} type="audio/mpeg" /></audio>
                              )}
                            </div>
                          )}
                          <div className="space-y-3 p-4 text-start">
                            <h3 className="line-clamp-2 text-sm font-medium text-foreground">{item.title}</h3>
                            <Button asChild variant="outline" size="sm" className="w-full">
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                {activeTab === 'videos' ? <PlayCircle className="size-4" /> : <Download className="size-4" />}
                                {activeTab === 'videos' ? t('materials.open_theater') : t('materials.download')}
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* DOCUMENTS */}
                {(activeTab === 'pdfs' || activeTab === 'summaries') && (
                  loading ? (
                    <LoadingState label={t('common.loading', 'Loading...')} />
                  ) : resources[activeTab].length === 0 ? (
                    <EmptyState icon={FileText} title={t('dashboard.no_notifications')} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {resources[activeTab].map(doc => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-[160px] flex-col justify-between rounded-xl border bg-card p-5 transition-colors hover:bg-muted/50"
                        >
                          <div className="space-y-4">
                            <span className="flex size-10 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                              {activeTab === 'pdfs' ? <FileText className="size-5" /> : <BookOpen className="size-5" />}
                            </span>
                            <h3 className="text-sm font-medium text-foreground line-clamp-3">{doc.title}</h3>
                          </div>
                          <div className="flex items-center justify-between border-t pt-3">
                            <span className="text-xs text-muted-foreground">{t('materials.view_doc')}</span>
                            <ArrowRight className={`size-4 text-muted-foreground transition-transform group-hover:text-foreground ${isAr ? 'rotate-180' : ''}`} />
                          </div>
                        </a>
                      ))}
                    </div>
                  )
                )}

                {/* PLAYLISTS */}
                {activeTab === 'playlists' && (
                  loading ? (
                    <LoadingState label={t('common.loading', 'Loading...')} />
                  ) : resources.playlists.length === 0 ? (
                    <EmptyState icon={ListVideo} title={t('dashboard.no_notifications')} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {resources.playlists.map(list => (
                        <a
                          key={list.id}
                          href={list.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
                        >
                          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                            <ListVideo className="size-6" />
                          </span>
                          <div className="min-w-0 flex-1 text-start">
                            <h3 className="truncate text-sm font-medium text-foreground">{list.title}</h3>
                            <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Play className="size-3" /> {t('mavi.open_channel')}
                            </span>
                          </div>
                          <ArrowRight className={`size-4 shrink-0 text-muted-foreground transition-transform group-hover:text-foreground ${isAr ? 'rotate-180' : ''}`} />
                        </a>
                      ))}
                    </div>
                  )
                )}

              </div>
            </div>
          )}

        </PageContainer>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-audio::-webkit-media-controls-panel { background-color: transparent; }
      `}</style>
    </div>
  );
};

export default StudentMaterials;
