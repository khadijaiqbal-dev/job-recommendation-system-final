import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";

const Sidebar = ({ tabs, activeTab, onTabChange, sidebarOpen, onToggleSidebar, title, subtitle, footerContent, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      localStorage.removeItem("token");
      navigate("/");
    }
  };
  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 ease-in-out fixed h-screen z-30`}>
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {sidebarOpen && (
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        )}
        <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Toggle sidebar">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center ${sidebarOpen ? "px-4 py-3" : "px-3 py-3 justify-center"} rounded-lg transition-all duration-200 ${
                activeTab === tab.id ? "bg-[#003659] text-white shadow-sm" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={!sidebarOpen ? tab.name : ""}
            >
              <span className={`${activeTab === tab.id ? "" : "text-gray-500"}`}>{tab.icon}</span>
              {sidebarOpen && <span className="ml-3 font-medium">{tab.name}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className={`absolute ${footerContent && sidebarOpen ? "bottom-20" : "bottom-4"} left-0 right-0 px-3`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            sidebarOpen ? "px-4 py-3" : "px-3 py-3 justify-center"
          } rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700`}
          title={!sidebarOpen ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>

      {/* Sidebar Footer */}
      {sidebarOpen && footerContent && <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">{footerContent}</div>}
    </aside>
  );
};

export default Sidebar;
