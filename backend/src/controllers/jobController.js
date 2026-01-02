const { validationResult } = require("express-validator");
const pool = require("../config/database");
const { linkSkillsToJob, getJobSkills } = require("./skillController");

// Get all job postings for admin (including inactive)
const getJobsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "" } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT *
      FROM job_postings
      WHERE 1= 1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR company_name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (status === "active") {
      query += ` AND is_active = true`;
    } else if (status === "inactive") {
      query += ` AND is_active = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM job_postings
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (title ILIKE $${countParamCount} OR description ILIKE $${countParamCount} OR company_name ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (status === "active") {
      countQuery += ` AND is_active = true`;
    } else if (status === "inactive") {
      countQuery += ` AND is_active = false`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      jobs: result.rows.map((job) => ({
        id: job.id,
        companyName: job.company_name,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        skillsRequired: job.skills_required,
        location: job.location,
        jobType: job.job_type,
        experienceLevel: job.experience_level,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        currency: job.currency,
        isActive: job.is_active,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total,
      },
    });
  } catch (error) {
    console.error("Get jobs for admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new job posting
const createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyId, companyName, title, description, requirements, skillsRequired, location, jobType, experienceLevel, salaryMin, salaryMax, currency = "USD" } = req.body;

    // Use company_id if provided, otherwise use company_name (for backward compatibility)
    let companyIdValue = companyId;
    let companyNameValue = companyName;

    // If company_id is provided, get company name
    if (companyIdValue) {
      const companyResult = await pool.query("SELECT name FROM companies WHERE id = $1", [companyIdValue]);
      if (companyResult.rows.length === 0) {
        return res.status(400).json({ error: "Company not found" });
      }
      companyNameValue = companyResult.rows[0].name;
    }

    // Insert job with company_id and company_name
    const result = await pool.query(
      `INSERT INTO job_postings 
       (company_id, company_name, title, description, requirements, skills_required, location, 
        job_type, experience_level, salary_min, salary_max, currency, posted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        companyIdValue || null,
        companyNameValue,
        title,
        description,
        requirements,
        skillsRequired || [],
        location,
        jobType,
        experienceLevel,
        salaryMin,
        salaryMax,
        currency,
        req.user.id,
      ]
    );

    const job = result.rows[0];

    // Link skills to job if provided
    if (skillsRequired && skillsRequired.length > 0) {
      await linkSkillsToJob(job.id, skillsRequired);
    }

    // Get skills from database
    const jobSkills = await getJobSkills(job.id);

    res.status(201).json({
      message: "Job posting created successfully",
      job: {
        id: job.id,
        companyId: job.company_id,
        company: companyNameValue,
        companyName: companyNameValue,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        skillsRequired: jobSkills,
        location: job.location,
        jobType: job.job_type,
        experienceLevel: job.experience_level,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        currency: job.currency,
        isActive: job.is_active,
        createdAt: job.created_at,
      },
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all job postings with search and filters
const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", location = "", jobType = "", experienceLevel = "", salaryMin = "", salaryMax = "", companyName = "" } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        j.*,
        COALESCE(
          (
            SELECT ARRAY_AGG(s.name)
            FROM job_skills js
            JOIN skills s ON js.skill_id = s.id
            WHERE js.job_posting_id = j.id
          ),
          j.skills_required,
          ARRAY[]::TEXT[]
        ) as job_skills
      FROM job_postings j
      WHERE j.is_active = true
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR company_name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (location) {
      paramCount++;
      query += ` AND location ILIKE $${paramCount}`;
      queryParams.push(`%${location}%`);
    }

    if (jobType) {
      paramCount++;
      query += ` AND job_type = $${paramCount}`;
      queryParams.push(jobType);
    }

    if (experienceLevel) {
      paramCount++;
      query += ` AND experience_level = $${paramCount}`;
      queryParams.push(experienceLevel);
    }

    if (salaryMin) {
      paramCount++;
      query += ` AND salary_min >= $${paramCount}`;
      queryParams.push(salaryMin);
    }

    if (salaryMax) {
      paramCount++;
      query += ` AND salary_max <= $${paramCount}`;
      queryParams.push(salaryMax);
    }

    if (companyName) {
      paramCount++;
      query += ` AND company_name = $${paramCount}`;
      queryParams.push(companyName);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM job_postings
      WHERE is_active = true
    `;
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (title ILIKE $${countParamCount} OR description ILIKE $${countParamCount} OR company_name ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (location) {
      countParamCount++;
      countQuery += ` AND location ILIKE $${countParamCount}`;
      countParams.push(`%${location}%`);
    }

    if (jobType) {
      countParamCount++;
      countQuery += ` AND job_type = $${countParamCount}`;
      countParams.push(jobType);
    }

    if (experienceLevel) {
      countParamCount++;
      countQuery += ` AND experience_level = $${countParamCount}`;
      countParams.push(experienceLevel);
    }

    if (salaryMin) {
      countParamCount++;
      countQuery += ` AND salary_min >= $${countParamCount}`;
      countParams.push(salaryMin);
    }

    if (salaryMax) {
      countParamCount++;
      countQuery += ` AND salary_max <= $${countParamCount}`;
      countParams.push(salaryMax);
    }

    if (companyName) {
      countParamCount++;
      countQuery += ` AND company_name = $${countParamCount}`;
      countParams.push(companyName);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      jobs: result.rows.map((job) => ({
        id: job.id,
        company: job.company_name,
        companyName: job.company_name,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        skillsRequired: job.job_skills && job.job_skills.length > 0 ? job.job_skills : job.skills_required || [],
        location: job.location,
        jobType: job.job_type,
        experienceLevel: job.experience_level,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        currency: job.currency,
        createdAt: job.created_at,
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total,
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM job_postings j
       WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = result.rows[0];

    // Get skills from database
    const jobSkills = await getJobSkills(job.id);

    res.json({
      job: {
        id: job.id,
        companyId: job.company_id,
        company: job.company_name,
        companyName: job.company_name,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        skillsRequired: jobSkills.length > 0 ? jobSkills : job.skills_required || [],
        location: job.location,
        jobType: job.job_type,
        experienceLevel: job.experience_level,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        currency: job.currency,
        createdAt: job.created_at,
      },
    });
  } catch (error) {
    console.error("Get job by ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Apply to job
const applyToJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter } = req.body;
    const userId = req.user.id;

    // Check if job exists and is active
    const jobResult = await pool.query("SELECT id FROM job_postings WHERE id = $1 AND is_active = true", [id]);

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found or inactive" });
    }

    // Check if user already applied
    const existingApp = await pool.query("SELECT id FROM job_applications WHERE user_id = $1 AND job_posting_id = $2", [userId, id]);

    if (existingApp.rows.length > 0) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    // Create application
    const result = await pool.query(
      `INSERT INTO job_applications (user_id, job_posting_id, status, cover_letter) 
       VALUES ($1, $2, 'APPLIED', $3) 
       RETURNING *`,
      [userId, id, coverLetter || null]
    );

    const application = result.rows[0];

    // Create initial status history entry
    await pool.query(
      `INSERT INTO application_status_history (application_id, old_status, new_status, changed_by) 
       VALUES ($1, NULL, 'APPLIED', $2)`,
      [application.id, userId]
    );

    res.json({
      message: "Application submitted successfully",
      application: {
        id: application.id,
        status: application.status,
        appliedAt: application.applied_at,
      },
    });
  } catch (error) {
    console.error("Apply to job error:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "You have already applied for this job" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get job recommendations based on user skills
const getJobRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user skills from profile
    const userProfileResult = await pool.query(`SELECT skills FROM user_profiles WHERE user_id = $1`, [userId]);

    const userSkills = userProfileResult.rows[0]?.skills || [];

    if (userSkills.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Get all active jobs with their skills
    const jobsResult = await pool.query(
      `SELECT 
        j.id,
        j.title,
        j.description,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.currency,
        j.company_name,
        j.created_at,
        COALESCE(
          (
            SELECT ARRAY_AGG(s.name)
            FROM job_skills js
            JOIN skills s ON js.skill_id = s.id
            WHERE js.job_posting_id = j.id
          ),
          j.skills_required,
          ARRAY[]::TEXT[]
        ) as job_skills
      FROM job_postings j
      WHERE j.is_active = true
      ORDER BY j.created_at DESC`
    );

    // Calculate match score for each job
    const recommendations = jobsResult.rows
      .map((job) => {
        const jobSkills = job.job_skills || [];
        if (jobSkills.length === 0) return null;

        // Calculate matching skills
        const matchingSkills = userSkills.filter((skill) => jobSkills.some((jobSkill) => jobSkill.toLowerCase() === skill.toLowerCase()));

        // Calculate match percentage
        const matchScore = Math.round((matchingSkills.length / jobSkills.length) * 100);

        // Only return jobs with at least 30% match
        if (matchScore < 30) return null;

        return {
          id: job.id,
          title: job.title,
          description: job.description,
          company: job.company_name,
          location: job.location,
          jobType: job.job_type,
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          currency: job.currency,
          matchScore: matchScore,
          matchingSkills: matchingSkills,
          createdAt: job.created_at,
        };
      })
      .filter((job) => job !== null)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20); // Return top 20 recommendations

    res.json({ recommendations });
  } catch (error) {
    console.error("Get job recommendations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update job posting (admin only)
const updateJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { companyId, companyName, title, description, requirements, skillsRequired, location, jobType, experienceLevel, salaryMin, salaryMax, currency, isActive } = req.body;

    // Get old values for audit log
    const oldResult = await pool.query("SELECT * FROM job_postings WHERE id = $1", [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    req.oldValues = oldResult.rows[0];

    // Use company_id if provided, otherwise use company_name
    let companyIdValue = companyId;
    let companyNameValue = companyName;

    // If company_id is provided, get company name
    if (companyIdValue) {
      const companyResult = await pool.query("SELECT name FROM companies WHERE id = $1", [companyIdValue]);
      if (companyResult.rows.length === 0) {
        return res.status(400).json({ error: "Company not found" });
      }
      companyNameValue = companyResult.rows[0].name;
    }

    // Update job with company_id and company_name
    const result = await pool.query(
      `UPDATE job_postings SET 
       company_id = $1, company_name = $2, title = $3, description = $4, requirements = $5, skills_required = $6,
       location = $7, job_type = $8, experience_level = $9, salary_min = $10,
       salary_max = $11, currency = $12, is_active = $13, updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        companyIdValue || null,
        companyNameValue,
        title,
        description,
        requirements,
        skillsRequired || [],
        location,
        jobType,
        experienceLevel,
        salaryMin,
        salaryMax,
        currency,
        isActive,
        id,
      ]
    );

    const job = result.rows[0];

    // Link skills to job if provided
    if (skillsRequired && skillsRequired.length > 0) {
      await linkSkillsToJob(job.id, skillsRequired);
    }

    // Get skills from database
    const jobSkills = await getJobSkills(job.id);

    res.json({
      message: "Job updated successfully",
      job: {
        id: job.id,
        companyId: job.company_id,
        company: companyNameValue,
        companyName: companyNameValue,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        skillsRequired: jobSkills,
        location: job.location,
        jobType: job.job_type,
        experienceLevel: job.experience_level,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        currency: job.currency,
        isActive: job.is_active,
        updatedAt: job.updated_at,
      },
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete job posting (admin only)
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Get old values for audit log
    const oldResult = await pool.query("SELECT * FROM job_postings WHERE id = $1", [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    req.oldValues = oldResult.rows[0];

    await pool.query("DELETE FROM job_postings WHERE id = $1", [id]);

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getJobsForAdmin,
  createJob,
  getJobs,
  getJobById,
  applyToJob,
  getJobRecommendations,
  updateJob,
  deleteJob,
};
