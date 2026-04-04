import axios from 'axios';

// ✅ تأكد إن الرابط يبدأ بـ https://
// ❌ ممنوع تكتب: 'academic-portal-production.up.railway.app/api'
// ❌ ممنوع تكتب: '/api'
// ✅ صح: 'https://academic-portal-production.up.railway.app/api'

const API_BASE_URL = 'https://academic-portal-production.up.railway.app/api';

// لو عايز تستخدم environment variable
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://academic-portal-production.up.railway.app/api';

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
    
    // تأكد من المسارات
    console.log('📤 Request URL:', config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default studentApi;