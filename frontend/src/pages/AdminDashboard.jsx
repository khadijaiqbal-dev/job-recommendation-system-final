import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import AdminJobManagement from './AdminJobManagement';
import { UserManagement } from './UserManagement';
import CompanyManagement from './CompanyManagement';
import ApplicationManagement from './ApplicationManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    {
      id: 'jobs',
      name: 'Job Management',
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
      id: 'companies',
      name: 'Company Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: 'users',
      name: 'User Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      id: 'applications',
      name: 'Application Management',
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
  ];

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'Admin';

  const footerContent = (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">{displayName}</p>
        <p className="text-xs text-gray-500">Administrator</p>
      </div>
    </div>
  );

  const getHeaderTitle = (activeTab) => {
    const tab = tabs.find((t) => t.id === activeTab);
    return tab?.name || 'Admin Dashboard';
  };

  return (
    <DashboardLayout
      tabs={tabs}
      defaultTab="jobs"
      title="JobMatch"
      subtitle="Admin Panel"
      headerTitle={getHeaderTitle}
      headerSubtitle="Manage your job recommendation system"
      footerContent={footerContent}
      onLogout={handleLogout}
    >
      {(activeTab) => (
        <>
          {activeTab === 'jobs' && <AdminJobManagement />}
          {activeTab === 'companies' && <CompanyManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'applications' && <ApplicationManagement />}
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
