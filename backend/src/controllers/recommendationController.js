const { spawn } = require('child_process');
const path = require('path');
const pool = require('../config/database');

/**
 * Execute Python AI recommendation engine
 */
function runPythonRecommendation(action, inputData) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../utils/ai/recommendation_engine.py');
    const pythonCommands = ['python3', 'python'];

    function tryPython(index) {
      if (index >= pythonCommands.length) {
        reject(new Error('Python not found. Please install Python 3.'));
        return;
      }

      const pythonCmd = pythonCommands[index];
      const process = spawn(pythonCmd, [pythonScript, '--action', action, '--input', '-']);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('error', () => {
        // Try next Python command
        tryPython(index + 1);
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            reject(new Error(`Failed to parse Python output: ${stdout}`));
          }
        } else {
          reject(new Error(`Python process failed: ${stderr}`));
        }
      });

      // Send input data
      process.stdin.write(JSON.stringify(inputData));
      process.stdin.end();
    }

    tryPython(0);
  });
}

/**
 * Get AI-powered job recommendations
 */
const getAIRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    // Get user profile and skills
    const profileResult = await pool.query(
      `SELECT skills, preferred_job_types, preferred_locations,
              salary_expectation_min, salary_expectation_max
       FROM user_profiles
       WHERE user_id = $1`,
      [userId]
    );

    const userProfile = profileResult.rows[0] || {};

    // Get user's applied jobs
    const appliedResult = await pool.query(
      `SELECT
        j.id, j.title, j.skills_required, j.job_type,
        j.location, j.experience_level, j.salary_min, j.salary_max
       FROM job_applications ja
       JOIN job_postings j ON ja.job_posting_id = j.id
       WHERE ja.user_id = $1
       ORDER BY ja.applied_at DESC
       LIMIT 50`,
      [userId]
    );

    // Get user's saved jobs
    const savedResult = await pool.query(
      `SELECT
        j.id, j.title, j.skills_required, j.job_type,
        j.location, j.experience_level, j.salary_min, j.salary_max
       FROM saved_jobs sj
       JOIN job_postings j ON sj.job_posting_id = j.id
       WHERE sj.user_id = $1
       ORDER BY sj.saved_at DESC
       LIMIT 50`,
      [userId]
    );

    // Get all active jobs
    const jobsResult = await pool.query(
      `SELECT
        id, title, description, company_name, location, job_type,
        experience_level, salary_min, salary_max, currency,
        skills_required, created_at
       FROM job_postings
       WHERE is_active = true
       ORDER BY created_at DESC`
    );

    // Prepare data for Python AI engine
    const inputData = {
      user_data: {
        profile_skills: userProfile.skills || [],
        preferred_job_types: userProfile.preferred_job_types || [],
        preferred_locations: userProfile.preferred_locations || [],
        salary_min: userProfile.salary_expectation_min,
        salary_max: userProfile.salary_expectation_max,
        applied_jobs: appliedResult.rows.map(job => ({
          id: job.id,
          title: job.title,
          skills_required: job.skills_required || [],
          job_type: job.job_type,
          location: job.location,
          experience_level: job.experience_level,
          salary_min: job.salary_min,
          salary_max: job.salary_max
        })),
        saved_jobs: savedResult.rows.map(job => ({
          id: job.id,
          title: job.title,
          skills_required: job.skills_required || [],
          job_type: job.job_type,
          location: job.location,
          experience_level: job.experience_level,
          salary_min: job.salary_min,
          salary_max: job.salary_max
        })),
        applied_job_ids: appliedResult.rows.map(job => job.id),
        saved_job_ids: savedResult.rows.map(job => job.id)
      },
      jobs: jobsResult.rows.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        company_name: job.company_name,
        companyName: job.company_name,
        location: job.location,
        job_type: job.job_type,
        jobType: job.job_type,
        experience_level: job.experience_level,
        experienceLevel: job.experience_level,
        salary_min: job.salary_min,
        salaryMin: job.salary_min,
        salary_max: job.salary_max,
        salaryMax: job.salary_max,
        currency: job.currency,
        skills_required: job.skills_required || [],
        skillsRequired: job.skills_required || [],
        created_at: job.created_at
      }))
    };

    // Call Python AI engine
    const result = await runPythonRecommendation('recommend', inputData);

    if (!result.success) {
      throw new Error('AI recommendation failed');
    }

    // Format recommendations for frontend
    const recommendations = result.recommendations.slice(0, parseInt(limit)).map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.companyName || job.company_name,
      companyName: job.companyName || job.company_name,
      location: job.location,
      jobType: job.jobType || job.job_type,
      experienceLevel: job.experienceLevel || job.experience_level,
      salaryMin: job.salaryMin || job.salary_min,
      salaryMax: job.salaryMax || job.salary_max,
      currency: job.currency,
      skillsRequired: job.skillsRequired || job.skills_required || [],
      matchScore: job.match_score,
      skillMatch: job.skill_match,
      interestMatch: job.interest_match,
      matchingSkills: job.matching_skills || [],
      relatedSkills: job.related_skills || [],
      isSaved: job.is_saved
    }));

    res.json({
      recommendations,
      total: recommendations.length,
      aiPowered: true
    });

  } catch (error) {
    console.error('AI Recommendations error:', error);

    // Fallback to basic skill-based recommendations
    try {
      const fallbackResult = await getBasicRecommendations(req.user.id);
      res.json({
        recommendations: fallbackResult,
        total: fallbackResult.length,
        aiPowered: false,
        fallbackReason: 'AI engine unavailable, using basic matching'
      });
    } catch (fallbackError) {
      console.error('Fallback recommendations error:', fallbackError);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }
};

