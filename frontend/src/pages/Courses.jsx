// frontend/src/pages/Courses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Courses = () => {
  const { student } = useStudentAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    fetchCourses();
  }, [student]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/students/${student.id}/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // بيانات وهمية مؤقتاً
      setCourses([
        { id: 1, name: 'Discrete Structure', code: 'CS-301', lecturer: 'Dr. Maria Vance', progress: 75, semester: 2 },
        { id: 2, name: 'Social Ethics', code: 'HU102', lecturer: 'Prof. Michael Chen', progress: 45, semester: 2 },
        { id: 3, name: 'Logic Design', code: 'EE205', lecturer: 'Dr. Robert Stark', progress: 90, semester: 2 },
        { id: 4, name: 'Mathematics 2', code: 'MA102', lecturer: 'Prof. Elena Rodriguez', progress: 60, semester: 2 },
        { id: 5, name: 'Programming 2', code: 'CS102', lecturer: 'Dr. Alan Turing Jr.', progress: 30, semester: 2 },
        { id: 6, name: 'Operations Research', code: 'OR302', lecturer: 'Prof. Lisa Wong', progress: 55, semester: 2 },
      ]);
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

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl md:text-4xl font-bold neon-text mb-2">My Courses</h1>
      <p className="text-gray-400 mb-6">Current semester enrollment • Spring 2024</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group bg-gradient-to-br from-charcoal to-black/80 border border-neon/30 rounded-xl overflow-hidden hover:border-neon hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all duration-300"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-neon transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{course.code || course.name.substring(0, 6)}</p>
                </div>
                <span className="text-xs text-gray-500">{course.semester === 1 ? 'Sem 1' : 'Sem 2'}</span>
              </div>

              <p className="text-sm text-gray-300 mb-3">{course.lecturer}</p>

              {/* Course Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Course Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-neon h-2 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => navigate(`/materials?course=${course.id}`)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-center rounded-lg border border-neon/50 text-neon hover:bg-neon/10 transition-all"
                >
                  📁 Materials
                </button>
                <button
                  onClick={() => navigate(`/grades?course=${course.id}`)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-center rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  ⭐ Grades
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;