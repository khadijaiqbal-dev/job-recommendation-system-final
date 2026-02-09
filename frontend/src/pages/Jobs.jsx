import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import JobApplicationModal from "../components/JobApplicationModal";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [isAIPowered, setIsAIPowered] = useState(false);
  const [savingJobs, setSavingJobs] = useState(new Set());
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: "",
    salary: "",
  });
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();

  // Fetch saved job IDs
  const fetchSavedJobIds = useCallback(async () => {
    try {
      const response = await fetch("/api/saved-jobs/ids", {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setSavedJobIds(new Set(data.savedJobIds || []));
      }
    } catch (error) {
      console.error("Error fetching saved job IDs:", error);
    }
  }, [getAuthHeader]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/users/profile", {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [getAuthHeader]);

  // Fetch AI recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await fetch("/api/recommendations?limit=5", {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setIsAIPowered(data.aiPowered || false);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }, [getAuthHeader]);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.location) queryParams.append("location", filters.location);
      if (filters.type) queryParams.append("jobType", filters.type);
      if (filters.salary) {
        const [min, max] = filters.salary.split("-");
        if (min) queryParams.append("salaryMin", min.replace(/\D/g, ""));
        if (max && max !== "+")
          queryParams.append("salaryMax", max.replace(/\D/g, ""));
      }

      const response = await fetch(`/api/jobs?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobIds();
    fetchUserProfile();
    fetchRecommendations();
  }, [fetchJobs, fetchSavedJobIds, fetchUserProfile, fetchRecommendations]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveJob = async (jobId) => {
    if (savingJobs.has(jobId)) return;

    setSavingJobs((prev) => new Set(prev).add(jobId));

    try {
      if (savedJobIds.has(jobId)) {
        // Unsave job
        const response = await fetch(`/api/saved-jobs/${jobId}`, {
          method: "DELETE",
          headers: getAuthHeader(),
        });

        if (response.ok) {
          setSavedJobIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        }
      } else {
        // Save job
        const response = await fetch(`/api/saved-jobs/${jobId}`, {
          method: "POST",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          setSavedJobIds((prev) => new Set(prev).add(jobId));
        }
      }
    } catch (error) {
      console.error("Error toggling save job:", error);
    } finally {
      setSavingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApply = async (jobId, applicationData) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        setShowApplicationModal(false);
        setSelectedJob(null);
        // Refresh jobs and recommendations
        fetchJobs();
        fetchRecommendations();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Error submitting application");
    }
  };

  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const formatJobType = (type) => {
    if (!type) return "";
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto">
        {/* AI Recommendations Section */}
        {recommendations.length > 0 && showRecommendations && (
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-indigo-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recommended For You
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isAIPowered
                        ? "AI-powered matches based on your skills and interests"
                        : "Based on your profile"}
                    </p>
                  </div>
                  {isAIPowered && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                      AI Powered
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((job) => (
                  <div
                    key={`rec-${job.id}`}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewDetails(job.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {job.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {job.company || job.companyName}
                        </p>
                      </div>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {job.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{job.location}</p>
                    {job.matchingSkills && job.matchingSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.matchingSkills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        ${job.salaryMin?.toLocaleString()} - $
                        {job.salaryMax?.toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyClick(job);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                name="search"
                placeholder="Job title, company..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="City, state..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                name="type"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Range
              </label>
              <select
                name="salary"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.salary}
                onChange={handleFilterChange}
              >
                <option value="">Any Salary</option>
                <option value="0-50000">$0 - $50k</option>
                <option value="50000-75000">$50k - $75k</option>
                <option value="75000-100000">$75k - $100k</option>
                <option value="100000+">$100k+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      {job.isNew && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                      {savedJobIds.has(job.id) && (
                        <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Saved
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-gray-600 mb-1">
                      {job.companyName}
                    </p>
                    <p className="text-gray-500 mb-3">{job.location}</p>

                    <div className="flex items-center flex-wrap gap-4 mb-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatJobType(job.jobType)}
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        ${job.salaryMin?.toLocaleString()} - $
                        {job.salaryMax?.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired?.slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired?.length > 6 && (
                        <span className="text-sm text-gray-500">
                          +{job.skillsRequired.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => handleApplyClick(job)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm font-medium"
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => handleSaveJob(job.id)}
                      disabled={savingJobs.has(job.id)}
                      className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm flex items-center justify-center ${
                        savedJobIds.has(job.id)
                          ? "bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      } ${savingJobs.has(job.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {savingJobs.has(job.id) ? (
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <>
                          <svg
                            className={`w-4 h-4 mr-1 ${savedJobIds.has(job.id) ? "fill-current" : ""}`}
                            fill={
                              savedJobIds.has(job.id) ? "currentColor" : "none"
                            }
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                          </svg>
                          {savedJobIds.has(job.id) ? "Saved" : "Save Job"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleViewDetails(job.id)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No jobs found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      <JobApplicationModal
        job={selectedJob}
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedJob(null);
        }}
        onApply={handleApply}
        userProfile={userProfile}
      />
    </div>
  );
};

export default Jobs;
