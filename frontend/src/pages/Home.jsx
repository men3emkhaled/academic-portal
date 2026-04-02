import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import api from '../services/api';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const [semester1Courses, setSemester1Courses] = useState([]);
  const [semester2Courses, setSemester2Courses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      const courses = response.data;
      setSemester1Courses(courses.filter(c => c.semester === 1));
      setSemester2Courses(courses.filter(c => c.semester === 2));
    } catch (error) {
      console.error('Error fetching courses:', error);
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
    <div className="space-y-20">
      <section className="text-center space-y-4 py-12">
        <h1 className="text-5xl md:text-6xl font-bold neon-text tracking-tight animate-pulse-slow">
          Academic Portal
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Your gateway to course materials and grades for Year 1
        </p>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-1 w-12 bg-neon rounded-full" />
          <h2 className="text-3xl font-bold text-white">Semester 1</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {semester1Courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-1 w-12 bg-neon rounded-full" />
          <h2 className="text-3xl font-bold text-white">Semester 2</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {semester2Courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;