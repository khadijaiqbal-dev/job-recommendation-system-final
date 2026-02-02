import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import RoleBasedRedirect from './components/auth/RoleBasedRedirect';

// Layouts
import Navbar from './components/Navbar';
import JobSeekerLayout from './components/JobSeekerLayout';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Job Seeker pages
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import Applications from './pages/Applications';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes with Navbar */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Home />
                </>
              }
            />

            {/* Auth Routes - Redirect to dashboard if already logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute restricted>
                  <Navbar />
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute restricted>
                  <Navbar />
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-email"
              element={
                <>
                  <Navbar />
                  <EmailVerification />
                </>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute restricted>
                  <Navbar />
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <>
                  <Navbar />
                  <ResetPassword />
                </>
              }
            />

            {/* Role-based redirect */}
            <Route path="/redirect" element={<RoleBasedRedirect />} />

            {/* Job Seeker Protected Routes with Layout */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['job_seeker']}>
                  <JobSeekerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/applications/:id" element={<Applications />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect based on auth status */}
            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
