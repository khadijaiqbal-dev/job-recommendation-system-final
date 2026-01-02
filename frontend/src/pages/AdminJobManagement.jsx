import React, { useState, useEffect } from "react";
import { Trash, Edit } from "lucide-react";

const AdminJobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    companyId: "",
    companyName: "",
    title: "",
    description: "",
    requirements: [],
    skillsRequired: [],
    location: "",
    jobType: "full_time",
    experienceLevel: "entry",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    isActive: true,
  });
  const [skillsInput, setSkillsInput] = useState("");
  const [skillsSuggestions, setSkillsSuggestions] = useState([]);
  const [showSkillsSuggestions, setShowSkillsSuggestions] = useState(false);
  const [requirementsInput, setRequirementsInput] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchSkills();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/companies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch("/api/skills");

      if (response.ok) {
        const data = await response.json();
        setAllSkills(data.skills || []);
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      });

      const response = await fetch(`/api/jobs/admin?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setError("Failed to fetch jobs");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSkillsChange = (e) => {
    const value = e.target.value;
    setSkillsInput(value);

    // Filter skills suggestions
    if (value.trim()) {
      const filtered = allSkills.filter((skill) => skill.name.toLowerCase().includes(value.toLowerCase()) && !formData.skillsRequired.includes(skill.name)).slice(0, 5);
      setSkillsSuggestions(filtered);
      setShowSkillsSuggestions(true);
    } else {
      setSkillsSuggestions([]);
      setShowSkillsSuggestions(false);
    }
  };

  const handleSelectSkill = (skillName) => {
    if (!formData.skillsRequired.includes(skillName)) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skillName],
      }));
    }
    setSkillsInput("");
    setShowSkillsSuggestions(false);
  };

  const handleRequirementsChange = (e) => {
    setRequirementsInput(e.target.value);
  };

  const addSkill = () => {
    const skillName = skillsInput.trim();
    if (skillName && !formData.skillsRequired.includes(skillName)) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skillName],
      }));
      setSkillsInput("");
      setShowSkillsSuggestions(false);
    }
  };

  const addRequirement = () => {
    if (requirementsInput.trim() && !formData.requirements.includes(requirementsInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirementsInput.trim()],
      }));
      setRequirementsInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((skill) => skill !== skillToRemove),
    }));
  };

  const removeRequirement = (requirementToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((req) => req !== requirementToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingJob ? `/api/jobs/${editingJob.id}` : "/api/jobs";
      const method = editingJob ? "PUT" : "POST";

      // Prepare data for API
      const submitData = {
        ...formData,
        companyId: formData.companyId ? parseInt(formData.companyId) : null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        alert(editingJob ? "Job updated successfully!" : "Job created successfully!");
        setShowJobForm(false);
        setEditingJob(null);
        resetForm();
        fetchJobs();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to save job"}`);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      companyId: job.companyId || job.company_id || "",
      companyName: job.companyName || job.company_name || "",
      title: job.title,
      description: job.description,
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      skillsRequired: Array.isArray(job.skillsRequired) ? job.skillsRequired : Array.isArray(job.skills_required) ? job.skills_required : [],
      location: job.location,
      jobType: job.jobType || job.job_type,
      experienceLevel: job.experienceLevel || job.experience_level,
      salaryMin: job.salaryMin || job.salary_min,
      salaryMax: job.salaryMax || job.salary_max,
      currency: job.currency,
      isActive: job.isActive !== undefined ? job.isActive : job.is_active,
    });
    setShowJobForm(true);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Job deleted successfully!");
        fetchJobs();
      } else {
        alert("Failed to delete job");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const resetForm = () => {
    setFormData({
      companyId: "",
      companyName: "",
      title: "",
      description: "",
      requirements: [],
      skillsRequired: [],
      location: "",
      jobType: "full_time",
      experienceLevel: "entry",
      salaryMin: "",
      salaryMax: "",
      currency: "USD",
      isActive: true,
    });
    setSkillsInput("");
    setRequirementsInput("");
    setShowSkillsSuggestions(false);
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    const selectedCompany = companies.find((c) => c.id === parseInt(companyId));
    setFormData((prev) => ({
      ...prev,
      companyId: companyId,
      companyName: selectedCompany ? selectedCompany.name : "",
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSalary = (min, max, currency) => {
    if (!min && !max) return "Not specified";
    return `${currency} ${min?.toLocaleString() || "0"} - ${currency} ${max?.toLocaleString() || "0"}`;
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
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-2">Manage job postings and applications</p>
        </div>
        <button
          onClick={() => {
            setShowJobForm(true);
            setEditingJob(null);
            resetForm();
          }}
          className="bg-[#003659] hover:bg-[#003659] text-white px-6 py-3 font-medium rounded-full"
        >
          Add New Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
                  <dd className="text-lg font-medium text-gray-900">{jobs.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg ">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                  <dd className="text-lg font-medium text-gray-900">{jobs.filter((job) => job.isActive !== false && job.is_active !== false).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg ">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Inactive Jobs</dt>
                  <dd className="text-lg font-medium text-gray-900">{jobs.filter((job) => job.isActive === false || job.is_active === false).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Jobs Management</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage job postings, edit details, and track applications</p>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border-t border-red-200">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Jobs List */}
        <ul className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <li key={job.id}>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          job.isActive !== false && job.is_active !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {job.isActive !== false && job.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{job.companyName || job.company_name}</p>
                    <p className="text-gray-500 mb-2">{job.location}</p>

                    <div className="flex items-center space-x-6 mb-2">
                      <span className="text-sm text-gray-500">{job.jobType || job.job_type}</span>
                      <span className="text-sm text-gray-500">{job.experienceLevel || job.experience_level}</span>
                      <span className="text-sm text-gray-500">{formatSalary(job.salaryMin || job.salary_min, job.salaryMax || job.salary_max, job.currency)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {(job.skillsRequired || job.skills_required || []).slice(0, 3).map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                      {(job.skillsRequired || job.skills_required || []).length > 3 && (
                        <span className="text-xs text-gray-500">+{(job.skillsRequired || job.skills_required || []).length - 3} more</span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">Posted: {formatDate(job.createdAt || job.created_at)}</p>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => handleEdit(job)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-[#003659] bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{editingJob ? "Edit Job" : "Add New Job"}</h3>
                <button
                  onClick={() => {
                    setShowJobForm(false);
                    setEditingJob(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <select
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleCompanyChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                    <input
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                    <input
                      type="number"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={requirementsInput}
                      onChange={handleRequirementsChange}
                      placeholder="Add a requirement"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                    />
                    <button type="button" onClick={addRequirement} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((requirement, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        {requirement}
                        <button type="button" onClick={() => removeRequirement(requirement)} className="ml-2 text-green-600 hover:text-green-800">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required</label>
                  <div className="relative">
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={skillsInput}
                          onChange={handleSkillsChange}
                          onFocus={() => {
                            if (skillsInput.trim()) {
                              handleSkillsChange({ target: { value: skillsInput } });
                            }
                          }}
                          onBlur={() => {
                            // Delay to allow clicking on suggestions
                            setTimeout(() => setShowSkillsSuggestions(false), 200);
                          }}
                          placeholder="Type to search or add new skill"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (skillsSuggestions.length > 0) {
                                handleSelectSkill(skillsSuggestions[0].name);
                              } else {
                                addSkill();
                              }
                            }
                          }}
                        />
                        {showSkillsSuggestions && skillsSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                            {skillsSuggestions.map((skill) => (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => handleSelectSkill(skill.name)}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                              >
                                {skill.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skillsRequired.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {allSkills.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        {formData.skillsRequired.length} skill(s) selected. Type to search from {allSkills.length} available skills or add a new one.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active Job Posting</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {editingJob ? "Update Job" : "Create Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobManagement;
