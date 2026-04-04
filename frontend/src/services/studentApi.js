import axios from 'axios';

const API_BASE_URL = 'https://academic-portal-production.up.railway.app/api';

const studentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor للتأكد من إضافة التوكن لكل request
studentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studentToken');
    
    console.log(`📤 ${config.method.toUpperCase()} ${config.baseURL + config.url}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to headers');
    } else {
      console.log('⚠️ No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Interceptor للردود - لو 401 نخلي المستخدم يسجل خروج
studentApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('⚠️ 401 Unauthorized - Clearing token');
      localStorage.removeItem('studentToken');
      delete studentApi.defaults.headers.common['Authorization'];
      window.location.href = '/student/login';
    }
    return Promise.reject(error);
  }
);

export default studentApi;