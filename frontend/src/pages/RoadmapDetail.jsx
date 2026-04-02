import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

// دالة تحويل اليوتيوب لأمان (تستخدم في العرض)
const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const RoadmapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/roadmap/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-neon/30 border-t-neon rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-xl">Item not found</p>
        <button onClick={() => navigate('/roadmap')} className="neon-button mt-4">Back to Roadmap</button>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(item.video_url);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="neon-button mb-6 inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>
      <div className="bg-gradient-to-br from-charcoal to-black/80 border border-neon/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold neon-text mb-4">{item.title}</h1>
        <p className="text-gray-300 text-lg mb-6 leading-relaxed">{item.description}</p>
        {item.video_url && (
          <div className="aspect-video rounded-xl overflow-hidden border border-neon/30">
            <iframe
              src={embedUrl}
              title={item.title}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default RoadmapDetail;