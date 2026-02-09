const pool = require("../config/database");

// Get user's saved jobs
const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT
        sj.id,
        sj.saved_at,
        sj.notes,
        j.id as job_id,
        j.title,
        j.description,
        c.name as company_name,
        j.location,
        j.job_type,
        j.experience_level,
        j.salary_min,
        j.salary_max,
        j.currency,
        j.skills_required,
        j.created_at as job_created_at,
        j.is_active,
        CASE WHEN ja.id IS NOT NULL THEN true ELSE false END as has_applied
      FROM saved_jobs sj
      JOIN job_postings j ON sj.job_posting_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN job_applications ja ON ja.job_posting_id = j.id AND ja.user_id = $1
      WHERE sj.user_id = $1
      ORDER BY sj.saved_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM saved_jobs WHERE user_id = $1",
      [userId],
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      savedJobs: result.rows.map((job) => ({
        id: job.id,
        savedAt: job.saved_at,
        notes: job.notes,
        jobId: job.job_id,
        title: job.title,
        description: job.description,
        companyName: job.company_name,
        company: job.company_name,
        location: job.location,
        jobType: job.job_type,
        experienceLevel: job.experience_level,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        currency: job.currency,
        skillsRequired: job.skills_required || [],
        jobCreatedAt: job.job_created_at,
        isActive: job.is_active,
        hasApplied: job.has_applied,
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get saved jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Save a job to wishlist
const saveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const { notes } = req.body;

    // Check if job exists and is active
    const jobResult = await pool.query(
      "SELECT id FROM job_postings WHERE id = $1 AND is_active = true",
      [jobId],
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found or inactive" });
    }

    // Check if already saved
    const existingResult = await pool.query(
      "SELECT id FROM saved_jobs WHERE user_id = $1 AND job_posting_id = $2",
      [userId, jobId],
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: "Job already saved" });
    }

    // Save the job
    const result = await pool.query(
      `INSERT INTO saved_jobs (user_id, job_posting_id, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, jobId, notes || null],
    );

    res.status(201).json({
      message: "Job saved successfully",
      savedJob: {
        id: result.rows[0].id,
        jobId: result.rows[0].job_posting_id,
        savedAt: result.rows[0].saved_at,
        notes: result.rows[0].notes,
      },
    });
  } catch (error) {
    console.error("Save job error:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Job already saved" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove job from wishlist
const unsaveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const result = await pool.query(
      "DELETE FROM saved_jobs WHERE user_id = $1 AND job_posting_id = $2 RETURNING id",
      [userId, jobId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Saved job not found" });
    }

    res.json({ message: "Job removed from saved jobs" });
  } catch (error) {
    console.error("Unsave job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Check if job is saved
const isJobSaved = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const result = await pool.query(
      "SELECT id FROM saved_jobs WHERE user_id = $1 AND job_posting_id = $2",
      [userId, jobId],
    );

    res.json({ isSaved: result.rows.length > 0 });
  } catch (error) {
    console.error("Check saved job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update saved job notes
const updateSavedJobNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const { notes } = req.body;

    const result = await pool.query(
      `UPDATE saved_jobs
       SET notes = $1
       WHERE user_id = $2 AND job_posting_id = $3
       RETURNING *`,
      [notes, userId, jobId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Saved job not found" });
    }

    res.json({
      message: "Notes updated successfully",
      savedJob: result.rows[0],
    });
  } catch (error) {
    console.error("Update saved job notes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get saved job IDs for checking save status
const getSavedJobIds = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT job_posting_id FROM saved_jobs WHERE user_id = $1",
      [userId],
    );

    res.json({
      savedJobIds: result.rows.map((row) => row.job_posting_id),
    });
  } catch (error) {
    console.error("Get saved job IDs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getSavedJobs,
  saveJob,
  unsaveJob,
  isJobSaved,
  updateSavedJobNotes,
  getSavedJobIds,
};
