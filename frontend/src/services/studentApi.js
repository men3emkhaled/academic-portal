import axios from 'axios';
import { safeGetItem, safeRemoveItem } from '../utils/localStorage';

// نقرأ الرابط من متغيرات البيئة
let API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
if (API_BASE_URL && !API_BASE_URL.startsWith('/') && !API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  API_BASE_URL = 'https://' + API_BASE_URL;
}

// تأكيد وجود /api في نهاية الرابط
if (API_BASE_URL.startsWith('http') && !API_BASE_URL.includes('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api';
}

const studentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// إضافة التوكن تلقائياً لكل الطلبات
studentApi.interceptors.request.use(
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

    const token = safeGetItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// معالجة الردود: لو 401 نخرج الطالب
studentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      safeRemoveItem('studentToken');
      window.location.href = '/student/login';
    }
    return Promise.reject(error);
  }
);

export default studentApi;