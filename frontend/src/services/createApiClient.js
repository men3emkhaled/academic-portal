import axios from 'axios';
import { safeGetItem, safeRemoveItem } from '../utils/localStorage';

let baseUrl = import.meta.env.VITE_API_URL || '/api';
if (baseUrl && !baseUrl.startsWith('/') && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
  baseUrl = 'https://' + baseUrl;
}
if (baseUrl.startsWith('http') && !baseUrl.includes('/api')) {
  baseUrl = baseUrl.replace(/\/$/, '') + '/api';
}

const normalizeUrl = (config) => {
  if (config.url && config.url.startsWith('/')) {
    if (config.url.startsWith('/api/')) {
      config.url = config.url.substring(5);
    } else if (config.url === '/api') {
      config.url = '';
    } else {
      config.url = config.url.substring(1);
    }
  }
  return config;
};

const createApiClient = ({ tokenKey, onUnauthorized } = {}) => {
  const client = axios.create({
    baseURL: baseUrl,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  client.interceptors.request.use(
    (config) => {
      normalizeUrl(config);
      const hasAuth = config.headers && (
        config.headers.Authorization ||
        config.headers.authorization ||
        (config.headers.has && config.headers.has('Authorization'))
      );
      if (!hasAuth && tokenKey) {
        const token = safeGetItem(tokenKey);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  if (onUnauthorized) {
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          onUnauthorized(error);
        }
        return Promise.reject(error);
      }
    );
  }

  return client;
};

export default createApiClient;
