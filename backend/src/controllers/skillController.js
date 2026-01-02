const pool = require("../config/database");

// Get all skills
const getSkills = async (req, res) => {
  try {
    const { search = "" } = req.query;
    let query = "SELECT * FROM skills WHERE 1=1";
    const queryParams = [];

    if (search) {
      query += " AND name ILIKE $1";
      queryParams.push(`%${search}%`);
    }

    query += " ORDER BY name ASC";

    const result = await pool.query(query, queryParams);

    res.json({
      skills: result.rows.map((skill) => ({
        id: skill.id,
        name: skill.name,
        createdAt: skill.created_at,
      })),
    });
  } catch (error) {
    console.error("Get skills error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create or get skill by name
const createOrGetSkill = async (skillName) => {
  try {
    // First try to get existing skill
    let result = await pool.query("SELECT * FROM skills WHERE LOWER(name) = LOWER($1)", [skillName.trim()]);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // If not found, create new skill
    result = await pool.query("INSERT INTO skills (name) VALUES ($1) RETURNING *", [skillName.trim()]);
    return result.rows[0];
  } catch (error) {
    console.error("Create or get skill error:", error);
    throw error;
  }
};

// Link skills to job
const linkSkillsToJob = async (jobId, skillNames) => {
  try {
    // First, remove existing links
    await pool.query("DELETE FROM job_skills WHERE job_posting_id = $1", [jobId]);

    if (!skillNames || skillNames.length === 0) {
      return;
    }

    // Create or get each skill and link to job
    for (const skillName of skillNames) {
      if (!skillName || !skillName.trim()) continue;

      const skill = await createOrGetSkill(skillName);

      // Link skill to job
      await pool.query("INSERT INTO job_skills (job_posting_id, skill_id) VALUES ($1, $2) ON CONFLICT (job_posting_id, skill_id) DO NOTHING", [jobId, skill.id]);
    }
  } catch (error) {
    console.error("Link skills to job error:", error);
    throw error;
  }
};

// Get skills for a job
const getJobSkills = async (jobId) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.name 
       FROM skills s
       INNER JOIN job_skills js ON s.id = js.skill_id
       WHERE js.job_posting_id = $1
       ORDER BY s.name ASC`,
      [jobId]
    );

    return result.rows.map((row) => row.name);
  } catch (error) {
    console.error("Get job skills error:", error);
    return [];
  }
};

module.exports = {
  getSkills,
  createOrGetSkill,
  linkSkillsToJob,
  getJobSkills,
};
