import axios from 'axios';

const studentApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/student',
  headers: {
    'Content-Type': 'application/json',
  },
});

studentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to handle errors
const handleResponse = (response) => response.data;
const handleError = (error) => {
  const message = error.response?.data?.message || 'An error occurred';
  throw new Error(message);
};

// Auth endpoints
export const studentLogin = (username, password) => 
  studentApi.post('/login', { username, password }).then(handleResponse).catch(handleError);

export const getCurrentStudent = () => 
  studentApi.get('/me').then(handleResponse).catch(handleError);

export const changeStudentPassword = (currentPassword, newPassword) => 
  studentApi.post('/change-password', { currentPassword, newPassword }).then(handleResponse).catch(handleError);

// Grades endpoints
export const getMyGrades = () => 
  studentApi.get('/my-grades').then(handleResponse).catch(handleError);

// Timetable endpoint
export const getMyTimetable = () => 
  studentApi.get('/my-timetable').then(handleResponse).catch(handleError);

// Roadmap endpoints
export const getRoadmapProgress = (trackId) => 
  studentApi.get(`/roadmap/progress/${trackId}`).then(handleResponse).catch(handleError);

export const toggleTask = (taskId, isCompleted) => 
  studentApi.post('/roadmap/toggle-task', { taskId, isCompleted }).then(handleResponse).catch(handleError);

// Notifications endpoints
export const getMyNotifications = () => 
  studentApi.get('/notifications').then(handleResponse).catch(handleError);

export const getUnreadCount = () => 
  studentApi.get('/notifications/unread-count').then(handleResponse).catch(handleError);

export const markNotificationAsRead = (id) => 
  studentApi.put(`/notifications/${id}/read`).then(handleResponse).catch(handleError);

export const markAllNotificationsAsRead = () => 
  studentApi.put('/notifications/read-all').then(handleResponse).catch(handleError);

export default studentApi;