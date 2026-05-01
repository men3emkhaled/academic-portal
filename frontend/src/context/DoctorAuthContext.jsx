import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/localStorage';
import api from '../services/api';

const DoctorAuthContext = createContext();

export const useDoctorAuth = () => useContext(DoctorAuthContext);

export const DoctorAuthProvider = ({ children }) => {
  const [token, setToken] = useState(safeGetItem('doctorToken'));
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const doctorApi = useCallback((method, url, data, customHeaders = {}) => {
    return api({
      method,
      url,
      data,
      headers: { 
        Authorization: `Bearer ${token}`,
        ...customHeaders
      }
    });
  }, [token]);

  useEffect(() => {
    if (token) {
      safeSetItem('doctorToken', token);
      // Fetch doctor profile
      api.get('/doctor/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setDoctor(res.data);
          setLoading(false);
        })
        .catch(() => {
          // Invalid token
          setToken(null);
          setDoctor(null);
          safeRemoveItem('doctorToken');
          setLoading(false);
        });
    } else {
      safeRemoveItem('doctorToken');
      setDoctor(null);
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, doctorData) => {
    setToken(newToken);
    setDoctor(doctorData);
  };

  const logout = () => {
    setToken(null);
    setDoctor(null);
  };

  return (
    <DoctorAuthContext.Provider value={{ token, doctor, loading, login, logout, doctorApi }}>
      {children}
    </DoctorAuthContext.Provider>
  );
};
