const pool = require("../config/database");

// Get user's job applications
const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        ja.*,
        j.title as job_title,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.currency,
        c.name as company_name
      FROM job_applications ja
      JOIN job_postings j ON ja.job_posting_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE ja.user_id = $1
      ORDER BY ja.applied_at DESC`,
      [userId],
    );

    const applications = result.rows.map((app) => ({
      id: app.id,
      jobId: app.job_posting_id,
      jobTitle: app.job_title,
      companyName: app.company_name,
      company: app.company_name,
      location: app.location,
      jobType: app.job_type,
      salaryMin: app.salary_min,
      salaryMax: app.salary_max,
      currency: app.currency,
      status: app.status,
      appliedAt: app.applied_at,
      updatedAt: app.updated_at,
    }));

    res.json({
      applications,
      total: applications.length,
    });
  } catch (error) {
    console.error("Get user applications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get application by ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        ja.*,
        j.title as job_title,
        j.description,
        j.requirements,
        j.skills_required,
        j.location,
        j.job_type,
        j.experience_level,
        j.salary_min,
        j.salary_max,
        j.currency,
        c.name as company_name,
        c.website
      FROM job_applications ja
      JOIN job_postings j ON ja.job_posting_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE ja.id = $1 AND ja.user_id = $2`,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    const application = result.rows[0];
    res.json({
      application: {
        id: application.id,
        jobId: application.job_posting_id,
        jobTitle: application.job_title,
        jobDescription: application.description,
        jobRequirements: application.requirements,
        jobSkillsRequired: application.skills_required,
        jobLocation: application.location,
        location: application.location,
        jobType: application.job_type,
        jobExperienceLevel: application.experience_level,
        jobSalaryMin: application.salary_min,
        jobSalaryMax: application.salary_max,
        jobCurrency: application.currency,
        company: application.company_name,
        companyName: application.company_name,
        companyWebsite: application.website,
        status: application.status,
        appliedAt: application.applied_at,
        updatedAt: application.updated_at,
      },
    });
  } catch (error) {
    console.error("Get application by ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update application status (for admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user.id;

    const validStatuses = [
      "APPLIED",
      "SHORT_LISTED",
      "REJECTED",
      "CALL_FOR_INTERVIEW",
      "SHORT_LISTED_BY_COMPANY",
      "SELECTED",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error:
          "Invalid status. Valid statuses: APPLIED, SHORT_LISTED, REJECTED, CALL_FOR_INTERVIEW, SHORT_LISTED_BY_COMPANY, SELECTED",
      });
    }

    // Get current application
    const currentApp = await pool.query(
      "SELECT status FROM job_applications WHERE id = $1",
      [id],
    );
    if (currentApp.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    const oldStatus = currentApp.rows[0].status;

    // Update application status
    const result = await pool.query(
      "UPDATE job_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id],
    );

    // Create status history entry
    await pool.query(
      `INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, notes) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id, oldStatus, status, adminId, notes || null],
    );

    res.json({
      message: "Application status updated successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get application status history
const getApplicationStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user owns this application or is admin
    const appCheck = await pool.query(
      "SELECT user_id FROM job_applications WHERE id = $1",
      [id],
    );
    if (appCheck.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Check if user is admin or owns the application
    const userCheck = await pool.query("SELECT role FROM users WHERE id = $1", [
      userId,
    ]);
    const isAdmin = userCheck.rows[0]?.role === "admin";
    const isOwner = appCheck.rows[0].user_id === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get status history
    const result = await pool.query(
      `SELECT 
        ash.*,
        u.first_name,
        u.last_name,
        u.email
      FROM application_status_history ash
      LEFT JOIN users u ON ash.changed_by = u.id
      WHERE ash.application_id = $1
      ORDER BY ash.created_at ASC`,
      [id],
    );

    res.json({
      history: result.rows.map((row) => ({
        id: row.id,
        oldStatus: row.old_status,
        newStatus: row.new_status,
        changedBy: row.changed_by
          ? {
              id: row.changed_by,
              name: `${row.first_name} ${row.last_name}`,
              email: row.email,
            }
          : null,
        notes: row.notes,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Get application status history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all applications (admin only)
const getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "", jobId = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        ja.*,
        j.title as job_title,
        j.location,
        j.job_type,
        c.name as company_name,
        u.first_name,
        u.last_name,
        u.email
      FROM job_applications ja
      JOIN job_postings j ON ja.job_posting_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      JOIN users u ON ja.user_id = u.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND ja.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (jobId) {
      paramCount++;
      query += ` AND ja.job_posting_id = $${paramCount}`;
      queryParams.push(jobId);
    }

    query += ` ORDER BY ja.applied_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM job_applications ja
      JOIN job_postings j ON ja.job_posting_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      JOIN users u ON ja.user_id = u.id
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND ja.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (jobId) {
      countParamCount++;
      countQuery += ` AND ja.job_posting_id = $${countParamCount}`;
      countParams.push(jobId);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      applications: result.rows.map((app) => ({
        id: app.id,
        jobId: app.job_posting_id,
        jobTitle: app.job_title,
        company: app.company_name,
        location: app.location,
        jobType: app.job_type,
        applicantName: `${app.first_name} ${app.last_name}`,
        applicantEmail: app.email,
        status: app.status,
        appliedAt: app.applied_at,
        updatedAt: app.updated_at,
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total,
      },
    });
  } catch (error) {
    console.error("Get all applications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUserApplications,
  getApplicationById,
  updateApplicationStatus,
  getAllApplications,
  getApplicationStatusHistory,
};
