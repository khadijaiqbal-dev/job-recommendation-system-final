import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const RoleBasedRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userRole = payload.role

      // Redirect based on user role
      if (userRole === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      localStorage.removeItem('token')
      navigate('/login')
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}

export default RoleBasedRedirect
