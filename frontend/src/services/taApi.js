import createApiClient from './createApiClient';
import { safeRemoveItem } from '../utils/localStorage';

const taApi = createApiClient({
  tokenKey: 'taToken',
  onUnauthorized: () => {
    safeRemoveItem('taToken');
    window.location.href = '/ta/login';
  }
});

export default taApi;