/**
 * Basic fallback recommendations using SQL
 */
async function getBasicRecommendations(userId) {
  // Get user profile with all preference data
  const profileResult = await pool.query(
    `SELECT skills, preferred_job_types, preferred_locations,
            salary_expectation_min, salary_expectation_max
     FROM user_profiles WHERE user_id = $1`,
    [userId]
  );

  const userProfile = profileResult.rows[0] || {};
  const userSkills = userProfile.skills || [];
  const preferredTypes = userProfile.preferred_job_types || [];
  const preferredLocations = userProfile.preferred_locations || [];
  const salaryMin = userProfile.salary_expectation_min;
  const salaryMax = userProfile.salary_expectation_max;

  if (userSkills.length === 0 && preferredTypes.length === 0 && preferredLocations.length === 0) {
    // Return recent jobs if no profile data at all
    const recentResult = await pool.query(
      `SELECT id, title, description, company_name, location, job_type,
              experience_level, salary_min, salary_max, currency, skills_required
       FROM job_postings
       WHERE is_active = true
       ORDER BY created_at DESC
       LIMIT 20`
    );

    return recentResult.rows.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company_name,
      companyName: job.company_name,
      location: job.location,
      jobType: job.job_type,
      experienceLevel: job.experience_level,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      currency: job.currency,
      skillsRequired: job.skills_required || [],
      matchScore: 50,
      matchingSkills: []
    }));
  }

  // Match jobs based on skills overlap and preferences
  const jobsResult = await pool.query(
    `SELECT id, title, description, company_name, location, job_type,
            experience_level, salary_min, salary_max, currency, skills_required
     FROM job_postings
     WHERE is_active = true`
  );

  const scoredJobs = jobsResult.rows
    .map(job => {
      let score = 0;
      const matchingSkills = [];

      // Skills matching (50% weight)
      if (userSkills.length > 0) {
        const jobSkills = (job.skills_required || []).map(s => s.toLowerCase());
        const userSkillsLower = userSkills.map(s => s.toLowerCase());
        const matches = userSkillsLower.filter(s => jobSkills.includes(s));
        matchingSkills.push(...matches);
        const skillScore = jobSkills.length > 0
          ? (matches.length / jobSkills.length) * 50
          : 0;
        score += skillScore;
      }

      // Job type matching (20% weight)
      if (preferredTypes.length > 0 && job.job_type) {
        const jobTypeLower = job.job_type.toLowerCase().replace(/_/g, ' ');
        const typeMatch = preferredTypes.some(t =>
          t.toLowerCase().includes(jobTypeLower) || jobTypeLower.includes(t.toLowerCase())
        );
        if (typeMatch) score += 20;
      }

      // Location matching (15% weight)
      if (preferredLocations.length > 0 && job.location) {
        const locationLower = job.location.toLowerCase();
        const locationMatch = preferredLocations.some(l =>
          locationLower.includes(l.toLowerCase()) || l.toLowerCase().includes(locationLower)
        );
        if (locationMatch) score += 15;
      }

      // Salary matching (15% weight)
      if (salaryMin && job.salary_max && job.salary_max >= salaryMin) {
        score += 15;
      } else if (salaryMax && job.salary_min && job.salary_min <= salaryMax) {
        score += 10;
      }

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        company: job.company_name,
        companyName: job.company_name,
        location: job.location,
        jobType: job.job_type,
        experienceLevel: job.experience_level,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        currency: job.currency,
        skillsRequired: job.skills_required || [],
        matchScore: Math.round(score),
        matchingSkills
      };
    })
    .filter(job => job.matchScore > 15)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);

  // If no matching jobs found, return recent jobs
  if (scoredJobs.length === 0) {
    return jobsResult.rows.slice(0, 20).map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company_name,
      companyName: job.company_name,
      location: job.location,
      jobType: job.job_type,
      experienceLevel: job.experience_level,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      currency: job.currency,
      skillsRequired: job.skills_required || [],
      matchScore: 40,
      matchingSkills: []
    }));
  }

  return scoredJobs;
}

