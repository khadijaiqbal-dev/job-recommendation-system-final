import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/applications/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/jobs/recommendations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations || []);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
    fetchRecommendations();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800";
      case "SHORT_LISTED":
        return "bg-purple-100 text-purple-800";
      case "SHORT_LISTED_BY_COMPANY":
        return "bg-indigo-100 text-indigo-800";
      case "CALL_FOR_INTERVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "SELECTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd className="text-lg font-medium text-gray-900">{applications.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Applied</dt>
                  <dd className="text-lg font-medium text-gray-900">{applications.filter((app) => app.status === "APPLIED").length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Interviews</dt>
                  <dd className="text-lg font-medium text-gray-900">{applications.filter((app) => app.status === "CALL_FOR_INTERVIEW").length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Selected</dt>
                  <dd className="text-lg font-medium text-gray-900">{applications.filter((app) => app.status === "SELECTED").length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Applications</h3>
              <button onClick={() => navigate("/jobs")} className="text-[#003659] hover:text-[#003659] text-sm font-medium">
                View All Jobs
              </button>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Track the status of your job applications</p>
          </div>

          {applications.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {applications.slice(0, 5).map((application) => (
                <li key={application.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{application.jobTitle}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>{application.status}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <p className="truncate">{application.companyName || application.company}</p>
                        <span className="mx-2">•</span>
                        <p>Applied {formatDate(application.appliedAt)}</p>
                      </div>
                      <button onClick={() => navigate(`/applications/${application.id}`)} className="mt-2 text-xs text-[#003659] hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start applying to jobs to see them here.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/jobs")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#003659] hover:bg-[#003659]"
                >
                  Browse Jobs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Job Recommendations */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recommended Jobs</h3>
              <button onClick={() => navigate("/jobs")} className="text-[#003659] hover:text-[#003659] text-sm font-medium">
                View All
              </button>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Jobs that match your profile and preferences</p>
          </div>

          {recommendations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recommendations.slice(0, 5).map((job, index) => (
                <li key={index}>
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{job.matchScore}% Match</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <p className="truncate">{job.company}</p>
                          <span className="mx-2">•</span>
                          <p>{job.location}</p>
                          <span className="mx-2">•</span>
                          <p>
                            ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} {job.currency}
                          </p>
                        </div>
                        {job.matchingSkills && job.matchingSkills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {job.matchingSkills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {skill}
                              </span>
                            ))}
                            {job.matchingSkills.length > 3 && <span className="text-xs text-gray-500">+{job.matchingSkills.length - 3} more</span>}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#003659] hover:bg-[#003659]"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations yet</h3>
              <p className="mt-1 text-sm text-gray-500">Complete your profile to get personalized job recommendations.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/profile")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#003659] hover:bg-[#003659]"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
