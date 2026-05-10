import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Video, FileText, BookOpen, Mic, ListVideo, GraduationCap, Laptop, CheckCircle, Circle, ListChecks, Play, Download, ChevronDown, ChevronRight, Activity, PlayCircle } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentMaterials = () => {
  const { student, logout } = useStudentAuth();
  const { gradesData, loadingGrades } = useStudentData();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [resources, setResources] = useState({ videos: [], pdfs: [], summaries: [], playlists: [], recordings: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('progress');
  const [progressData, setProgressData] = useState({ items: [], stats: { total: 0, completed: 0, pending: 0, percentage: 0 } });
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const courses = useMemo(() => {
    const grades = gradesData.grades || [];
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
  }, [gradesData.grades]);

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  useEffect(() => {
    if (!loadingGrades && courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]);
      fetchResources(courses[0].id);
      fetchProgress(courses[0].id);
    }
  }, [loadingGrades, courses, selectedCourse]);

  // Handle clicking outside the custom dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchResources = async (courseId) => {
    setLoading(true);
    try {
      const response = await api.get(`/resources/course/${courseId}`);
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
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (courseId) => {
    setLoadingProgress(true);
    try {
      const response = await api.get(`/progress/course/${courseId}`);
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
    fetchResources(course.id);
    fetchProgress(course.id);
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
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
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'progress', label: 'Progress', icon: <Activity className="w-4 h-4" />, count: progressData.stats.total },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" />, count: resources.videos.length },
    { id: 'recordings', label: 'Recordings', icon: <Mic className="w-4 h-4" />, count: resources.recordings.length },
    { id: 'pdfs', label: 'PDFs', icon: <FileText className="w-4 h-4" />, count: resources.pdfs.length },
    { id: 'summaries', label: 'Summaries', icon: <BookOpen className="w-4 h-4" />, count: resources.summaries.length },
    { id: 'playlists', label: 'Playlists', icon: <ListVideo className="w-4 h-4" />, count: resources.playlists.length }
  ];

  // Circular Progress Component
  const CircularProgress = ({ percentage }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="transform -rotate-90 w-36 h-36 sm:w-40 sm:h-40 overflow-visible">
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-white/5" />
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{percentage}%</span>
        </div>
      </div>
    );
  };

  // Fake Waveform Component
  const FakeWaveform = () => (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(24)].map((_, i) => (
        <div key={i} className="w-1.5 bg-primary/40 rounded-full animate-pulse"
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-hidden relative">
      <Sidebar activePage="materials" onLogout={handleLogout} />

      <div className="md:ml-64 pb-24 md:pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* HEADER: Cinematic Course Selector */}
          <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-[#111] p-6 sm:p-12 shadow-md dark:shadow-2xl border border-gray-200 dark:border-transparent transition-colors duration-500">
            {/* Background Container for Orbs to prevent spilling */}
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] pointer-events-none">
              {/* Massive Glowing Orbs */}
              <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[150%] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
              <div className="absolute bottom-[-50%] left-[-10%] w-[50%] h-[150%] bg-blue-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl border border-primary/20 dark:border-primary/30 shadow-[0_0_20px_rgba(46,204,113,0.15)] dark:shadow-[0_0_30px_rgba(46,204,113,0.3)]">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Course Materials</h1>
              </div>

              {/* Custom Dropdown Selector */}
              <div className="relative w-full max-w-xl" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-2xl py-5 px-6 transition-all duration-300 group"
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Course</p>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {selectedCourse ? selectedCourse.name : 'Select a course'}
                    </h2>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-gray-900 dark:text-white' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-4 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                      {courses.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">No enrolled courses</p>
                      ) : (
                        courses.map(course => (
                          <button
                            key={course.id}
                            onClick={() => handleCourseChange(course)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 ${selectedCourse?.id === course.id ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                          >
                            <BookOpen className={`w-5 h-5 ${selectedCourse?.id === course.id ? 'text-primary' : 'text-gray-400'}`} />
                            {course.name} <span className="text-xs text-gray-500 font-normal ml-auto">Sem {course.semester}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedCourse && (
            <>
              {/* Apple-style Segmented Tabs */}
              <div className="flex overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-2 p-1.5 bg-gray-200/50 dark:bg-white/5 backdrop-blur-xl rounded-[1.5rem] min-w-max border border-gray-200/50 dark:border-white/5 shadow-inner mb-2">
                  {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 outline-none ${isActive
                            ? 'text-gray-900 dark:text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/5'
                          }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-white dark:bg-[#222] rounded-xl shadow-sm transition-all animate-in zoom-in-95 duration-200"></div>
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <span className={isActive ? 'text-primary' : ''}>{tab.icon}</span>
                          {tab.label}
                          {tab.count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'bg-gray-300/50 dark:bg-white/10'}`}>{tab.count}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CONTENT AREA */}
              <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* 🎯 PROGRESS TAB */}
                {activeTab === 'progress' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Donut Chart Side */}
                    <div className="lg:col-span-1 bg-white/70 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center shadow-sm">
                      <h3 className="text-xl font-black mb-8 text-center text-gray-900 dark:text-white">Overall Completion</h3>
                      <CircularProgress percentage={progressData.stats.percentage} />
                      <div className="mt-8 w-full space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold bg-gray-50 dark:bg-white/5 px-4 py-3 rounded-xl">
                          <span className="text-gray-500 dark:text-gray-400">Total Items</span>
                          <span className="text-gray-900 dark:text-white">{progressData.stats.total}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                          <span className="text-emerald-600 dark:text-emerald-400">Completed</span>
                          <span className="text-emerald-700 dark:text-emerald-300">{progressData.stats.completed}</span>
                        </div>
                      </div>
                    </div>

                    {/* Task List Side */}
                    <div className="lg:col-span-2 bg-white/70 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm">
                      <h3 className="text-xl font-black mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <ListChecks className="w-6 h-6 text-primary" /> Roadmap Tasks
                      </h3>
                      {progressData.items.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
                          <CheckCircle className="w-12 h-12 mb-2 opacity-50" />
                          <p className="font-semibold">No roadmap tasks available.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                          {progressData.items.map((item, index) => (
                            <div key={item.id} className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${item.is_completed ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'}`}>
                              {item.is_completed ? <CheckCircle className="w-6 h-6 text-primary" /> : <Circle className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />}
                              <div className="flex-1 min-w-0">
                                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${item.is_completed ? 'text-primary' : 'text-gray-500'}`}>Step {index + 1}</span>
                                <p className={`font-bold text-sm truncate ${item.is_completed ? 'text-gray-900 dark:text-white line-through opacity-70' : 'text-gray-900 dark:text-white'}`}>{item.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 🎬 VIDEOS TAB */}
                {activeTab === 'videos' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {resources.videos.length === 0 ? (
                      <p className="col-span-full text-center text-gray-500 py-20 font-bold text-xl">No videos available.</p>
                    ) : (
                      resources.videos.map(video => (
                        <div key={video.id} className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                          <div className="aspect-video relative overflow-hidden bg-gray-900 rounded-t-2xl">
                            {/* Fake thumbnail overlay to intercept clicks and open cleanly, or just render iframe */}
                            <iframe src={getEmbedUrl(video.url)} title={video.title} className="w-full h-full relative z-0" allowFullScreen />
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 line-clamp-2">{video.title}</h3>
                            <a href={getEmbedUrl(video.url)} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:text-white text-gray-700 dark:text-white py-3 rounded-xl font-bold transition-colors">
                              <PlayCircle className="w-5 h-5" /> Open Theater Mode
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 🎧 RECORDINGS TAB */}
                {activeTab === 'recordings' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.recordings.length === 0 ? (
                      <p className="col-span-full text-center text-gray-500 py-20 font-bold text-xl">No audio recordings available.</p>
                    ) : (
                      resources.recordings.map(rec => (
                        <div key={rec.id} className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-white/10 p-6 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-500">
                          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Mic className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 line-clamp-2 h-14">{rec.title}</h3>

                          {isAudioFile(rec.url) ? (
                            <div className="bg-gray-100 dark:bg-black/50 rounded-2xl p-4 mb-4">
                              <FakeWaveform />
                              <audio controls className="w-full h-10 mt-2 custom-audio"><source src={rec.url} type="audio/mpeg" /></audio>
                            </div>
                          ) : (
                            <video controls className="w-full max-h-40 rounded-xl mb-4 bg-black"><source src={rec.url} type="video/mp4" /></video>
                          )}

                          <a href={rec.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform">
                            <Download className="w-4 h-4" /> Download
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 📄 DOCUMENTS (PDFs & Summaries) */}
                {(activeTab === 'pdfs' || activeTab === 'summaries') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources[activeTab].length === 0 ? (
                      <p className="col-span-full text-center text-gray-500 py-20 font-bold text-xl">No documents available.</p>
                    ) : (
                      resources[activeTab].map(doc => (
                        <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-white/10 p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full min-h-[220px]">
                          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-colors"></div>
                          <div className="relative z-10 flex-1">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${activeTab === 'pdfs' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              {activeTab === 'pdfs' ? <FileText className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white line-clamp-3">{doc.title}</h3>
                          </div>
                          <div className="relative z-10 mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">View Document</span>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:translate-x-2 transition-transform">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                )}

                {/* 📺 PLAYLISTS TAB */}
                {activeTab === 'playlists' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.playlists.length === 0 ? (
                      <p className="col-span-full text-center text-gray-500 py-20 font-bold text-xl">No playlists available.</p>
                    ) : (
                      resources.playlists.map(list => (
                        <a key={list.id} href={list.url} target="_blank" rel="noopener noreferrer" className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 dark:from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative z-10 flex items-start gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                              <ListVideo className="w-8 h-8" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 line-clamp-2">{list.title}</h3>
                              <p className="text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                                <Play className="w-4 h-4" /> Open Playlist
                              </p>
                            </div>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                )}

              </div>
            </>
          )}

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 4px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Customizing native audio player slightly */
        .custom-audio::-webkit-media-controls-panel { background-color: transparent; }
        .custom-audio::-webkit-media-controls-current-time-display,
        .custom-audio::-webkit-media-controls-time-remaining-display { color: inherit; }
      `}</style>
    </div>
  );
};

export default StudentMaterials;