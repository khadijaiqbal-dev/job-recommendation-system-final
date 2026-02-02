import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Decode JWT token to get user info
  const decodeToken = useCallback((tokenString) => {
    if (!tokenString) return null;
    try {
      const payload = JSON.parse(atob(tokenString.split('.')[1]));
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return null;
      }
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);

  // Initialize auth state from token
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decoded = decodeToken(storedToken);
        if (decoded) {
          setToken(storedToken);
          setUser(decoded);
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [decodeToken]);

  // Login function
  const login = useCallback((newToken, userData = null) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    const decoded = userData || decodeToken(newToken);
    setUser(decoded);
    setIsAuthenticated(true);
  }, [decodeToken]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('pendingVerificationEmail');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  // Check if user is job seeker
  const isJobSeeker = useCallback(() => {
    return hasRole('job_seeker');
  }, [hasRole]);

  // Get authorization header
  const getAuthHeader = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        // Merge server data with token data
        setUser(prev => ({ ...prev, ...userData }));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [token]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    isAdmin,
    isJobSeeker,
    getAuthHeader,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
