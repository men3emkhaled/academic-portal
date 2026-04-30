import React, { createContext, useState, useContext, useEffect } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/localStorage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(safeGetItem('adminToken'));

  useEffect(() => {
    if (token) {
      safeSetItem('adminToken', token);
    } else {
      safeRemoveItem('adminToken');
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};