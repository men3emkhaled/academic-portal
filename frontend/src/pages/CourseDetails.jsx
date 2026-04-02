import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

// دالة تحويل رابط يوتيوب إلى embed
const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const CourseDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState({ videos: [], pdfs: [], summaries: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  const videosRef = useRef(null);
  const pdfsRef = useRef(null);
  const summariesRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'video') setActiveTab('videos');
    if (type === 'pdf') setActiveTab('pdfs');
    if (type === 'summary') setActiveTab('summaries');
  }, [location.search]);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      const courseData = response.data;
      setCourse(courseData);
      const organized = { videos: [], pdfs: [], summaries: [] };
      if (courseData.resources) {
        courseData.resources.forEach(resource => {
          if (resource.type === 'video') organized.videos.push(resource);
          else if (resource.type === 'pdf') organized.pdfs.push(resource);
          else if (resource.type === 'summary') organized.summaries.push(resource);
        });
      }
      setResources(organized);
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-neon/30 border-t-neon rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-xl">Course not found</p>
        <button onClick={() => navigate('/')} className="neon-button mt-4">Go Home</button>
      </div>
    );
  }

  const tabs = [
    { id: 'videos', label: '🎬 Videos', count: resources.videos.length },
    { id: 'pdfs', label: '📄 PDFs', count: resources.pdfs.length },
    { id: 'summaries', label: '📝 Summaries', count: resources.summaries.length }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      {/* Hero Section */}
      <div className="relative mb-12 mt-4">
        <div className="absolute inset-0 bg-gradient-to-r from-neon/10 to-transparent rounded-2xl"></div>
        <div className="relative bg-charcoal/80 backdrop-blur-sm border border-neon/30 rounded-2xl p-6 md:p-8 shadow-2xl">
          <h1 className="text-3xl md:text-5xl font-bold neon-text mb-3">{course.name}</h1>
          <p className="text-gray-300 text-lg leading-relaxed">{course.description}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-1 bg-neon/10 rounded-full">📖 {resources.videos.length + resources.pdfs.length + resources.summaries.length} resources</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-white/10">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 font-medium rounded-t-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-neon border-b-2 border-neon bg-white/5'
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
                <div key={video.id} className="group bg-gradient-to-br from-charcoal to-black/80 border border-neon/30 rounded-xl overflow-hidden hover:border-neon transition-all duration-300 hover:shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-neon transition-colors">{video.title}</h3>
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
                      className="inline-flex items-center gap-2 text-neon hover:underline font-medium text-sm"
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
                  className="group flex items-center gap-4 p-4 bg-gradient-to-r from-charcoal to-black/60 border border-neon/30 rounded-xl hover:border-neon transition-all duration-200 hover:shadow-md"
                >
                  <div className="text-3xl">📄</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-neon transition-colors line-clamp-2">{pdf.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">PDF Document</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div key={summary.id} className="group bg-gradient-to-br from-charcoal to-black/80 border border-neon/30 rounded-xl hover:border-neon transition-all duration-300">
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📝</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-neon transition-colors">{summary.title}</h3>
                        <a
                          href={summary.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-neon text-sm mt-2 hover:underline"
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

      <Footer />
    </div>
  );
};

export default CourseDetails;