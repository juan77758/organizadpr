import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import socketService from '../services/socketService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario del localStorage al iniciar
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      socketService.connect();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    socketService.connect();
    return data;
  };

  const register = async (email, password, name) => {
    const data = await authService.register(email, password, name);
    setUser(data.user);
    socketService.connect();
    return data;
  };

  const logout = () => {
    socketService.disconnect();
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
