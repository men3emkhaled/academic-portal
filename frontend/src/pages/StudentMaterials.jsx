import React, { useState, useEffect } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentMaterials = () => {
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [resources, setResources] = useState({ videos: [], pdfs: [], summaries: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
      return;
    }
    fetchCourses();
  }, [student, navigate]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      const semester2Courses = response.data.filter(c => c.semester === 2);
      setCourses(semester2Courses);
      if (semester2Courses.length > 0) {
        setSelectedCourse(semester2Courses[0]);
        fetchResources(semester2Courses[0].id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (courseId) => {
    setLoading(true);
    try {
      const response = await api.get(`/resources/course/${courseId}`);
      const organized = { videos: [], pdfs: [], summaries: [] };
      response.data.forEach(resource => {
        if (resource.type === 'video') organized.videos.push(resource);
        else if (resource.type === 'pdf') organized.pdfs.push(resource);
        else if (resource.type === 'summary') organized.summaries.push(resource);
      });
      setResources(organized);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId));
    setSelectedCourse(course);
    fetchResources(courseId);
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

  if (loading && courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'videos', label: '🎬 Videos', count: resources.videos.length },
    { id: 'pdfs', label: '📄 PDFs', count: resources.pdfs.length },
    { id: 'summaries', label: '📝 Summaries', count: resources.summaries.length }
  ];

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar activePage="materials" onLogout={handleLogout} />
      
      <div className="flex-1 ml-0 md:ml-64 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              📚 Course Materials
            </h1>
            <p className="text-gray-400">
              Access videos, PDFs, and summaries for your courses
            </p>
          </div>

          {/* Course Selector */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Select Course</label>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full md:w-80 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} (Semester {course.semester})
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <>
              {/* Course Header */}
              <div className="bg-gradient-to-r from-primary/20 to-transparent rounded-2xl p-6 mb-6 border border-primary/30">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedCourse.name}</h2>
                <p className="text-gray-300">{selectedCourse.description}</p>
              </div>

              {/* Tabs */}
              <div className="mb-6 border-b border-white/10">
                <div className="flex flex-wrap gap-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-2.5 font-medium rounded-t-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'text-primary border-b-2 border-primary bg-white/5'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      {tab.label} {tab.count > 0 && <span className="ml-1 text-xs">({tab.count})</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {/* Videos */}
                {activeTab === 'videos' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.videos.length === 0 ? (
                      <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-dashed border-gray-600">
                        <p className="text-gray-400 text-lg">No videos available yet.</p>
                      </div>
                    ) : (
                      resources.videos.map(video => (
                        <div key={video.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-primary/30 transition-all duration-300">
                          <div className="p-5">
                            <h3 className="text-xl font-bold text-white mb-3">{video.title}</h3>
                            <div className="aspect-video rounded-lg overflow-hidden border border-white/10 mb-3">
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
                              className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm"
                            >
                              <span>🔗 Open in new tab</span>
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
                      <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-dashed border-gray-600">
                        <p className="text-gray-400 text-lg">No PDF materials available yet.</p>
                      </div>
                    ) : (
                      resources.pdfs.map(pdf => (
                        <a
                          key={pdf.id}
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-200"
                        >
                          <div className="text-3xl">📄</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">{pdf.title}</h3>
                            <p className="text-xs text-gray-400 mt-1">PDF Document</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      ))
                    )}
                  </div>
                )}

                {/* Summaries */}
                {activeTab === 'summaries' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.summaries.length === 0 ? (
                      <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-dashed border-gray-600">
                        <p className="text-gray-400 text-lg">No summaries available yet.</p>
                      </div>
                    ) : (
                      resources.summaries.map(summary => (
                        <div key={summary.id} className="bg-white/5 rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300">
                          <div className="p-5">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">📝</div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">{summary.title}</h3>
                                <a
                                  href={summary.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary text-sm mt-2 hover:underline"
                                >
                                  Read Summary →
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMaterials;