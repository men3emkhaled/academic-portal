import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/localStorage';
import taApiService from '../services/taApi';

const TAAuthContext = createContext();

export const useTAAuth = () => useContext(TAAuthContext);

export const TAAuthProvider = ({ children }) => {
  const [token, setToken] = useState(safeGetItem('taToken'));
  const [ta, setTA] = useState(null);
  const [loading, setLoading] = useState(true);

  const taApi = useCallback((method, url, data, customHeaders = {}) => {
    return taApiService({
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
      safeSetItem('taToken', token);
      taApiService.get('/ta/profile')
        .then(res => {
          setTA(res.data);
          setLoading(false);
        })
        .catch(() => {
          setToken(null);
          setTA(null);
          safeRemoveItem('taToken');
          setLoading(false);
        });
    } else {
      safeRemoveItem('taToken');
      setTA(null);
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, taData) => {
    setToken(newToken);
    setTA(taData);
  };

  const logout = () => {
    setToken(null);
    setTA(null);
  };

  return (
    <TAAuthContext.Provider value={{ token, ta, loading, login, logout, taApi }}>
      {children}
    </TAAuthContext.Provider>
  );
};
