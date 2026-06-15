import createApiClient from './createApiClient';
import { safeRemoveItem } from '../utils/localStorage';

const api = createApiClient({
  tokenKey: 'adminToken',
  onUnauthorized: () => {
    safeRemoveItem('adminToken');
    window.location.href = '/admin/login';
  }
});

export default api;
