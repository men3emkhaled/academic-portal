import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Video, FileText, BookOpen, Mic, ListVideo, 
  GraduationCap, Laptop, CheckCircle, Circle, 
  ListChecks, Play, Download, ChevronDown, 
  ChevronRight, Activity, PlayCircle, ArrowLeft, MousePointer2, ArrowRight,
  Zap, Layers, Database, Monitor
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate, useLocation } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSemester, setActiveSemester] = useState(null);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setIsDropdownOpen(false);
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
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-[#0c0c14]">
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#34d399] rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'progress', label: t('materials.progress'), icon: <Activity className="w-4 h-4" />, count: progressData.stats.total },
    { id: 'videos', label: t('materials.videos'), icon: <Video className="w-4 h-4" />, count: resources.videos.length },
    { id: 'recordings', label: t('materials.recordings'), icon: <Mic className="w-4 h-4" />, count: resources.recordings.length },
    { id: 'pdfs', label: t('materials.pdfs'), icon: <FileText className="w-4 h-4" />, count: resources.pdfs.length },
    { id: 'summaries', label: t('materials.summaries'), icon: <BookOpen className="w-4 h-4" />, count: resources.summaries.length },
    { id: 'playlists', label: t('materials.playlists'), icon: <ListVideo className="w-4 h-4" />, count: resources.playlists.length }
  ];

  const CircularProgress = ({ percentage }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="transform -rotate-90 w-36 h-36 sm:w-44 sm:h-44 overflow-visible">
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="14" fill="transparent" className="text-gray-100 dark:text-white/5" />
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="14" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className="text-[#34d399] transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(52,211,153,0.3)]" />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{percentage}%</span>
          <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 opacity-50 mt-1 ${isAr ? 'font-arabic' : ''}`}>
            {t('materials.completed')}
          </span>
        </div>
      </div>
    );
  };

  const FakeWaveform = () => (
    <div className="flex items-center justify-center gap-1.5 h-14">
      {[...Array(32)].map((_, i) => (
        <div key={_?.id || i} className="w-1.5 bg-[#34d399]/30 rounded-full animate-pulse"
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#059669]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#34d399]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        
        {/* HERO SECTION */}
        <section className="px-4 md:px-10 pt-10 md:pt-16 pb-6 md:pb-12 max-w-[1500px] mx-auto w-full space-y-8 md:space-y-12 text-start">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4 text-start">
              <h1 className={`text-[clamp(2rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('mavi.archive')}
              </h1>
            </div>
          </div>

          {/* COURSE SELECTOR */}
          <div className="relative z-20" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full flex-row items-center justify-between bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl md:rounded-[3rem] p-5 md:p-12 transition-all duration-500 group shadow-lg hover:shadow-2xl"
            >
              <div className="text-start space-y-1 md:space-y-2 max-w-[70%]">
                <h2 className={`text-lg md:text-5xl font-black text-gray-900 dark:text-white group-hover:text-[#059669] dark:group-hover:text-[#34d399] transition-colors uppercase tracking-tight truncate ${isAr ? 'font-arabic' : ''}`}>
                  {selectedCourse ? selectedCourse.name : t('materials.select_course')}
                </h2>
              </div>
              <div className="flex items-center gap-3 md:gap-6">
                <div className="bg-gray-50 dark:bg-white/5 px-3 py-1.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-gray-100 dark:border-white/5">
                   <span className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">{t('mavi.semester')}</span>
                   <span className="text-[10px] md:text-sm font-black uppercase text-gray-900 dark:text-white">SEM-{selectedCourse?.semester || '00'}</span>
                </div>
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center transition-all duration-500 group-hover:bg-[#059669] group-hover:text-white dark:group-hover:bg-[#34d399] dark:group-hover:text-black ${isDropdownOpen ? 'rotate-180' : ''}`}>
                   <ChevronDown className="w-5 h-5 md:w-7 md:h-7" />
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-4 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/10 rounded-2xl md:rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-6 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 p-3 md:p-4 max-h-[350px] md:max-h-[500px] overflow-y-auto no-scrollbar">
                  {courses.map(course => (
                    <button
                      key={course.id}
                      onClick={() => handleCourseChange(course)}
                      className={`w-full text-start px-5 py-4 md:px-8 md:py-6 rounded-xl md:rounded-[2rem] transition-all flex items-center justify-between group/item ${selectedCourse?.id === course.id ? 'bg-[#059669] text-white dark:bg-[#34d399] dark:text-black shadow-xl shadow-[#059669]/20' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      <div className="space-y-0.5 md:space-y-1">
                        <span className={`text-sm md:text-xl font-black uppercase tracking-tighter ${isAr ? 'font-arabic' : ''}`}>{course.name}</span>
                        <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${selectedCourse?.id === course.id ? 'opacity-60' : 'text-gray-400'}`}>{t('mavi.target_module')}: SEM-{course.semester}</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 md:w-6 md:h-6 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-2 transition-all ${isAr ? 'rotate-180' : ''} ${selectedCourse?.id === course.id ? 'opacity-100 text-white dark:text-black' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedCourse && (
            <div className="space-y-8 md:space-y-12">
              
              {/* ACADEMIC YEAR TABS - Simple inline */}
              {availableBatches.length > 0 && (
                <div className="flex items-center gap-1 bg-white dark:bg-[#0d0d14] p-1.5 rounded-2xl md:rounded-[1.8rem] border border-gray-100 dark:border-white/5 self-start shadow-sm">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-400 px-3 shrink-0">
                    {t('materialHub.academic_year')}
                  </span>
                  {availableBatches.map((b) => {
                    const isSel = selectedBatch === b;
                    return (
                      <button
                        key={b}
                        onClick={() => {
                          setSelectedBatch(b);
                          fetchResources(selectedCourse.id, b);
                        }}
                        className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-[1.2rem] text-[9px] md:text-[10px] font-black tracking-widest transition-all ${
                          isSel
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm'
                            : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TABS NAVIGATION */}
              <div className="flex md:flex-wrap gap-2 md:gap-3 bg-white dark:bg-[#0d0d14] p-2 md:p-3 rounded-2xl md:rounded-[3rem] border border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar shadow-sm md:shadow-lg">
                {tabs.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-none md:flex-1 flex items-center justify-center gap-2 md:gap-3 py-2.5 md:py-5 px-4 md:px-8 rounded-xl md:rounded-[2.2rem] text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        isActive 
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md md:shadow-2xl scale-[1.02]' 
                          : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[8px] md:text-[9px] ${isActive ? 'bg-white/20 dark:bg-black/10' : 'bg-gray-100 dark:bg-white/5'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* CONTENT AREA */}
              <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">

                {/* 🎯 PROGRESS TAB */}
                {activeTab === 'progress' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    <div className="lg:col-span-5 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl md:rounded-[3rem] p-6 md:p-12 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
                      <div className="absolute top-[-10%] inset-inline-end-[-10%] w-[50%] h-[50%] bg-[#34d399]/5 blur-[80px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>
                      
                      <CircularProgress percentage={progressData.stats.percentage} />
                      <div className="mt-6 md:mt-12 w-full grid grid-cols-2 gap-3 md:gap-4">
                        <div className="p-4 md:p-8 bg-gray-50 dark:bg-white/5 rounded-2xl md:rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
                           <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400">{t('mavi.inventory')}</span>
                           <p className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tighter">{progressData.stats.total}</p>
                        </div>
                        <div className="p-4 md:p-8 bg-[#059669]/5 dark:bg-[#34d399]/5 rounded-2xl md:rounded-[2.5rem] border border-[#059669]/10 dark:border-[#34d399]/10 flex flex-col items-center text-center">
                           <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-[#059669] dark:text-[#34d399]">{t('mavi.verified')}</span>
                           <p className="text-xl sm:text-3xl font-black text-[#059669] dark:text-[#34d399] mt-1 tracking-tighter">{progressData.stats.completed}</p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-7 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl md:rounded-[3rem] p-6 md:p-12 shadow-sm text-start">
                      <div className="flex items-center justify-between mb-6 md:mb-10">
                        <div className="space-y-1">
                           <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">{t('materials.progress')}</h3>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                           <ListChecks className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                      </div>
                      {progressData.items.length === 0 ? (
                        <div className="h-[250px] md:h-[350px] flex flex-col items-center justify-center text-gray-200 dark:text-white/10 italic font-black uppercase tracking-widest text-center">
                          <CheckCircle className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 opacity-20" />
                          {t('materials.no_roadmap')}
                        </div>
                      ) : (
                        <div className="space-y-3 md:space-y-4 max-h-[550px] overflow-y-auto no-scrollbar pr-2">
                          {progressData.items.map((item, index) => (
                            <div key={item.id} className={`group flex items-center gap-4 md:gap-8 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border transition-all duration-700 ${item.is_completed ? 'bg-[#059669]/5 border-[#059669]/10' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:scale-[1.01] hover:shadow-xl'}`}>
                              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shrink-0 ${item.is_completed ? 'bg-[#059669] dark:bg-[#34d399] text-white dark:text-black shadow-xl shadow-[#059669]/30' : 'bg-white dark:bg-white/10 text-gray-300'}`}>
                                {item.is_completed ? <CheckCircle className="w-5 h-5 md:w-7 md:h-7 stroke-[3px]" /> : <Circle className="w-5 h-5 md:w-7 md:h-7" />}
                              </div>
                              <div className="flex-1 min-w-0 py-1">
                                <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] mb-0.5 block ${item.is_completed ? 'text-[#059669] dark:text-[#34d399]' : 'text-gray-400'}`}>{t('mavi.phase')} {index + 1}</span>
                                <p className={`text-sm sm:text-xl font-black uppercase tracking-tight leading-tight ${item.is_completed ? 'text-gray-900 dark:text-white line-through opacity-50 italic' : 'text-gray-900 dark:text-white'}`}>{item.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 🎬 VIDEOS & RECORDINGS */}
                {(activeTab === 'videos' || activeTab === 'recordings') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                    {resources[activeTab].length === 0 ? (
                      <div className="col-span-full h-[300px] md:h-[450px] flex flex-col items-center justify-center text-gray-200 dark:text-white/10 italic font-black uppercase tracking-widest text-center">
                        <Monitor className="w-16 h-16 md:w-20 md:h-20 mb-6 md:mb-8 opacity-20" />
                        {t('dashboard.no_notifications')}
                      </div>
                    ) : (
                      resources[activeTab].map(item => (
                        <div key={item.id} className="group relative bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-4">
                          {activeTab === 'videos' ? (
                            <div className="aspect-video relative overflow-hidden bg-black group-hover:scale-105 transition-transform duration-700">
                              <iframe src={getEmbedUrl(item.url)} title={item.title} className="w-full h-full border-none" allowFullScreen />
                              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          ) : (
                            <div className="p-6 md:p-12 space-y-6 md:space-y-8 bg-gray-900 dark:bg-black/40">
                              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-[#059669]/20 flex items-center justify-center text-[#34d399] group-hover:scale-110 transition-transform shadow-xl">
                                <Mic className="w-6 h-6 md:w-10 md:h-10" />
                              </div>
                              <FakeWaveform />
                              {isAudioFile(item.url) && (
                                <audio controls className="w-full h-12 custom-audio opacity-60 hover:opacity-100 transition-opacity"><source src={item.url} type="audio/mpeg" /></audio>
                              )}
                            </div>
                          )}
                          <div className="p-6 md:p-12 text-start space-y-6 md:space-y-8">
                             <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></div>
                                   <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{t('mavi.stream_node')} X-1</span>
                                </div>
                                <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white line-clamp-2 uppercase tracking-tighter leading-tight">{item.title}</h3>
                             </div>
                             <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 md:gap-4 w-full py-4 md:py-6 rounded-2xl md:rounded-[2rem] bg-gray-900 dark:bg-white text-white dark:text-black font-black text-[10px] md:text-[11px] uppercase tracking-[0.4em] hover:scale-[1.03] active:scale-95 transition-all shadow-xl group/btn overflow-hidden relative">
                               <div className="absolute inset-0 bg-gradient-to-r from-[#059669]/0 via-[#059669]/10 to-[#059669]/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                               {activeTab === 'videos' ? <PlayCircle className="w-5 h-5 md:w-6 md:h-6" /> : <Download className="w-5 h-5 md:w-6 md:h-6" />}
                               {activeTab === 'videos' ? t('materials.open_theater') : t('materials.download')}
                             </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 📄 DOCUMENTS */}
                {(activeTab === 'pdfs' || activeTab === 'summaries') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                    {resources[activeTab].length === 0 ? (
                      <div className="col-span-full h-[300px] md:h-[450px] flex flex-col items-center justify-center text-gray-200 dark:text-white/10 italic font-black uppercase tracking-widest text-center">
                        <FileText className="w-16 h-16 md:w-20 md:h-20 mb-6 md:mb-8 opacity-20" />
                        {t('dashboard.no_notifications')}
                      </div>
                    ) : (
                      resources[activeTab].map(doc => (
                        <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="group bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 flex flex-col justify-between min-h-[220px] md:min-h-[350px] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_100px_rgba(0,0,0,0.4)] shadow-sm relative overflow-hidden">
                           <div className="absolute top-[-20%] inset-inline-end-[-20%] w-32 h-32 md:w-40 md:h-40 bg-[#34d399]/5 blur-[40px] rounded-full group-hover:bg-white/10 transition-colors duration-700"></div>
                           
                           <div className="space-y-6 md:space-y-10 relative z-10">
                              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] flex items-center justify-center ${activeTab === 'pdfs' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'} group-hover:bg-white/20 dark:group-hover:bg-black/20 group-hover:text-white dark:group-hover:text-white transition-all shadow-xl`}>
                                 {activeTab === 'pdfs' ? <FileText className="w-6 h-6 md:w-8 md:h-8" /> : <BookOpen className="w-6 h-6 md:w-8 md:h-8" />}
                              </div>
                              <h3 className="text-xl md:text-4xl font-black uppercase tracking-tighter leading-tight">{doc.title}</h3>
                           </div>

                           <div className="flex items-center justify-between pt-6 md:pt-10 border-t border-gray-100 dark:border-white/5 group-hover:border-white/10 transition-colors relative z-10">
                              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t('materials.view_doc')}</span>
                              <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white transition-all ${isAr ? 'rotate-180' : ''}`}>
                                 <ArrowRight className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                              </div>
                           </div>
                        </a>
                      ))
                    )}
                  </div>
                )}

                {/* 📺 PLAYLISTS */}
                {activeTab === 'playlists' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {resources.playlists.length === 0 ? (
                      <div className="col-span-full h-[300px] md:h-[450px] flex flex-col items-center justify-center text-gray-200 dark:text-white/10 italic font-black uppercase tracking-widest text-center">
                        <ListVideo className="w-16 h-16 md:w-20 md:h-20 mb-6 md:mb-8 opacity-20" />
                        {t('dashboard.no_notifications')}
                      </div>
                    ) : (
                      resources.playlists.map(list => (
                        <a key={list.id} href={list.url} target="_blank" rel="noopener noreferrer" className="group bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl md:rounded-[4rem] p-6 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-10 hover:bg-[#34d399] hover:text-black dark:hover:text-black transition-all duration-700 hover:-translate-y-3 hover:shadow-2xl relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent pointer-events-none"></div>
                           
                           <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2.5rem] bg-gray-50 dark:bg-black/20 flex items-center justify-center text-[#059669] dark:text-[#34d399] group-hover:bg-black group-hover:text-white transition-all shadow-2xl relative z-10 shrink-0">
                              <ListVideo className="w-8 h-8 md:w-12 md:h-12" />
                           </div>
                           <div className="flex-1 text-center md:text-start relative z-10 space-y-3 md:space-y-4">
                              <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-none text-gray-900 dark:text-white group-hover:text-black transition-colors">{list.title}</h3>
                              <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
                                 <div className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-900/5 dark:bg-black/20 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:bg-black/10 transition-colors">
                                    <Play className="w-3 h-3" /> {t('mavi.open_channel')}
                                  </div>
                                 <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-white/20 group-hover:bg-black/20"></div>
                                 <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] opacity-40 italic">{t('mavi.sync_established')}</span>
                              </div>
                           </div>
                           <div className={`w-10 h-10 md:w-16 md:h-16 rounded-full border border-gray-100 dark:border-white/5 flex items-center justify-center group-hover:border-black/20 transition-all ${isAr ? 'rotate-180' : ''} shrink-0`}>
                              <ArrowRight className="w-5 h-5 md:w-8 md:h-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                           </div>
                        </a>
                      ))
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

        </section>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-audio::-webkit-media-controls-panel { background-color: transparent; }
        .custom-audio::-webkit-media-controls-play-button { filter: invert(1); }
      `}</style>
    </div>
  );
};

export default StudentMaterials;