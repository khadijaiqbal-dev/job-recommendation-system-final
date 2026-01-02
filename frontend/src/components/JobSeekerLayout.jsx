import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const JobSeekerLayout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
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
      id: "jobs",
      name: "Jobs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
          />
        </svg>
      ),
    },
    {
      id: "profile",
      name: "Profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const handleTabChange = (tabId) => {
    if (tabId === "profile") {
      navigate("/profile");
    } else if (tabId === "jobs") {
      navigate("/jobs");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Sync default tab with route
  const getDefaultTab = () => {
    if (location.pathname === "/profile") {
      return "profile";
    }
    if (location.pathname === "/jobs" || location.pathname.startsWith("/jobs/")) {
      return "jobs";
    }
    return "dashboard";
  };

  const footerContent = user ? (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">{user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}</span>
        </div>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">{user?.firstName || "User"}</p>
        <p className="text-xs text-gray-500">Job Seeker</p>
      </div>
    </div>
  ) : null;

  const getHeaderTitle = (activeTab) => {
    if (activeTab === "dashboard") {
      return `Welcome back, ${user?.firstName || "Job Seeker"}!`;
    }
    if (activeTab === "jobs") {
      return "Find Your Next Job";
    }
    return tabs.find((tab) => tab.id === activeTab)?.name || "Profile";
  };

  const getHeaderSubtitle = (activeTab) => {
    if (activeTab === "dashboard") {
      return "Track your job applications and discover new opportunities";
    }
    if (activeTab === "jobs") {
      return "Discover opportunities that match your skills and interests";
    }
    return "Manage your profile and preferences";
  };

  return (
    <DashboardLayout
      tabs={tabs}
      defaultTab={getDefaultTab()}
      title="Job Seeker"
      subtitle="Dashboard"
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

