import React, { useState, useEffect } from "react";

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    jobId: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.jobId) queryParams.append("jobId", filters.jobId);
      queryParams.append("page", filters.page);
      queryParams.append("limit", "10");

      const response = await fetch(`/api/applications/admin/all?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatusHistory = async (applicationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/applications/${applicationId}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatusHistory(data.history || []);
      }
    } catch (error) {
      console.error("Error fetching status history:", error);
    }
  };

  const handleStatusChange = (application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setNotes("");
    fetchStatusHistory(application.id);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedApplication || !newStatus) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/applications/${selectedApplication.id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (response.ok) {
        alert("Application status updated successfully!");
        setShowStatusModal(false);
        setSelectedApplication(null);
        fetchApplications();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003659]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Application Management</h2>
          <p className="text-gray-600 mt-1">Manage and track job applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job ID</label>
            <input
              type="text"
              value={filters.jobId}
              onChange={(e) => setFilters({ ...filters, jobId: e.target.value, page: 1 })}
              placeholder="Filter by Job ID"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({ status: "", jobId: "", page: 1 })} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{app.applicantName}</div>
                        <div className="text-sm text-gray-500">{app.applicantEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{app.jobTitle}</div>
                      <div className="text-sm text-gray-500">{app.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{app.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{getStatusLabel(app.status)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(app.appliedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleStatusChange(app)} className="text-[#003659] hover:text-[#003659] mr-4">
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page {pagination.current} of {pagination.pages} (Total: {pagination.total})
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
                disabled={filters.page === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Update Application Status</h3>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedApplication(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Application Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedApplication.jobTitle}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Applicant:</span> {selectedApplication.applicantName} ({selectedApplication.applicantEmail})
                  </p>
                  <p>
                    <span className="font-medium">Company:</span> {selectedApplication.company}
                  </p>
                  <p>
                    <span className="font-medium">Current Status:</span>{" "}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                      {getStatusLabel(selectedApplication.status)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Status History */}
              {statusHistory.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Status History</h4>
                  <div className="space-y-2">
                    {statusHistory.map((entry, index) => (
                      <div key={entry.id} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.newStatus)}`}>{getStatusLabel(entry.newStatus)}</span>
                          <span className="text-xs text-gray-500">{formatDate(entry.createdAt)}</span>
                        </div>
                        {entry.notes && <p className="text-xs text-gray-600 mt-1 ml-2">Note: {entry.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SHORT_LISTED">Short Listed</option>
                    <option value="SHORT_LISTED_BY_COMPANY">Short Listed by Company</option>
                    <option value="CALL_FOR_INTERVIEW">Call for Interview</option>
                    <option value="SELECTED">Selected</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any notes about this status change..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedApplication(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || newStatus === selectedApplication.status}
                    className="px-4 py-2 bg-[#003659] text-white rounded-md hover:bg-[#003659] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
