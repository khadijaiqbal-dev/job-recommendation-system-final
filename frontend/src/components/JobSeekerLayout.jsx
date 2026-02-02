import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from './DashboardLayout';

const JobSeekerLayout = () => {
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: getAuthHeader(),
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [getAuthHeader]);

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: 'jobs',
      name: 'Jobs',
      path: '/jobs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: 'applications',
      name: 'Applications',
      path: '/applications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: 'profile',
      name: 'Profile',
      path: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  const handleTabChange = (tabId) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.path) {
      navigate(tab.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Sync default tab with route
  const getDefaultTab = () => {
    if (location.pathname === '/profile') {
      return 'profile';
    }
    if (location.pathname === '/applications' || location.pathname.startsWith('/applications/')) {
      return 'applications';
    }
    if (location.pathname === '/jobs' || location.pathname.startsWith('/jobs/')) {
      return 'jobs';
    }
    return 'dashboard';
  };

  // Combine user data from auth context and profile API
  const displayName = profileData?.firstName || user?.firstName || user?.email?.split('@')[0] || 'User';

  const footerContent = (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">{displayName}</p>
        <p className="text-xs text-gray-500">Job Seeker</p>
      </div>
    </div>
  );

  const getHeaderTitle = (activeTab) => {
    if (activeTab === 'dashboard') {
      return `Welcome back, ${displayName}!`;
    }
    if (activeTab === 'jobs') {
      return 'Find Your Next Job';
    }
    if (activeTab === 'applications') {
      return 'My Applications';
    }
    return tabs.find((tab) => tab.id === activeTab)?.name || 'Profile';
  };

  const getHeaderSubtitle = (activeTab) => {
    if (activeTab === 'dashboard') {
      return 'Track your job applications and discover new opportunities';
    }
    if (activeTab === 'jobs') {
      return 'Discover opportunities that match your skills and interests';
    }
    if (activeTab === 'applications') {
      return 'Track the status of your job applications';
    }
    return 'Manage your profile and preferences';
  };

  return (
    <DashboardLayout
      tabs={tabs}
      defaultTab={getDefaultTab()}
      title="JobMatch"
      subtitle="Job Seeker Portal"
      headerTitle={getHeaderTitle}
      headerSubtitle={getHeaderSubtitle}
      footerContent={footerContent}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
};

export default JobSeekerLayout;
