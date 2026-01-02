import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token')
  const location = useLocation()

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userRole = payload.role

    // If role is required and user doesn't have it, redirect to appropriate dashboard
    if (requiredRole && userRole !== requiredRole) {
      if (userRole === 'admin') {
        return <Navigate to="/admin" replace />
      } else {
        return <Navigate to="/dashboard" replace />
      }
    }

    // If user is admin but trying to access job-seeker routes, redirect to admin
    if (userRole === 'admin' && !requiredRole && location.pathname.startsWith('/dashboard')) {
      return <Navigate to="/admin" replace />
    }

    // If user is job-seeker but trying to access admin routes, redirect to dashboard
    if (userRole === 'job_seeker' && location.pathname.startsWith('/admin')) {
      return <Navigate to="/dashboard" replace />
    }

    return children
  } catch (error) {
    console.error('Error decoding token:', error)
    localStorage.removeItem('token')
    return <Navigate to="/login" replace />
  }
}

export default ProtectedRoute
