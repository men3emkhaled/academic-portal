import createApiClient from './createApiClient';
import { safeRemoveItem } from '../utils/localStorage';

const doctorApi = createApiClient({
  tokenKey: 'doctorToken',
  onUnauthorized: () => {
    safeRemoveItem('doctorToken');
    window.location.href = '/doctor/login';
  }
});

export default doctorApi;
