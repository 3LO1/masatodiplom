import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && auth.role !== requiredRole) {
    return <Navigate to="/rooms" replace />;
  }

  return children;
};

export default ProtectedRoute;