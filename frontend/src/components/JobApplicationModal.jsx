import React, { useState } from "react";

const JobApplicationModal = ({ job, isOpen, onClose, onApply }) => {
  const [coverLetter, setCoverLetter] = useState("");

  if (!isOpen || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(job.id, coverLetter);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Apply for Position</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Job Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium">{job.companyName || job.company}</p>
              <p>{job.location}</p>
              <p>
                {job.jobType} • ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} {job.currency}
              </p>
            </div>
            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Required Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {job.skillsRequired.slice(0, 5).map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {job.skillsRequired.length > 5 && <span className="text-xs text-gray-500">+{job.skillsRequired.length - 5} more</span>}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (Optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell the employer why you're a great fit for this position..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-[#003659] text-white rounded-md hover:bg-[#003659]">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;
