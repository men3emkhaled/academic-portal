import axios from 'axios';
import { safeGetItem, safeRemoveItem } from '../utils/localStorage';

// نعالج الرابط عشان لو كان موجود في البيئة بدون https:// نضيفها
let apiUrl = import.meta.env.VITE_API_URL || '/api';
if (apiUrl && !apiUrl.startsWith('/') && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
  apiUrl = 'https://' + apiUrl;
}

// تأكيد وجود /api في نهاية الرابط
if (apiUrl.startsWith('http') && !apiUrl.includes('/api')) {
  apiUrl = apiUrl.replace(/\/$/, '') + '/api';
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
    // حل مشكلة المسارات النسبية في Axios وتجاوز /api
    if (config.url && config.url.startsWith('/')) {
      if (config.url.startsWith('/api/')) {
        config.url = config.url.substring(5);
      } else if (config.url === '/api') {
        config.url = '';
      } else {
        config.url = config.url.substring(1);
      }
    }

    // Only attach adminToken if no Authorization header is already provided
    const hasAuth = config.headers && (
      config.headers.Authorization || 
      config.headers.authorization || 
      (config.headers.has && config.headers.has('Authorization'))
    );
    
    if (!hasAuth) {
      const token = safeGetItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;