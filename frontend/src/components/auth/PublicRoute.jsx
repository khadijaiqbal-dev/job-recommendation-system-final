import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PublicRoute - For routes that should only be accessible to non-authenticated users
 * Redirects authenticated users to their appropriate dashboard
 */
const PublicRoute = ({ children, restricted = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If restricted and user is authenticated, redirect to dashboard
  if (restricted && isAuthenticated) {
    // Check if there's a redirect location saved
    const from = location.state?.from?.pathname;

    if (from && !from.includes('/login') && !from.includes('/register')) {
      return <Navigate to={from} replace />;
    }

    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
