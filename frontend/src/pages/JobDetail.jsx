import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import JobApplicationModal from "../components/JobApplicationModal";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
      } else {
        setError("Job not found");
      }
    } catch (err) {
      setError("Error fetching job details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchSavedStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/saved-jobs/${id}/check`, {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
      }
    } catch (err) {
      console.error("Error checking saved status:", err);
    }
  }, [id, getAuthHeader]);

  const fetchSimilarJobs = useCallback(async () => {
    try {
      const response = await fetch(`/api/recommendations/similar/${id}?limit=4`, {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setSimilarJobs(data.similarJobs || []);
      }
    } catch (err) {
      console.error("Error fetching similar jobs:", err);
    }
  }, [id, getAuthHeader]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/users/profile", {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchJob();
    fetchSavedStatus();
    fetchSimilarJobs();
    fetchUserProfile();
  }, [fetchJob, fetchSavedStatus, fetchSimilarJobs, fetchUserProfile]);

  const handleToggleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (isSaved) {
        const response = await fetch(`/api/saved-jobs/${id}`, {
          method: "DELETE",
          headers: getAuthHeader(),
        });
        if (response.ok) {
          setIsSaved(false);
        }
      } else {
        const response = await fetch(`/api/saved-jobs/${id}`, {
          method: "POST",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        if (response.ok) {
          setIsSaved(true);
        }
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyClick = () => {
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
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Error submitting application");
    }
  };

  const formatJobType = (type) => {
    if (!type) return '';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/jobs")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/jobs")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                {isSaved && (
                  <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Saved
                  </span>
                )}
              </div>
              <p className="text-xl text-gray-600 mb-4">{job.companyName}</p>
              <div className="flex items-center flex-wrap gap-4 text-gray-500">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatJobType(job.jobType)}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} {job.currency || 'USD'}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="ml-6 flex flex-col space-y-2">
              <button
                onClick={handleApplyClick}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Apply Now
              </button>
              <button
                onClick={handleToggleSave}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center justify-center ${
                  isSaved
                    ? "bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isSaving ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg
                      className={`w-5 h-5 mr-2 ${isSaved ? "fill-current" : ""}`}
                      fill={isSaved ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {isSaved ? "Saved" : "Save Job"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>
        </div>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
            <ul className="list-disc list-inside space-y-2">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="text-gray-700">
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills Required */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Company Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About {job.companyName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Industry</h3>
              <p className="text-gray-600">{job.companyIndustry || "Not specified"}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Company Size</h3>
              <p className="text-gray-600">{job.companySize || "Not specified"}</p>
            </div>
            {job.companyWebsite && (
              <div className="md:col-span-2">
                <h3 className="font-medium text-gray-900 mb-2">Website</h3>
                <a
                  href={job.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  {job.companyWebsite}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Similar Jobs</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                AI Suggested
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {similarJobs.map((similarJob) => (
                <div
                  key={similarJob.id}
                  onClick={() => navigate(`/jobs/${similarJob.id}`)}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{similarJob.title}</h3>
                      <p className="text-sm text-gray-600">{similarJob.company || similarJob.companyName}</p>
                    </div>
                    {similarJob.similarityScore && (
                      <span className="text-xs text-green-600 font-medium">
                        {similarJob.similarityScore}% Similar
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{similarJob.location}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      ${similarJob.salaryMin?.toLocaleString()} - ${similarJob.salaryMax?.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">{formatJobType(similarJob.jobType)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <div className="text-center">
          <button
            onClick={handleApplyClick}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            Apply for this Position
          </button>
        </div>
      </div>

      {/* Application Modal */}
      <JobApplicationModal
        job={job}
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onApply={handleApply}
        userProfile={userProfile}
      />
    </div>
  );
};

export default JobDetail;
