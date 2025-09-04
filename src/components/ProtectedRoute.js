import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireUser = false }) => {
  const { isAuthenticated, isAdmin, isUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/user" replace />;
  }

  if (requireUser && !isUser()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute; 