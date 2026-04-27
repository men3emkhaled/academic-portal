import axios from 'axios';

// نعالج الرابط عشان لو كان موجود في البيئة بدون https:// نضيفها
let apiUrl = import.meta.env.VITE_API_URL || 'https://academic-portal-production.up.railway.app/api';
if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
  apiUrl = 'https://' + apiUrl;
}

// نقوم بإنشاء instance من axios مع تحديد رابط السيرفر
const api = axios.create({
  baseURL: apiUrl,
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