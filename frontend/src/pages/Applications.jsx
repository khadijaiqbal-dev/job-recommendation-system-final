import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Applications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchApplications();
    if (id) {
      fetchApplicationDetails(id);
    }
  }, [id]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplicationDetails = async (applicationId) => {
    try {
      const token = localStorage.getItem("token");
      const [appResponse, historyResponse] = await Promise.all([
        fetch(`/api/applications/${applicationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`/api/applications/${applicationId}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (appResponse.ok) {
        const appData = await appResponse.json();
        setSelectedApplication(appData.application);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setStatusHistory(historyData.history || []);
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
    }
  };

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

  const getStatusLabel = (status) => {
    const labels = {
      APPLIED: "Applied",
      SHORT_LISTED: "Short Listed",
      SHORT_LISTED_BY_COMPANY: "Short Listed by Company",
      CALL_FOR_INTERVIEW: "Call for Interview",
      SELECTED: "Selected",
      REJECTED: "Rejected",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredApplications = filterStatus ? applications.filter((app) => app.status === filterStatus) : applications;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#003659]"></div>
      </div>
    );
  }

  // If viewing a specific application
  if (id && selectedApplication) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate("/applications")} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Applications
          </button>

          <div className="bg-white shadow rounded-lg mb-6 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedApplication.jobTitle}</h1>
                <p className="text-lg text-gray-600">{selectedApplication.company}</p>
                <p className="text-gray-500">{selectedApplication.jobLocation || selectedApplication.location}</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                {getStatusLabel(selectedApplication.status)}
              </span>
            </div>
            <div className="text-sm text-gray-500">Applied on {formatDate(selectedApplication.appliedAt)}</div>
          </div>

          {/* Status Tracking Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Status Timeline</h2>
            {statusHistory.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                  {statusHistory.map((entry, index) => (
                    <div key={entry.id} className="relative flex items-start">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-3 w-3 h-3 rounded-full border-2 border-white ${
                          index === statusHistory.length - 1 ? "bg-[#003659] border-[#003659]" : "bg-gray-400 border-gray-400"
                        }`}
                        style={{ top: "0.5rem" }}
                      ></div>

                      <div className="ml-10 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.newStatus)}`}>{getStatusLabel(entry.newStatus)}</span>
                          <span className="text-xs text-gray-500">{formatDate(entry.createdAt)}</span>
                        </div>
                        {entry.oldStatus && (
                          <p className="text-sm text-gray-600 mb-1">
                            Changed from <span className="font-medium">{getStatusLabel(entry.oldStatus)}</span>
                          </p>
                        )}
                        {entry.changedBy && (
                          <p className="text-xs text-gray-500">
                            Updated by {entry.changedBy.name} {entry.changedBy.email && `(${entry.changedBy.email})`}
                          </p>
                        )}
                        {entry.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            <p className="font-medium mb-1">Notes:</p>
                            <p>{entry.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No status history available</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Applications list view
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">Track the status of your job applications</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORT_LISTED">Short Listed</option>
            <option value="SHORT_LISTED_BY_COMPANY">Short Listed by Company</option>
            <option value="CALL_FOR_INTERVIEW">Call for Interview</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/applications/${application.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>{getStatusLabel(application.status)}</span>
                    </div>
                    <p className="text-gray-600 mb-1">{application.companyName || application.company}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{application.location}</span>
                      <span>•</span>
                      <span>{application.jobType}</span>
                      <span>•</span>
                      <span>Applied {formatDate(application.appliedAt)}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/applications/${application.id}`);
                      }}
                      className="text-[#003659] hover:text-[#003659] font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">{filterStatus ? "No applications with this status." : "Start applying to jobs to see them here."}</p>
            {!filterStatus && (
              <div className="mt-6">
                <button
                  onClick={() => navigate("/jobs")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#003659] hover:bg-[#003659]"
                >
                  Browse Jobs
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
