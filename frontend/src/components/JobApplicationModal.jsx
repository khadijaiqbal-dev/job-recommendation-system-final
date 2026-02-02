import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const JobApplicationModal = ({ job, isOpen, onClose, onApply, userProfile }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeSource, setResumeSource] = useState('profile');
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const { getAuthHeader } = useAuth();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCoverLetter('');
      setResumeSource(userProfile?.resumeUrl ? 'profile' : 'upload');
      setUploadedResumeUrl('');
      setUploadedFile(null);
      setUploadError('');
    }
  }, [isOpen, userProfile]);

  if (!isOpen || !job) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploadError('');
    setUploadedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedResumeUrl(data.resumeUrl || data.url);
        setResumeSource('uploaded');
      } else {
        const errorData = await response.json();
        setUploadError(errorData.error || 'Failed to upload resume');
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      setUploadError('Failed to upload resume. Please try again.');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const applicationData = {
      coverLetter,
      resumeSource,
      resumeUrl: resumeSource === 'uploaded' ? uploadedResumeUrl : null
    };

    await onApply(job.id, applicationData);
    setIsSubmitting(false);
  };

  const hasProfileResume = userProfile?.resumeUrl;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl shadow-lg rounded-lg bg-white mb-10">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Apply for Position</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Job Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-blue-700">{job.companyName || job.company}</p>
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </p>
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.jobType} • ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} {job.currency || 'USD'}
              </p>
            </div>
            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {job.skillsRequired.slice(0, 6).map((skill, index) => (
                    <span key={index} className="bg-white text-blue-700 text-xs px-2 py-1 rounded border border-blue-200">
                      {skill}
                    </span>
                  ))}
                  {job.skillsRequired.length > 6 && (
                    <span className="text-xs text-gray-500 py-1">+{job.skillsRequired.length - 6} more</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Resume</label>

              {/* Resume Options */}
              <div className="space-y-3">
                {/* Use Profile Resume Option */}
                {hasProfileResume && (
                  <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                    resumeSource === 'profile'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="resumeSource"
                      value="profile"
                      checked={resumeSource === 'profile'}
                      onChange={() => setResumeSource('profile')}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">
                        Use my profile resume
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">
                        Use the resume uploaded during registration
                      </span>
                      <div className="flex items-center mt-2 text-xs text-blue-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Profile Resume
                      </div>
                    </div>
                  </label>
                )}

                {/* Upload New Resume Option */}
                <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                  resumeSource === 'uploaded' || (!hasProfileResume && resumeSource !== 'none')
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="resumeSource"
                    value="uploaded"
                    checked={resumeSource === 'uploaded' || (!hasProfileResume && resumeSource !== 'none')}
                    onChange={() => setResumeSource('uploaded')}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <span className="block text-sm font-medium text-gray-900">
                      Upload a new resume
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      Upload a different resume for this application
                    </span>

                    {(resumeSource === 'uploaded' || !hasProfileResume) && (
                      <div className="mt-3">
                        {uploadedFile ? (
                          <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                            <div className="flex items-center text-sm text-gray-700">
                              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {uploadedFile.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedFile(null);
                                setUploadedResumeUrl('');
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              disabled={isUploading}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className={`flex items-center justify-center p-3 border-2 border-dashed rounded-lg ${
                              isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                            }`}>
                              {isUploading ? (
                                <div className="flex items-center text-blue-600">
                                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Uploading...
                                </div>
                              ) : (
                                <div className="text-center">
                                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <p className="mt-1 text-sm text-gray-600">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">PDF or Word (max 5MB)</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </label>

                {/* No Resume Option */}
                <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                  resumeSource === 'none'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="resumeSource"
                    value="none"
                    checked={resumeSource === 'none'}
                    onChange={() => setResumeSource('none')}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      Apply without resume
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      Submit application using only cover letter
                    </span>
                  </div>
                </label>
              </div>

              {uploadError && (
                <p className="text-sm text-red-600 mt-2">{uploadError}</p>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Tell the employer why you're a great fit for this position..."
              />
              <p className="mt-1 text-xs text-gray-500">
                A personalized cover letter can significantly improve your chances
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;
