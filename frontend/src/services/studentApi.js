import axios from 'axios';

// ✅ تأكد إن الرابط يبدأ بـ https://
// ❌ غلط: 'academic-portal-production.up.railway.app/api'
// ✅ صح: 'https://academic-portal-production.up.railway.app/api'

const API_BASE_URL = 'https://academic-portal-production.up.railway.app/api';

const studentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Interceptor للتأكد من التوكن وتسجيل الـ requests
studentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // للـ Debugging
    console.log('📤 [Request]', config.method.toUpperCase(), config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    console.error('❌ [Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor للردود
studentApi.interceptors.response.use(
  (response) => {
    console.log('✅ [Response]', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ [Response Error]', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default studentApi;