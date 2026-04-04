import axios from 'axios';

// ✅ الرابط الأساسي للـ Backend على Railway
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://academic-portal-production.up.railway.app/api';

const studentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor لإضافة التوكن وتعديل المسارات
studentApi.interceptors.request.use(
  (config) => {
    // إضافة توكن الطالب لو موجود
    const token = localStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ تحويل /my-grades إلى /grades/my-grades
    if (config.url === '/my-grades') {
      config.url = '/grades/my-grades';
    }
    
    // ✅ تحويل /me إلى /student/me
    if (config.url === '/me') {
      config.url = '/student/me';
    }
    
    // ✅ تحويل /change-password إلى /student/change-password
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