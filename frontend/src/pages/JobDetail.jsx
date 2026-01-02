import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JobApplicationModal from "../components/JobApplicationModal";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
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
    };

    fetchJob();
  }, [id]);

  const handleApplyClick = () => {
    setShowApplicationModal(true);
  };

  const handleApply = async (jobId, coverLetter) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coverLetter }),
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => navigate("/jobs")} className="btn-primary">
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
        <button onClick={() => navigate("/jobs")} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="card mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{job.companyName}</p>
              <div className="flex items-center space-x-6 text-gray-500">
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
                  {job.jobType}
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
                  ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="ml-6">
              <button onClick={handleApplyClick} className="btn-primary text-lg px-6 py-3">
                Apply Now
              </button>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>
        </div>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="card mb-8">
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
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill, index) => (
                <span key={index} className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Company Info */}
        <div className="card mb-8">
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
                <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                  {job.companyWebsite}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Apply Button */}
        <div className="text-center">
          <button onClick={handleApplyClick} className="btn-primary text-lg px-8 py-3">
            Apply for this Position
          </button>
        </div>
      </div>

      {/* Application Modal */}
      <JobApplicationModal job={job} isOpen={showApplicationModal} onClose={() => setShowApplicationModal(false)} onApply={handleApply} />
    </div>
  );
};

export default JobDetail;
