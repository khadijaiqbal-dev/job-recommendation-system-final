import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ tabs, defaultTab, title, subtitle, headerTitle, headerSubtitle, footerContent, children, onTabChange: externalTabChange, onLogout }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (externalTabChange) {
      externalTabChange(tabId);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        title={title}
        subtitle={subtitle}
        footerContent={footerContent}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-[#003659]">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black">{typeof headerTitle === "function" ? headerTitle(activeTab) : headerTitle || currentTab?.name || "Dashboard"}</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-12">
          <div className="">{typeof children === "function" ? children(activeTab) : children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
