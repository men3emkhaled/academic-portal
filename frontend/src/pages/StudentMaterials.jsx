import React, { useState, useEffect, useMemo } from 'react';
import { Video, FileText, BookOpen, PlaySquare, Eye, Download, Search, Mic, FileAudio, ListVideo, GraduationCap, Laptop, Hourglass, MonitorPlay, CheckCircle, Circle, ListChecks } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('videos');
  const [progressData, setProgressData] = useState({ items: [], stats: { total: 0, completed: 0, pending: 0, percentage: 0 } });
  const [loadingProgress, setLoadingProgress] = useState(false);

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
    uniqueCourses.sort((a, b) => {
      if (a.semester !== b.semester) return a.semester - b.semester;
      return a.name.localeCompare(b.name);
    });
    return uniqueCourses;
  }, [gradesData.grades]);

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
      return;
    }
  }, [student, navigate]);

  useEffect(() => {
    if (!loadingGrades && courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]);
      fetchResources(courses[0].id);
      fetchProgress(courses[0].id);
    }
  }, [loadingGrades, courses, selectedCourse]);

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

  const handleCourseChange = (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId));
    setSelectedCourse(course);
    fetchResources(courseId);
    fetchProgress(courseId);
    setActiveTab('videos');
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

  // تحديد ما إذا كان الرابط يشير إلى ملف صوتي
  const isAudioFile = (url) => {
    return /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(url);
  };

  if ((loading || loadingGrades) && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
        <Sidebar onLogout={handleLogout} />
        <div className="md:ml-64 flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'progress', label: 'Progress', icon: <ListChecks className="w-4 h-4" />, count: progressData.stats.total },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" />, count: resources.videos.length },
    { id: 'recordings', label: 'Recordings', icon: <Mic className="w-4 h-4" />, count: resources.recordings.length },
    { id: 'pdfs', label: 'PDFs', icon: <FileText className="w-4 h-4" />, count: resources.pdfs.length },
    { id: 'summaries', label: 'Summaries', icon: <BookOpen className="w-4 h-4" />, count: resources.summaries.length },
    { id: 'playlists', label: 'Playlists', icon: <ListVideo className="w-4 h-4" />, count: resources.playlists.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <Sidebar activePage="materials" onLogout={handleLogout} />

      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-white/70 leading-tight pb-2 mb-6">
            Course Materials
          </h1>

          <div className="relative group mb-10">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span><GraduationCap className="w-5 h-5 text-primary" /></span>
            </div>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full bg-white dark:bg-dark-glass text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-10 appearance-none font-body font-semibold focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer shadow-sm dark:shadow-none"
            >
              {courses.length === 0 ? (
                <option value="">No enrolled courses</option>
              ) : (
                courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} (Semester {course.semester})
                  </option>
                ))
              )}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-xl">⌵</span>
            </div>
          </div>

          {selectedCourse ? (
            <>
              <div className="mb-10 relative overflow-hidden">
                <div className="bg-white/80 dark:bg-dark-glass/40 rounded-3xl p-6 relative overflow-hidden group border border-gray-200 dark:border-white/5 shadow-md dark:shadow-xl">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 dark:group-hover:bg-primary/10 transition-colors" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-secondary/10 dark:bg-secondary/5 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary/10 p-2 rounded-xl">
                        <span><Laptop className="w-5 h-5 text-primary" /></span>
                      </div>
                      <h2 className="font-headline text-xl font-bold text-gray-900 dark:text-white">{selectedCourse.name}</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{selectedCourse.description || 'No description available.'}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(46,204,113,0.8)] dark:shadow-[0_0_8px_#8eff71]" />
                      <span className="text-xs font-bold text-primary/90 dark:text-primary/80 uppercase tracking-wider">Ongoing</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 bg-white dark:bg-dark-glass p-2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg whitespace-nowrap min-w-max">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-xl font-body text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        activeTab === tab.id
                          ? 'bg-primary text-white dark:text-dark shadow-[0_4px_10px_rgba(46,204,113,0.3)] dark:shadow-[0_8px_16px_rgba(142,255,113,0.25)] scale-105'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      {tab.count > 0 && <span className="ml-1 text-xs">({tab.count})</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-[400px]">
                {/* Progress */}
                {activeTab === 'progress' && (
                  <div>
                    {loadingProgress ? (
                      <div className="flex justify-center py-16">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : progressData.items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-gray-300 dark:border-white/10 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem]">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-dark-glass rounded-full flex items-center justify-center">
                            <ListChecks className="w-10 h-10 text-gray-400 dark:text-gray-400/40" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-dark p-1.5 border border-gray-200 dark:border-white/10 rounded-full">
                            <Hourglass className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                        <h3 className="font-headline text-lg font-bold text-gray-900 dark:text-white mb-2">No progress data yet</h3>
                        <p className="font-body text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px]">
                          The instructor hasn't added any progress items for this course yet.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {/* Progress Stats Bar */}
                        <div className="bg-white/80 dark:bg-dark-glass/60 rounded-2xl p-5 mb-6 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <ListChecks className="w-5 h-5 text-primary" />
                              <span className="font-headline font-bold text-gray-900 dark:text-white text-sm">Course Progress</span>
                            </div>
                            <span className="font-headline font-black text-primary text-lg">{progressData.stats.percentage}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-3 shadow-inner dark:shadow-none">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${progressData.stats.percentage}%`,
                                background: progressData.stats.percentage === 100
                                  ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                                  : 'linear-gradient(90deg, #8eff71, #4ade80)'
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-gray-500 dark:text-gray-400">
                              <span className="text-primary">{progressData.stats.completed}</span> / {progressData.stats.total} completed
                            </span>
                            {progressData.stats.pending > 0 && (
                              <span className="text-amber-500 dark:text-amber-400/80">
                                {progressData.stats.pending} pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Items List */}
                        <div className="space-y-2.5">
                          {progressData.items.map((item, index) => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl border transition-all duration-300 ${
                                item.is_completed
                                  ? 'bg-primary/5 border-primary/20 dark:border-primary/15 hover:border-primary/40 dark:hover:border-primary/30'
                                  : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/15 hover:border-amber-300 dark:hover:border-amber-500/30'
                              }`}
                            >
                              {item.is_completed ? (
                                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                              )}
                              <span className="text-xs font-black text-gray-500 dark:text-gray-600 bg-gray-100 dark:bg-white/5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <span className={`font-body font-semibold text-sm flex-1 ${
                                item.is_completed ? 'text-gray-900 dark:text-white' : 'text-amber-700 dark:text-amber-200'
                              }`}>
                                {item.title}
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0 ${
                                item.is_completed
                                  ? 'bg-primary/15 text-primary'
                                  : 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              }`}>
                                {item.is_completed ? 'Done' : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Videos */}
                {activeTab === 'videos' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.videos.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-gray-300 dark:border-white/10 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem]">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-dark-glass rounded-full flex items-center justify-center">
                            <MonitorPlay className="w-10 h-10 text-gray-400 dark:text-gray-400/40" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-dark p-1.5 border border-gray-200 dark:border-white/10 rounded-full">
                            <Hourglass className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                        <h3 className="font-headline text-lg font-bold text-gray-900 dark:text-white mb-2">No videos available yet</h3>
                        <p className="font-body text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[240px]">
                          We're currently processing the latest lecture recordings. Check back later today!
                        </p>
                      </div>
                    ) : (
                      resources.videos.map(video => (
                        <div key={video.id} className="bg-white dark:bg-dark-card rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/5 hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(46,204,113,0.15)] dark:hover:shadow-[0_12px_40px_rgba(142,255,113,0.15)] shadow-sm dark:shadow-none hover:-translate-y-1.5 transition-all duration-500 group relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 dark:from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                          <div className="p-6 relative">
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <h3 className="text-xl font-headline font-extrabold text-gray-900 dark:text-white line-clamp-2 mt-1">{video.title}</h3>
                              <div className="w-8 h-8 shrink-0 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-400 shadow-inner group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                <Video className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 mb-4 bg-gray-100 dark:bg-dark shadow-inner group-hover:border-primary/30 transition-colors">
                              <iframe
                                src={getEmbedUrl(video.url)}
                                title={video.title}
                                className="w-full h-full"
                                allowFullScreen
                              />
                            </div>
                            <a
                              href={getEmbedUrl(video.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:text-dark text-gray-700 dark:text-white py-3 rounded-xl font-bold transition-all duration-300"
                            >
                              <span>Watch in Full Screen</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ✅ Recordings */}
                {activeTab === 'recordings' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.recordings.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-gray-300 dark:border-white/10 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem]">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-dark-glass rounded-full flex items-center justify-center">
                            <Mic className="w-10 h-10 text-gray-400 dark:text-gray-400/40" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-dark p-1.5 border border-gray-200 dark:border-white/10 rounded-full">
                            <Hourglass className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                        <h3 className="font-headline text-lg font-bold text-gray-900 dark:text-white mb-2">No recordings available yet</h3>
                        <p className="font-body text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[240px]">
                          Lecture recordings will appear here once uploaded.
                        </p>
                      </div>
                    ) : (
                      resources.recordings.map(rec => (
                        <div key={rec.id} className="bg-white dark:bg-dark-card rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/5 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(46,204,113,0.15)] dark:hover:shadow-[0_12px_40px_rgba(142,255,113,0.15)] shadow-sm dark:shadow-none hover:-translate-y-1.5 transition-all duration-500 group relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 dark:from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                          <div className="p-6 relative">
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <h3 className="text-xl font-headline font-extrabold text-gray-900 dark:text-white line-clamp-2 mt-1">{rec.title}</h3>
                              <div className="w-8 h-8 shrink-0 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 shadow-inner group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                <Mic className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 mb-4 bg-gray-50 dark:bg-dark shadow-inner p-3 group-hover:border-primary/30 transition-colors">
                              {isAudioFile(rec.url) ? (
                                <audio controls className="w-full">
                                  <source src={rec.url} type="audio/mpeg" />
                                  Your browser does not support the audio element.
                                </audio>
                              ) : (
                                <video controls className="w-full max-h-64 rounded-xl">
                                  <source src={rec.url} type="video/mp4" />
                                  Your browser does not support the video element.
                                </video>
                              )}
                            </div>
                            <a
                              href={rec.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:text-dark text-gray-700 dark:text-white py-3 rounded-xl font-bold transition-all duration-300"
                            >
                              <span>Open Recording</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* PDFs */}
                {activeTab === 'pdfs' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {resources.pdfs.length === 0 ? (
                      <div className="col-span-full text-center py-16 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem] border border-dashed border-gray-300 dark:border-white/10 shadow-sm dark:shadow-inner">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No PDF materials available yet.</p>
                      </div>
                    ) : (
                      resources.pdfs.map(pdf => (
                        <a
                          key={pdf.id}
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative overflow-hidden group flex items-center gap-5 p-6 bg-white dark:bg-dark-card rounded-[2rem] border border-gray-200 dark:border-white/5 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(46,204,113,0.15)] dark:hover:shadow-[0_12px_40px_rgba(142,255,113,0.15)] shadow-sm dark:shadow-none hover:-translate-y-1.5 transition-all duration-500"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 dark:from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative w-14 h-14 shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:from-primary group-hover:to-primary/80 transition-all duration-500">
                            <FileText className="w-6 h-6 text-primary group-hover:text-white dark:group-hover:text-dark group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          
                          <div className="relative flex-1 flex items-center justify-between gap-4">
                            <h3 className="font-headline font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">{pdf.title}</h3>
                            <div className="w-8 h-8 shrink-0 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </div>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                )}

                {/* Summaries */}
                {activeTab === 'summaries' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.summaries.length === 0 ? (
                      <div className="col-span-full text-center py-16 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem] border border-dashed border-gray-300 dark:border-white/10 shadow-sm dark:shadow-inner">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No summaries available yet.</p>
                      </div>
                    ) : (
                      resources.summaries.map(summary => (
                        <div key={summary.id} className="relative overflow-hidden group bg-white dark:bg-dark-card rounded-[2rem] border border-gray-200 dark:border-white/5 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(46,204,113,0.15)] dark:hover:shadow-[0_12px_40px_rgba(142,255,113,0.15)] shadow-sm dark:shadow-none hover:-translate-y-1.5 transition-all duration-500">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 dark:from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative p-6">
                            <div className="flex items-start gap-5">
                              <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:from-primary group-hover:to-primary/80 transition-all duration-500">
                                <BookOpen className="w-6 h-6 text-primary group-hover:text-white dark:group-hover:text-dark group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <div className="flex-1 flex flex-col justify-center">
                                <h3 className="font-headline font-bold text-lg text-gray-900 dark:text-white leading-snug mb-4">{summary.title}</h3>
                                <a href={summary.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-white/5 hover:bg-primary/20 hover:text-primary rounded-xl text-sm font-semibold transition-colors w-fit">
                                  Read Summary <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Playlists */}
                {activeTab === 'playlists' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {resources.playlists.length === 0 ? (
                      <div className="col-span-full text-center py-16 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem] border border-dashed border-gray-300 dark:border-white/10 shadow-sm dark:shadow-inner">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No playlists available yet.</p>
                      </div>
                    ) : (
                      resources.playlists.map(playlist => (
                        <a
                          key={playlist.id}
                          href={playlist.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative overflow-hidden group flex items-center gap-5 p-6 bg-white dark:bg-dark-card rounded-[2rem] border border-gray-200 dark:border-white/5 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(46,204,113,0.15)] dark:hover:shadow-[0_12px_40px_rgba(142,255,113,0.15)] shadow-sm dark:shadow-none hover:-translate-y-1.5 transition-all duration-500"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 dark:from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative w-14 h-14 shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:from-primary group-hover:to-primary/80 transition-all duration-500">
                            <ListVideo className="w-6 h-6 text-primary group-hover:text-white dark:group-hover:text-dark group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          
                          <div className="relative flex-1 flex items-center justify-between gap-4">
                            <h3 className="font-headline font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">{playlist.title}</h3>
                            <div className="w-8 h-8 shrink-0 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </div>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            !loading && (
              <div className="text-center py-16 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem] border border-dashed border-gray-300 dark:border-white/10 shadow-sm dark:shadow-inner">
                <p className="text-gray-500 dark:text-gray-400 text-lg">You are not enrolled in any courses yet.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Contact your administrator to enroll in courses.</p>
              </div>
            )
          )}
        </div>
      </div>
      <style>{`
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .bg-dark-glass { background: rgba(17, 17, 17, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentMaterials;