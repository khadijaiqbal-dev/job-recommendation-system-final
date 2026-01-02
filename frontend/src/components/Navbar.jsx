import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Decode JWT token to get user info
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const isAuthenticated = localStorage.getItem("token");

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">JobMatch</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>

            {isAuthenticated ? (
              <>
                {/* Admin Navigation */}
                {user?.role === "admin" && (
                  <>
                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Admin Dashboard
                    </Link>
                  </>
                )}

                {/* Job Seeker Navigation */}
                {user?.role === "job_seeker" && (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      My Dashboard
                    </Link>
                    <Link to="/jobs" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Jobs
                    </Link>
                    <Link to="/applications" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Applications
                    </Link>
                    <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Profile
                    </Link>
                  </>
                )}

                {/* Common Navigation */}
                <div className="flex items-center space-x-4">
                  <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Home
              </Link>
              <Link to="/jobs" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Jobs
              </Link>

              {isAuthenticated ? (
                <>
                  {/* Admin Mobile Navigation */}
                  {user?.role === "admin" && (
                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                      Admin Dashboard
                    </Link>
                  )}

                  {/* Job Seeker Mobile Navigation */}
                  {user?.role === "job_seeker" && (
                    <>
                      <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                        My Dashboard
                      </Link>
                      <Link to="/jobs" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                        Jobs
                      </Link>
                      <Link to="/applications" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                        Applications
                      </Link>
                      <Link to="/profile" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                        Profile
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center px-3 py-2">
                      <span className="text-sm text-gray-500">Welcome, {user?.firstName || user?.email}</span>
                    </div>
                    <div className="px-3 py-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user?.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user?.role === "admin" ? "Admin" : "Job Seeker"}
                      </span>
                    </div>
                    <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
