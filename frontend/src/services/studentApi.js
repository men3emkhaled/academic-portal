import axios from 'axios';

// ✅ الرابط كامل مع https://
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://academic-portal-production.up.railway.app/api';

const studentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor لإضافة التوكن
studentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // تحويل المسارات
    if (config.url === '/my-grades') {
      config.url = '/grades/my-grades';
    }
    
    if (config.url === '/me') {
      config.url = '/student/me';
    }
    
    if (config.url === '/change-password') {
      config.url = '/student/change-password';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default studentApi;