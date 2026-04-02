import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

const RoadmapList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get('/roadmap');
        setItems(res.data);
      } catch (err) {
        console.error('Error fetching roadmap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-neon/30 border-t-neon rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold neon-text mb-4">🚀 Roadmap</h1>
        <p className="text-gray-300 text-lg">Your guide to delving into the field of computers and information technology</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-gray-600">
          <p className="text-gray-400 text-xl">No roadmap items yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/roadmap/${item.id}`)}
              className="bg-gradient-to-br from-charcoal to-black/80 border border-neon/30 rounded-xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]"
            >
              <h3 className="text-xl font-bold text-neon mb-2">{item.title}</h3>
              <p className="text-gray-300 line-clamp-2">{item.description}</p>
              <div className="mt-4 text-sm text-neon flex items-center gap-1">
                <span>Click to view</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default RoadmapList;