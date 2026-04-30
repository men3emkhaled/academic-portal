import axios from 'axios';
import { safeGetItem, safeRemoveItem } from '../utils/localStorage';

const API_BASE_URL = 'https://academic-portal-production.up.railway.app/api';

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