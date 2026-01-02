import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",

    // Professional Information
    currentJobTitle: "",
    experience: "",
    currentCompany: "",
    expectedSalary: "",
    jobType: "",
    workLocation: "",

    // Skills and Education
    skills: [],
    education: "",
    university: "",
    graduationYear: "",

    // Account Security
    password: "",
    confirmPassword: "",

    // Preferences
    jobCategories: [],
    availability: "",
    willingToRelocate: false,
    receiveJobAlerts: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [skillInput, setSkillInput] = useState("");
  const [availableSkills, setAvailableSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const navigate = useNavigate();

  const totalSteps = 4;

  const jobCategories = [
    "Software Development",
    "Data Science",
    "Marketing",
    "Sales",
    "Design",
    "Finance",
    "HR",
    "Operations",
    "Customer Service",
    "Healthcare",
    "Education",
    "Engineering",
    "Other",
  ];

  const experienceLevels = ["Entry Level (0-2 years)", "Mid Level (3-5 years)", "Senior Level (6-10 years)", "Executive Level (10+ years)"];

  const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
  const workLocations = ["Remote", "Hybrid", "On-site", "Flexible"];

  // Fetch available skills from database
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/skills");
        if (response.ok) {
          const data = await response.json();
          setAvailableSkills(data.skills || []);
          setFilteredSkills(data.skills || []);
        }
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    };

    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error for this field when user starts typing/checking
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }
    // For checkboxes, clear error when checked
    if (type === "checkbox" && checked && fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);

    // Filter skills based on input
    if (value.trim()) {
      const filtered = availableSkills.filter((skill) => skill.name.toLowerCase().includes(value.toLowerCase()) && !formData.skills.includes(skill.name)).slice(0, 10);
      setFilteredSkills(filtered);
      setShowSkillDropdown(true);
    } else {
      setFilteredSkills(availableSkills.filter((skill) => !formData.skills.includes(skill.name)).slice(0, 10));
      setShowSkillDropdown(true);
    }
  };

  const handleSkillSelect = (skillName) => {
    if (!formData.skills.includes(skillName)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillName],
      });
      // Clear skills error if at least one skill is selected
      if (fieldErrors.skills) {
        setFieldErrors({
          ...fieldErrors,
          skills: "",
        });
      }
    }
    setSkillInput("");
    setShowSkillDropdown(false);
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleCategoryToggle = (category) => {
    const newCategories = formData.jobCategories.includes(category) ? formData.jobCategories.filter((cat) => cat !== category) : [...formData.jobCategories, category];

    setFormData({
      ...formData,
      jobCategories: newCategories,
    });

    // Clear error if at least one category is selected
    if (newCategories.length > 0 && fieldErrors.jobCategories) {
      setFieldErrors({
        ...fieldErrors,
        jobCategories: "",
      });
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setResumeFile(file);
      // Clear resume error if file is uploaded
      if (fieldErrors.resume) {
        setFieldErrors({
          ...fieldErrors,
          resume: "",
        });
      }
    } else {
      setError("Please upload a PDF or DOCX file for your resume.");
      setFieldErrors({
        ...fieldErrors,
        resume: "Please upload a PDF or DOCX file for your resume.",
      });
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 1:
        if (!formData.firstName || formData.firstName.trim() === "") {
          errors.firstName = "First name is required";
          isValid = false;
        }
        if (!formData.lastName || formData.lastName.trim() === "") {
          errors.lastName = "Last name is required";
          isValid = false;
        }
        if (!formData.email || formData.email.trim() === "") {
          errors.email = "Email address is required";
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Please enter a valid email address";
          isValid = false;
        }
        if (!formData.phone || formData.phone.trim() === "") {
          errors.phone = "Phone number is required";
          isValid = false;
        }
        if (!formData.dateOfBirth || formData.dateOfBirth.trim() === "") {
          errors.dateOfBirth = "Date of birth is required";
          isValid = false;
        }
        if (!formData.gender || formData.gender === "") {
          errors.gender = "Gender is required";
          isValid = false;
        }
        break;

      case 2:
        if (!formData.currentJobTitle || formData.currentJobTitle.trim() === "") {
          errors.currentJobTitle = "Current job title is required";
          isValid = false;
        }
        if (!formData.experience || formData.experience === "") {
          errors.experience = "Experience level is required";
          isValid = false;
        }
        if (!formData.jobType || formData.jobType === "") {
          errors.jobType = "Job type is required";
          isValid = false;
        }
        if (!formData.currentCompany || formData.currentCompany.trim() === "") {
          errors.currentCompany = "Current company is required";
          isValid = false;
        }
        if (!formData.expectedSalary || formData.expectedSalary.trim() === "") {
          errors.expectedSalary = "Expected salary is required";
          isValid = false;
        }
        if (!formData.workLocation || formData.workLocation === "") {
          errors.workLocation = "Work location preference is required";
          isValid = false;
        }
        if (!formData.jobCategories || formData.jobCategories.length === 0) {
          errors.jobCategories = "Please select at least one job category";
          isValid = false;
        }
        break;

      case 3:
        if (!formData.skills || formData.skills.length === 0) {
          errors.skills = "Please select at least one skill";
          isValid = false;
        }
        if (!formData.education || formData.education === "") {
          errors.education = "Education level is required";
          isValid = false;
        }
        if (!formData.university || formData.university.trim() === "") {
          errors.university = "University/Institution is required";
          isValid = false;
        }
        if (!formData.graduationYear || formData.graduationYear.trim() === "") {
          errors.graduationYear = "Graduation year is required";
          isValid = false;
        }
        if (!resumeFile) {
          errors.resume = "Resume/CV upload is required";
          isValid = false;
        }
        if (formData.willingToRelocate === false) {
          errors.willingToRelocate = "You must confirm your willingness to relocate";
          isValid = false;
        }
        if (formData.receiveJobAlerts === false) {
          errors.receiveJobAlerts = "You must agree to receive job alerts";
          isValid = false;
        }
        break;

      case 4:
        if (!formData.password || formData.password.trim() === "") {
          errors.password = "Password is required";
          isValid = false;
        } else if (formData.password.length < 8) {
          errors.password = "Password must be at least 8 characters long";
          isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
          errors.password = "Password must contain uppercase, lowercase, number, and special character";
          isValid = false;
        }
        if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
          errors.confirmPassword = "Please confirm your password";
          isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
          isValid = false;
        }
        break;

      default:
        isValid = true;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError("");
      setFieldErrors({});
    } else {
      const errorMessages = Object.values(fieldErrors);
      if (errorMessages.length > 0) {
        setError(errorMessages[0] || "Please fill in all required fields before proceeding.");
      } else {
        setError("Please fill in all required fields before proceeding.");
      }
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError("");
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userType: "job_seeker",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("pendingVerificationEmail", formData.email);
        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index + 1 <= currentStep ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {index + 1}
          </div>
          {index < totalSteps - 1 && <div className={`w-16 h-1 mx-2 ${index + 1 < currentStep ? "bg-indigo-500" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Personal Information</h2>
        <p className="text-gray-600 text-sm mt-2">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">First Name*</label>
          <input
            name="firstName"
            type="text"
            required
            className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.firstName ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
          />
          {fieldErrors.firstName && <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Last Name*</label>
          <input
            name="lastName"
            type="text"
            required
            className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.lastName ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
          />
          {fieldErrors.lastName && <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email Address*</label>
        <input
          name="email"
          type="email"
          required
          className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
            fieldErrors.email ? "border-red-300 focus:ring-red-500" : "border-gray-200"
          }`}
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={handleChange}
        />
        {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Phone Number*</label>
          <input
            name="phone"
            type="tel"
            required
            className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.phone ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={handleChange}
          />
          {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date of Birth*</label>
          <input
            name="dateOfBirth"
            type="date"
            required
            className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.dateOfBirth ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
          {fieldErrors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{fieldErrors.dateOfBirth}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Gender*</label>
        <select
          name="gender"
          required
          className={`block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
            fieldErrors.gender ? "border-red-300 focus:ring-red-500" : "border-gray-200"
          }`}
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
        {fieldErrors.gender && <p className="text-xs text-red-600 mt-1">{fieldErrors.gender}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Professional Information</h2>
        <p className="text-gray-600 text-sm mt-2">Your work experience and preferences</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Current Job Title*</label>
        <input
          name="currentJobTitle"
          type="text"
          required
          className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
            fieldErrors.currentJobTitle ? "border-red-300 focus:ring-red-500" : "border-gray-200"
          }`}
          placeholder="e.g., Software Engineer, Marketing Manager"
          value={formData.currentJobTitle}
          onChange={handleChange}
        />
        {fieldErrors.currentJobTitle && <p className="text-xs text-red-600 mt-1">{fieldErrors.currentJobTitle}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Experience Level*</label>
          <select
            name="experience"
            required
            className={`block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.experience ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            value={formData.experience}
            onChange={handleChange}
          >
            <option value="">Select Experience</option>
            {experienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          {fieldErrors.experience && <p className="text-xs text-red-600 mt-1">{fieldErrors.experience}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Job Type*</label>
          <select
            name="jobType"
            required
            className={`block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.jobType ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            value={formData.jobType}
            onChange={handleChange}
          >
            <option value="">Select Job Type</option>
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {fieldErrors.jobType && <p className="text-xs text-red-600 mt-1">{fieldErrors.jobType}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Current Company*</label>
        <input
          name="currentCompany"
          type="text"
          required
          className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
            fieldErrors.currentCompany ? "border-red-300 focus:ring-red-500" : "border-gray-200"
          }`}
          placeholder="Company name"
          value={formData.currentCompany}
          onChange={handleChange}
        />
        {fieldErrors.currentCompany && <p className="text-xs text-red-600 mt-1">{fieldErrors.currentCompany}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Expected Salary (USD)*</label>
          <input
            name="expectedSalary"
            type="number"
            required
            className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.expectedSalary ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            placeholder="e.g., 75000"
            value={formData.expectedSalary}
            onChange={handleChange}
          />
          {fieldErrors.expectedSalary && <p className="text-xs text-red-600 mt-1">{fieldErrors.expectedSalary}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Work Location Preference*</label>
          <select
            name="workLocation"
            required
            className={`block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.workLocation ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            value={formData.workLocation}
            onChange={handleChange}
          >
            <option value="">Select Preference</option>
            {workLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          {fieldErrors.workLocation && <p className="text-xs text-red-600 mt-1">{fieldErrors.workLocation}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Job Categories of Interest*</label>
        <div className="grid grid-cols-2 gap-2">
          {jobCategories.map((category) => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.jobCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
        {fieldErrors.jobCategories && <p className="text-xs text-red-600 mt-1">{fieldErrors.jobCategories}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Skills & Education</h2>
        <p className="text-gray-600 text-sm mt-2">Showcase your expertise</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Skills*</label>
        <div className="space-y-3 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search and select skills from the list"
              className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                fieldErrors.skills ? "border-red-300 focus:ring-red-500" : "border-gray-200"
              }`}
              value={skillInput}
              onChange={handleSkillInputChange}
              onFocus={() => {
                if (availableSkills.length > 0) {
                  setFilteredSkills(availableSkills.filter((skill) => !formData.skills.includes(skill.name)).slice(0, 10));
                  setShowSkillDropdown(true);
                }
              }}
              onBlur={() => {
                // Delay to allow clicking on dropdown items
                setTimeout(() => setShowSkillDropdown(false), 200);
              }}
            />
            {showSkillDropdown && filteredSkills.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleSkillSelect(skill.name)}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none transition-colors"
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            )}
            {showSkillDropdown && filteredSkills.length === 0 && skillInput.trim() && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg p-4 text-sm text-gray-500">
                No matching skills found. Please select from existing skills.
              </div>
            )}
          </div>
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 font-medium">
                  {skill}
                  <button type="button" onClick={() => handleSkillRemove(skill)} className="ml-2 text-indigo-600 hover:text-indigo-800 font-bold">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {availableSkills.length > 0 && (
            <p className="text-xs text-gray-500">
              {formData.skills.length} skill(s) selected. Select from {availableSkills.length} available skills.
            </p>
          )}
          {fieldErrors.skills && <p className="text-xs text-red-600 mt-1">{fieldErrors.skills}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Education Level*</label>
          <select
            name="education"
            required
            className={`block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.education ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            value={formData.education}
            onChange={handleChange}
          >
            <option value="">Select Education</option>
            <option value="high-school">High School</option>
            <option value="associate">Associate Degree</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD</option>
            <option value="other">Other</option>
          </select>
          {fieldErrors.education && <p className="text-xs text-red-600 mt-1">{fieldErrors.education}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Graduation Year*</label>
          <input
            name="graduationYear"
            type="number"
            required
            min="1950"
            max="2030"
            className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.graduationYear ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            placeholder="2020"
            value={formData.graduationYear}
            onChange={handleChange}
          />
          {fieldErrors.graduationYear && <p className="text-xs text-red-600 mt-1">{fieldErrors.graduationYear}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">University/Institution*</label>
        <input
          name="university"
          type="text"
          required
          className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
            fieldErrors.university ? "border-red-300 focus:ring-red-500" : "border-gray-200"
          }`}
          placeholder="University name"
          value={formData.university}
          onChange={handleChange}
        />
        {fieldErrors.university && <p className="text-xs text-red-600 mt-1">{fieldErrors.university}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Resume/CV Upload*</label>
        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${fieldErrors.resume ? "border-red-300 bg-red-50/50" : "border-gray-300"}`}>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" id="resume-upload" required />
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className={`text-sm ${resumeFile ? "text-gray-900 font-medium" : "text-gray-600"}`}>{resumeFile ? resumeFile.name : "Click to upload PDF or DOCX resume"}</span>
          </label>
        </div>
        {fieldErrors.resume && <p className="text-xs text-red-600 mt-1">{fieldErrors.resume}</p>}
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            name="willingToRelocate"
            required
            checked={formData.willingToRelocate}
            onChange={handleChange}
            className={`mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${fieldErrors.willingToRelocate ? "border-red-300" : ""}`}
          />
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Willing to relocate for the right opportunity*</label>
            {fieldErrors.willingToRelocate && <p className="text-xs text-red-600 mt-1">{fieldErrors.willingToRelocate}</p>}
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            name="receiveJobAlerts"
            required
            checked={formData.receiveJobAlerts}
            onChange={handleChange}
            className={`mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${fieldErrors.receiveJobAlerts ? "border-red-300" : ""}`}
          />
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Receive job alerts and recommendations*</label>
            {fieldErrors.receiveJobAlerts && <p className="text-xs text-red-600 mt-1">{fieldErrors.receiveJobAlerts}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Account Security</h2>
        <p className="text-gray-600 text-sm mt-2">Create your secure password</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Password*</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.password ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 6.057-5.064 9-9.542 9-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Confirm Password*</label>
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            className={`block w-full px-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              fieldErrors.confirmPassword ? "border-red-300 focus:ring-red-500" : "border-gray-200"
            }`}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 6.057-5.064 9-9.542 9-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Contains uppercase and lowercase letters</li>
          <li>• Contains at least one number</li>
          <li>• Contains at least one special character</li>
        </ul>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          {/* Glass morphism card */}
          <div className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-8 space-y-8">
            {/* Step Indicator */}
            {renderStepIndicator()}

            <form onSubmit={handleSubmit}>
              {/* Error Messages */}
              {error && <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg mb-6">{error}</div>}

              {/* Current Step Content */}
              {renderCurrentStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                )}
              </div>

              {/* Login Link */}
              <div className="text-center pt-6">
                <span className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                    Sign in here
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