/**
 * Get similar jobs to a specific job
 */
const getSimilarJobs = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { limit = 5 } = req.query;

    // Get target job
    const targetResult = await pool.query(
      `SELECT id, title, skills_required, job_type, location, experience_level
       FROM job_postings
       WHERE id = $1`,
      [jobId]
    );

    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const targetJob = targetResult.rows[0];

    // Get all active jobs
    const jobsResult = await pool.query(
      `SELECT id, title, description, company_name, location, job_type,
              experience_level, salary_min, salary_max, currency, skills_required
       FROM job_postings
       WHERE is_active = true AND id != $1`,
      [jobId]
    );

    // Prepare data for Python
    const inputData = {
      target_job: {
        id: targetJob.id,
        title: targetJob.title,
        skills_required: targetJob.skills_required || [],
        job_type: targetJob.job_type,
        location: targetJob.location,
        experience_level: targetJob.experience_level
      },
      jobs: jobsResult.rows.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        company_name: job.company_name,
        companyName: job.company_name,
        location: job.location,
        job_type: job.job_type,
        jobType: job.job_type,
        experience_level: job.experience_level,
        experienceLevel: job.experience_level,
        salary_min: job.salary_min,
        salaryMin: job.salary_min,
        salary_max: job.salary_max,
        salaryMax: job.salary_max,
        currency: job.currency,
        skills_required: job.skills_required || [],
        skillsRequired: job.skills_required || []
      }))
    };

    const result = await runPythonRecommendation('similar', inputData);

    if (!result.success) {
      throw new Error('Similar jobs calculation failed');
    }

    const similarJobs = result.similar_jobs.slice(0, parseInt(limit)).map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.companyName || job.company_name,
      companyName: job.companyName || job.company_name,
      location: job.location,
      jobType: job.jobType || job.job_type,
      experienceLevel: job.experienceLevel || job.experience_level,
      salaryMin: job.salaryMin || job.salary_min,
      salaryMax: job.salaryMax || job.salary_max,
      currency: job.currency,
      skillsRequired: job.skillsRequired || job.skills_required || [],
      similarityScore: job.similarity_score
    }));

    res.json({ similarJobs });

  } catch (error) {
    console.error('Similar jobs error:', error);
    res.status(500).json({ error: 'Failed to get similar jobs' });
  }
};

/**
 * Learn user interests (for debugging/analytics)
 */
const getUserInterests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data for learning
    const profileResult = await pool.query(
      'SELECT skills FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    const appliedResult = await pool.query(
      `SELECT j.skills_required, j.job_type, j.location, j.experience_level
       FROM job_applications ja
       JOIN job_postings j ON ja.job_posting_id = j.id
       WHERE ja.user_id = $1`,
      [userId]
    );

    const savedResult = await pool.query(
      `SELECT j.skills_required, j.job_type, j.location, j.experience_level
       FROM saved_jobs sj
       JOIN job_postings j ON sj.job_posting_id = j.id
       WHERE sj.user_id = $1`,
      [userId]
    );

    const inputData = {
      user_data: {
        profile_skills: profileResult.rows[0]?.skills || [],
        applied_jobs: appliedResult.rows.map(job => ({
          skills_required: job.skills_required || [],
          job_type: job.job_type,
          location: job.location,
          experience_level: job.experience_level
        })),
        saved_jobs: savedResult.rows.map(job => ({
          skills_required: job.skills_required || [],
          job_type: job.job_type,
          location: job.location,
          experience_level: job.experience_level
        }))
      }
    };

    const result = await runPythonRecommendation('learn', inputData);

    if (!result.success) {
      throw new Error('Interest learning failed');
    }

    res.json({
      interests: result.interests,
      stats: {
        profileSkills: profileResult.rows[0]?.skills?.length || 0,
        appliedJobs: appliedResult.rows.length,
        savedJobs: savedResult.rows.length
      }
    });

  } catch (error) {
    console.error('Get user interests error:', error);
    res.status(500).json({ error: 'Failed to analyze interests' });
  }
};

module.exports = {
  getAIRecommendations,
  getSimilarJobs,
  getUserInterests
};
