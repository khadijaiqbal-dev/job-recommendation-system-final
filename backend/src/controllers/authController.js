const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const pool = require("../config/database");
const { generateVerificationCode, sendVerificationEmail, sendManualVerificationEmail } = require("../utils/emailService");

// Register new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      // Profile fields from registration form
      phone,
      skills,
      experience,
      currentJobTitle,
      currentCompany,
      expectedSalary,
      jobType,
      workLocation,
      jobCategories,
      education,
      university,
      graduationYear,
      willingToRelocate,
      receiveJobAlerts
    } = req.body;

    // Check if user already exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, first_name, last_name, verification_code, verification_code_expires) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role",
      [email, passwordHash, firstName, lastName, verificationCode, verificationCodeExpires]
    );

    const user = result.rows[0];

    // Parse experience level to years
    let experienceYears = 0;
    if (experience) {
      if (experience.includes('0-2')) experienceYears = 1;
      else if (experience.includes('3-5')) experienceYears = 4;
      else if (experience.includes('6-10')) experienceYears = 8;
      else if (experience.includes('10+')) experienceYears = 12;
    }

    // Create user profile with all the registration data
    const profileSkills = Array.isArray(skills) ? skills : [];
    const preferredJobTypes = jobType ? [jobType] : [];
    const preferredLocations = workLocation ? [workLocation] : [];

    // Build bio from registration data
    const bio = currentJobTitle && currentCompany
      ? `${currentJobTitle} at ${currentCompany}`
      : currentJobTitle || '';

    await pool.query(
      `INSERT INTO user_profiles
       (user_id, bio, skills, experience_years, location, phone,
        preferred_job_types, preferred_locations, salary_expectation_min, salary_expectation_max)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        user.id,
        bio,
        profileSkills,
        experienceYears,
        workLocation || null,
        phone || null,
        preferredJobTypes,
        preferredLocations,
        expectedSalary ? Math.round(parseFloat(expectedSalary)) : null,
        expectedSalary ? Math.round(parseFloat(expectedSalary) * 1.2) : null // 20% buffer for max salary
      ]
    );

    // Send verification email
    const emailResult = await sendVerificationEmail(email, firstName, verificationCode);

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // Still return success but warn about email
      return res.status(201).json({
        message: "User registered successfully, but verification email could not be sent. Please contact support.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
      });
    }

    res.status(201).json({
      message: "User registered successfully. Please check your email for verification code.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get user from database
    const result = await pool.query("SELECT id, email, password_hash, first_name, last_name, role, is_verified FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.is_verified) {
      return res.status(401).json({
        error: "Email not verified. Please check your email for verification code.",
        requiresVerification: true,
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify email with 6-digit code
const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    // Check if verification code is valid and not expired
    const result = await pool.query("SELECT id, email, first_name, verification_code_expires FROM users WHERE email = $1 AND verification_code = $2", [email, verificationCode]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    const user = result.rows[0];

    // Check if code is expired
    if (new Date() > new Date(user.verification_code_expires)) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    // Update user as verified and clear verification code
    await pool.query("UPDATE users SET is_verified = true, verification_code = null, verification_code_expires = null WHERE id = $1", [user.id]);

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Resend verification code
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Get user
    const result = await pool.query("SELECT id, email, first_name, is_verified FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new verification code
    await pool.query("UPDATE users SET verification_code = $1, verification_code_expires = $2 WHERE id = $3", [verificationCode, verificationCodeExpires, user.id]);

    // Send verification email
    const emailResult = await sendVerificationEmail(email, user.first_name, verificationCode);

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    res.json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Resend verification code error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_verified, up.* FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified,
        profile: user.bio
          ? {
              bio: user.bio,
              skills: user.skills,
              experienceYears: user.experience_years,
              location: user.location,
              phone: user.phone,
              linkedinUrl: user.linkedin_url,
              githubUrl: user.github_url,
              resumeUrl: user.resume_url,
              preferredJobTypes: user.preferred_job_types,
              preferredLocations: user.preferred_locations,
              salaryExpectationMin: user.salary_expectation_min,
              salaryExpectationMax: user.salary_expectation_max,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
  getProfile,
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const result = await pool.query("SELECT id, email, first_name FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      // For security, don't reveal if email exists or not
      return res.json({ message: "If the email exists, a password reset code has been sent" });
    }

    const user = result.rows[0];

    // Generate 6-digit reset code
    const resetCode = generateVerificationCode();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with reset code
    await pool.query("UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3", [resetCode, resetCodeExpires, user.id]);

    // Send password reset email
    const { sendPasswordResetEmail } = require("../utils/emailService");
    const emailResult = await sendPasswordResetEmail(email, user.first_name, resetCode);

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      return res.status(500).json({ error: "Failed to send password reset email" });
    }

    res.json({ message: "Password reset code sent successfully" });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reset password with verification code
const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ error: "Email, reset code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if reset code is valid and not expired
    const result = await pool.query("SELECT id, email, first_name, reset_password_expires FROM users WHERE email = $1 AND reset_password_token = $2", [email, resetCode]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    const user = result.rows[0];

    // Check if code is expired
    if (new Date() > new Date(user.reset_password_expires)) {
      return res.status(400).json({ error: "Reset code has expired" });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset code
    await pool.query("UPDATE users SET password_hash = $1, reset_password_token = null, reset_password_expires = null WHERE id = $2", [passwordHash, user.id]);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
  getProfile,
  requestPasswordReset,
  resetPassword,
};
