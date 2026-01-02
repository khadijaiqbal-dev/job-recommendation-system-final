import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    salary: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const queryParams = new URLSearchParams()
        if (filters.search) queryParams.append('search', filters.search)
        if (filters.location) queryParams.append('location', filters.location)
        if (filters.type) queryParams.append('type', filters.type)
        if (filters.salary) queryParams.append('salary', filters.salary)

        const response = await fetch(`/api/jobs?${queryParams}`)
        if (response.ok) {
          const data = await response.json()
          setJobs(data.jobs || [])
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [filters])

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Application submitted successfully!')
      } else {
        alert('Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      alert('Error submitting application')
    }
  }

  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Job</h1>
          <p className="text-gray-600">Discover opportunities that match your skills and interests</p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                name="search"
                placeholder="Job title, company..."
                className="input-field"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                placeholder="City, state..."
                className="input-field"
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select
                name="type"
                className="input-field"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
              <select
                name="salary"
                className="input-field"
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
              <div key={job.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      {job.isNew && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-gray-600 mb-1">{job.companyName}</p>
                    <p className="text-gray-500 mb-3">{job.location}</p>
                    
                    <div className="flex items-center space-x-6 mb-4">
                      <span className="text-sm text-gray-500">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.jobType}
                      </span>
                      <span className="text-sm text-gray-500">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">{job.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired?.map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => handleApply(job.id)}
                      className="btn-primary whitespace-nowrap"
                    >
                      Apply Now
                    </button>
                    <button className="btn-secondary whitespace-nowrap">
                      Save Job
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
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Jobs
