import axios from 'axios';

// ✅ تأكد إن الرابط بالضبط كده
const API_BASE_URL = 'https://academic-portal-production.up.railway.app/api';

const studentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

studentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 Axios Request:', {
      method: config.method,
      baseURL: config.baseURL,
      url: config.url,
      fullPath: config.baseURL + config.url
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default studentApi;