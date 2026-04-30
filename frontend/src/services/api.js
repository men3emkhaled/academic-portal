import axios from 'axios';
import { safeGetItem, safeRemoveItem } from '../utils/localStorage';

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