import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import studentApi from '../services/studentApi';
import api from '../services/api';
import { useStudentAuth } from './StudentAuthContext';
import toast from 'react-hot-toast';

const StudentDataContext = createContext();

export const useStudentData = () => useContext(StudentDataContext);

export const StudentDataContextProvider = ({ children }) => {
  const { student, token } = useStudentAuth();

  // Data states
  const [gradesData, setGradesData] = useState({ grades: [], summary: null });
  const [notifications, setNotifications] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [departmentTimetable, setDepartmentTimetable] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [roadmapTracks, setRoadmapTracks] = useState([]);
  const [exams, setExams] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    grades: true,
    notifications: true,
    timetable: true,
    tasks: true,
    quizzes: true,
    roadmap: true,
    exams: true,
  });

  const updateLoading = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const fetchGrades = useCallback(async () => {
    updateLoading('grades', true);
    try {
      const response = await studentApi.get('/grades/my-grades');
      setGradesData({
        grades: response.data.grades || [],
        summary: response.data.summary || null
      });
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      updateLoading('grades', false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    updateLoading('notifications', true);
    try {
      const response = await studentApi.get('/notifications/my-notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      updateLoading('notifications', false);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id) => {
    try {
      await studentApi.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  const fetchTimetable = useCallback(async () => {
    updateLoading('timetable', true);
    try {
      const [personalRes, deptRes] = await Promise.all([
        studentApi.get('/student/my-timetable').catch(() => ({ data: [] })),
        student?.department_id 
          ? studentApi.get(`/timetable/department/${student.department_id}`).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] })
      ]);
      setTimetable(personalRes.data || []);
      setDepartmentTimetable(deptRes.data || []);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      updateLoading('timetable', false);
    }
  }, [student?.department_id]);

  const fetchTasks = useCallback(async () => {
    updateLoading('tasks', true);
    try {
      const response = await studentApi.get('/student/personal-tasks');
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      updateLoading('tasks', false);
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    updateLoading('quizzes', true);
    try {
      const [pendingRes, completedRes] = await Promise.all([
        studentApi.get('/student/my-quizzes').catch(() => ({ data: [] })),
        studentApi.get('/student/completed-quizzes').catch(() => ({ data: [] }))
      ]);
      setQuizzes(pendingRes.data || []);
      setCompletedQuizzes(completedRes.data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      updateLoading('quizzes', false);
    }
  }, []);

  const fetchRoadmapTracks = useCallback(async () => {
    updateLoading('roadmap', true);
    try {
      const response = await studentApi.get('/roadmap/tracks');
      setRoadmapTracks(response.data || []);
    } catch (error) {
      console.error('Error fetching roadmap tracks:', error);
    } finally {
      updateLoading('roadmap', false);
    }
  }, []);

  const fetchExams = useCallback(async () => {
    if (!student?.department_id) return;
    updateLoading('exams', true);
    try {
      const response = await studentApi.get('/exams', { params: { department_id: student.department_id } });
      setExams(response.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      updateLoading('exams', false);
    }
  }, [student?.department_id]);

  // Fetch all when student logs in
  useEffect(() => {
    if (student && token) {
      fetchGrades();
      fetchNotifications();
      fetchTimetable();
      fetchTasks();
      fetchQuizzes();
      fetchRoadmapTracks();
      fetchExams();
    } else {
      // Clear data if logged out
      setGradesData({ grades: [], summary: null });
      setNotifications([]);
      setTimetable([]);
      setDepartmentTimetable([]);
      setTasks([]);
      setQuizzes([]);
      setCompletedQuizzes([]);
      setRoadmapTracks([]);
      setExams([]);
    }
  }, [student, token, fetchGrades, fetchNotifications, fetchTimetable, fetchTasks, fetchQuizzes, fetchRoadmapTracks, fetchExams]);

  return (
    <StudentDataContext.Provider value={{
      gradesData, setGradesData, loadingGrades: loading.grades, fetchGrades,
      notifications, setNotifications, loadingNotifications: loading.notifications, fetchNotifications, markNotificationAsRead,
      timetable, departmentTimetable, loadingTimetable: loading.timetable, fetchTimetable,
      tasks, setTasks, loadingTasks: loading.tasks, fetchTasks,
      quizzes, completedQuizzes, setQuizzes, setCompletedQuizzes, loadingQuizzes: loading.quizzes, fetchQuizzes,
      roadmapTracks, loadingRoadmap: loading.roadmap, fetchRoadmapTracks,
      exams, setExams, loadingExams: loading.exams, fetchExams
    }}>
      {children}
    </StudentDataContext.Provider>
  );
};
