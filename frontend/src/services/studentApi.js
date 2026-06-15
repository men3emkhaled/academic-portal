import createApiClient from './createApiClient';
import { safeRemoveItem } from '../utils/localStorage';

const studentApi = createApiClient({
  tokenKey: 'studentToken',
  onUnauthorized: () => {
    safeRemoveItem('studentToken');
    window.location.href = '/student/login';
  }
});

export default studentApi;
