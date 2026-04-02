import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl bg-dark-card border border-white/10 hover:border-neon/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={() => navigate(`/course/${course.id}`)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6">
        <h3 className="text-xl font-bold text-white group-hover:text-neon transition-colors mb-2">
          {course.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-neon/70 bg-neon/10 px-2 py-1 rounded-full">
            Semester {course.semester}
          </span>
          <button className="text-neon text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            Explore →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;