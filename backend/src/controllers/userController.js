const { validationResult } = require("express-validator");
const pool = require("../config/database");

const getUserProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT u.id, u.email, u.first_name, u.last_name, u.is_verified, u.created_at, up.* FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone || "",
      location: user.location || "",
      bio: user.bio || "",
      skills: user.skills || [],
      experience: [],
      education: [],
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bio, skills, experienceYears, location, phone, linkedinUrl, githubUrl, resumeUrl, preferredJobTypes, preferredLocations, salaryExpectationMin, salaryExpectationMax } =
      req.body;

    const existingProfile = await pool.query("SELECT id FROM user_profiles WHERE user_id = $1", [req.user.id]);

    if (existingProfile.rows.length > 0) {
      // Update existing profile
      await pool.query(
        `UPDATE user_profiles SET 
         bio = $1, skills = $2, experience_years = $3, location = $4, 
         phone = $5, linkedin_url = $6, github_url = $7, resume_url = $8,
         preferred_job_types = $9, preferred_locations = $10,
         salary_expectation_min = $11, salary_expectation_max = $12,
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $13`,
        [
          bio,
          skills,
          experienceYears,
          location,
          phone,
          linkedinUrl,
          githubUrl,
          resumeUrl,
          preferredJobTypes,
          preferredLocations,
          salaryExpectationMin,
          salaryExpectationMax,
          req.user.id,
        ]
      );
    } else {
      // Create new profile
      await pool.query(
        `INSERT INTO user_profiles 
         (user_id, bio, skills, experience_years, location, phone, linkedin_url, 
          github_url, resume_url, preferred_job_types, preferred_locations,
          salary_expectation_min, salary_expectation_max)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          req.user.id,
          bio,
          skills,
          experienceYears,
          location,
          phone,
          linkedinUrl,
          githubUrl,
          resumeUrl,
          preferredJobTypes,
          preferredLocations,
          salaryExpectationMin,
          salaryExpectationMax,
        ]
      );
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_verified, u.created_at,
             up.location, up.experience_years
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      queryParams.push(role);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM users u WHERE 1=1";
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (u.first_name ILIKE $${countParamCount} OR u.last_name ILIKE $${countParamCount} OR u.email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (role) {
      countParamCount++;
      countQuery += ` AND u.role = $${countParamCount}`;
      countParams.push(role);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified,
        location: user.location,
        experienceYears: user.experience_years,
        createdAt: user.created_at,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send manual verification email (admin only)
const sendManualVerificationEmail = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user details
    const result = await pool.query("SELECT id, email, first_name, is_verified FROM users WHERE id = $1", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: "User email is already verified" });
    }

    // Generate new verification code
    const { generateVerificationCode, sendManualVerificationEmail: sendEmail } = require("../utils/emailService");
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new verification code
    await pool.query("UPDATE users SET verification_code = $1, verification_code_expires = $2 WHERE id = $3", [verificationCode, verificationCodeExpires, user.id]);

    // Send verification email
    const emailResult = await sendEmail(user.email, user.first_name, verificationCode);

    if (!emailResult.success) {
      console.error("Failed to send manual verification email:", emailResult.error);
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    res.json({
      message: "Verification email sent successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
      },
    });
  } catch (error) {
    console.error("Send manual verification email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  getAllUsers,
  sendManualVerificationEmail,
};
