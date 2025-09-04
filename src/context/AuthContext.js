import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user && !!token);

  const login = (userData, jwtToken) => {
    const now = new Date().toISOString();
    const updatedUser = {
      ...userData,
      status: userData.status || 'Active',
      lastLogin: now,
    };
    setUser(updatedUser);
    setToken(jwtToken);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    isAdmin,
    isUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 