import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JobApplicationModal from '../components/JobApplicationModal';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const { getAuthHeader } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchSavedJobs = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/saved-jobs?page=${page}&limit=10`, {
        headers: getAuthHeader()
      });

      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data.savedJobs || []);
        setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      const response = await fetch(`/api/saved-jobs/${jobId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.ok) {
        setSavedJobs(savedJobs.filter(job => job.jobId !== jobId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  const handleApplyClick = (job) => {
    setSelectedJob({
      id: job.jobId,
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      jobType: job.jobType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.currency,
      skillsRequired: job.skillsRequired
    });
    setShowApplicationModal(true);
  };

  const handleApply = async (jobId, applicationData) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        alert('Application submitted successfully!');
        setShowApplicationModal(false);
        setSelectedJob(null);
        // Refresh saved jobs to update applied status
        fetchSavedJobs(pagination.current);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Error submitting application');
    }
  };

  const handleEditNotes = (job) => {
    setEditingNotes(job.jobId);
    setNoteText(job.notes || '');
  };

  const handleSaveNotes = async (jobId) => {
    try {
      const response = await fetch(`/api/saved-jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: noteText })
      });

      if (response.ok) {
        setSavedJobs(savedJobs.map(job =>
          job.jobId === jobId ? { ...job, notes: noteText } : job
        ));
        setEditingNotes(null);
        setNoteText('');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
              <p className="mt-1 text-sm text-gray-500">
                {pagination.total} job{pagination.total !== 1 ? 's' : ''} saved to your wishlist
              </p>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse More Jobs
            </button>
          </div>
        </div>

        {/* Saved Jobs List */}
        {savedJobs.length > 0 ? (
          <div className="space-y-6">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Job Header */}
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                            onClick={() => navigate(`/jobs/${job.jobId}`)}>
                          {job.title}
                        </h3>
                        {job.hasApplied && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Applied
                          </span>
                        )}
                        {!job.isActive && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Closed
                          </span>
                        )}
                      </div>

                      {/* Company Info */}
                      <p className="text-lg text-gray-600 mb-1">{job.companyName}</p>
                      <p className="text-gray-500 mb-3">{job.location}</p>

                      {/* Job Details */}
                      <div className="flex items-center flex-wrap gap-4 mb-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatJobType(job.jobType)}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} {job.currency || 'USD'}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Saved {formatDate(job.savedAt)}
                        </span>
                      </div>

                      {/* Skills */}
                      {job.skillsRequired && job.skillsRequired.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skillsRequired.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skillsRequired.length > 5 && (
                            <span className="text-sm text-gray-500">+{job.skillsRequired.length - 5} more</span>
                          )}
                        </div>
                      )}

                      {/* Notes Section */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {editingNotes === job.jobId ? (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Personal Notes</label>
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              rows={2}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Add notes about this job..."
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveNotes(job.jobId)}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingNotes(null);
                                  setNoteText('');
                                }}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            {job.notes ? (
                              <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Notes:</p>
                                <p className="text-sm text-gray-700">{job.notes}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No notes added</p>
                            )}
                            <button
                              onClick={() => handleEditNotes(job)}
                              className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                            >
                              {job.notes ? 'Edit' : 'Add note'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-6 flex flex-col space-y-2">
                      {!job.hasApplied && job.isActive && (
                        <button
                          onClick={() => handleApplyClick(job)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm font-medium"
                        >
                          Apply Now
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/jobs/${job.jobId}`)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleUnsaveJob(job.jobId)}
                        className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap text-sm flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => fetchSavedJobs(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.pages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => fetchSavedJobs(index + 1)}
                      className={`px-4 py-2 text-sm font-medium border-t border-b ${
                        pagination.current === index + 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => fetchSavedJobs(pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No saved jobs yet</h3>
            <p className="mt-2 text-gray-500">
              Start saving jobs you're interested in to easily access them later.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/jobs')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Jobs
              </button>
            </div>
          </div>
        )}
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

export default SavedJobs;
