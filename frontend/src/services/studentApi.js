import axios from 'axios';

const studentApi = axios.create({
  baseURL: 'https://academic-portal-production.up.railway.app/api/student',
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default studentApi;