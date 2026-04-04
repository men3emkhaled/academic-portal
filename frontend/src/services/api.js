import axios from 'axios';

// نقوم بإنشاء instance من axios مع تحديد رابط السيرفر على Railway
const api = axios.create({
  // الرابط الكامل للسيرفر الخاص بك مع إضافة /api في النهاية
  baseURL: 'https://academic-portal-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة الـ Token للطلبات إذا كان المستخدم مسجلاً للدخول (Admin)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;