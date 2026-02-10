import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [],
    experienceYears: 0,
    linkedinUrl: "",
    githubUrl: "",
    resumeUrl: "",
    preferredJobTypes: [],
    preferredLocations: [],
    salaryExpectationMin: null,
    salaryExpectationMax: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [availableSkills, setAvailableSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const { getAuthHeader } = useAuth();

  const jobTypes = ["Full-time", "Part-time", "Contract", "Remote", "Freelance", "Internship"];
  const workLocations = ["Remote", "Hybrid", "On-site", "Flexible"];

  useEffect(() => {
    fetchProfile();
    fetchAvailableSkills();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/profile", {
        headers: getAuthHeader(),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          location: userData.location || "",
          bio: userData.bio || "",
          skills: userData.skills || [],
          experienceYears: userData.experienceYears || 0,
          linkedinUrl: userData.linkedinUrl || "",
          githubUrl: userData.githubUrl || "",
          resumeUrl: userData.resumeUrl || "",
          preferredJobTypes: userData.preferredJobTypes || [],
          preferredLocations: userData.preferredLocations || [],
          salaryExpectationMin: userData.salaryExpectationMin || null,
          salaryExpectationMax: userData.salaryExpectationMax || null,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await fetch("/api/skills");
      if (response.ok) {
        const data = await response.json();
        setAvailableSkills(data.skills || []);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setUser({
      ...user,
      [name]: type === "number" ? (value ? parseInt(value) : null) : value,
    });
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setNewSkill(value);

    if (value.trim()) {
      const filtered = availableSkills
        .filter(skill =>
          skill.name.toLowerCase().includes(value.toLowerCase()) &&
          !user.skills.includes(skill.name)
        )
        .slice(0, 10);
      setFilteredSkills(filtered);
      setShowSkillDropdown(true);
    } else {
      setFilteredSkills(availableSkills.filter(skill => !user.skills.includes(skill.name)).slice(0, 10));
      setShowSkillDropdown(true);
    }
  };

  const handleSkillSelect = (skillName) => {
    if (!user.skills.includes(skillName)) {
      setUser({
        ...user,
        skills: [...user.skills, skillName],
      });
    }
    setNewSkill("");
    setShowSkillDropdown(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setUser({
      ...user,
      skills: user.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleJobTypeToggle = (type) => {
    const newTypes = user.preferredJobTypes.includes(type)
      ? user.preferredJobTypes.filter(t => t !== type)
      : [...user.preferredJobTypes, type];
    setUser({ ...user, preferredJobTypes: newTypes });
  };

  const handleLocationToggle = (location) => {
    const newLocations = user.preferredLocations.includes(location)
      ? user.preferredLocations.filter(l => l !== location)
      : [...user.preferredLocations, location];
    setUser({ ...user, preferredLocations: newLocations });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: user.bio,
          skills: user.skills,
          experienceYears: user.experienceYears,
          location: user.location,
          phone: user.phone,
          linkedinUrl: user.linkedinUrl,
          githubUrl: user.githubUrl,
          resumeUrl: user.resumeUrl,
          preferredJobTypes: user.preferredJobTypes,
          preferredLocations: user.preferredLocations,
          salaryExpectationMin: user.salaryExpectationMin,
          salaryExpectationMax: user.salaryExpectationMax,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                {user.location && <p className="text-gray-500 text-sm mt-1">{user.location}</p>}
                {user.experienceYears > 0 && (
                  <p className="text-gray-500 text-sm mt-1">{user.experienceYears} years experience</p>
                )}
              </div>

              {/* Resume */}
              {user.resumeUrl && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Resume
                  </a>
                </div>
              )}

              {/* Social Links */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center space-x-4">
                {user.linkedinUrl && (
                  <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {user.githubUrl && (
                  <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2.5 py-1 rounded-full">
                      {skill}
                      {isEditing && (
                        <button onClick={() => handleRemoveSkill(skill)} className="ml-1 text-blue-600 hover:text-blue-800 font-bold">
                          x
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>
              {isEditing && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search and add skills..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newSkill}
                    onChange={handleSkillInputChange}
                    onFocus={() => {
                      if (availableSkills.length > 0) {
                        setFilteredSkills(availableSkills.filter(s => !user.skills.includes(s.name)).slice(0, 10));
                        setShowSkillDropdown(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                  />
                  {showSkillDropdown && filteredSkills.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredSkills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleSkillSelect(skill.name)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50"
                        >
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={user.firstName}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={user.lastName}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={user.email}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={user.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={user.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    name="experienceYears"
                    min="0"
                    max="50"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={user.experienceYears || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={user.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Social & Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={user.linkedinUrl}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    name="githubUrl"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={user.githubUrl}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
                  <input
                    type="url"
                    name="resumeUrl"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={user.resumeUrl}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="https://example.com/my-resume.pdf"
                  />
                </div>
              </div>
            </div>

            {/* Job Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Preferences</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Job Types</label>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => isEditing && handleJobTypeToggle(type)}
                      disabled={!isEditing}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        user.preferredJobTypes.includes(type)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } ${!isEditing ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Location Preference</label>
                <div className="flex flex-wrap gap-2">
                  {workLocations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => isEditing && handleLocationToggle(location)}
                      disabled={!isEditing}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        user.preferredLocations.includes(location)
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } ${!isEditing ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Expected Salary (USD)</label>
                  <input
                    type="number"
                    name="salaryExpectationMin"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={user.salaryExpectationMin || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Expected Salary (USD)</label>
                  <input
                    type="number"
                    name="salaryExpectationMax"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={user.salaryExpectationMax || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="80000"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
