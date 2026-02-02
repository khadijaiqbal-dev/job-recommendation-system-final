/**
 * Job Skills Junction Seeder
 * Links job postings with skills in the job_skills junction table
 */

async function seed(pool) {
  console.log('   Seeding job_skills relationships...');

  // Get all job postings with their skills_required
  const jobs = await pool.query(
    'SELECT id, skills_required FROM job_postings WHERE skills_required IS NOT NULL'
  );

  let created = 0;
  let skipped = 0;

  for (const job of jobs.rows) {
    const skillsRequired = job.skills_required;

    if (!skillsRequired || !Array.isArray(skillsRequired)) {
      continue;
    }

    for (const skillName of skillsRequired) {
      // Find the skill in skills table
      const skillResult = await pool.query(
        'SELECT id FROM skills WHERE LOWER(name) = LOWER($1)',
        [skillName]
      );

      if (skillResult.rows.length === 0) {
        // Skill not in skills table, skip
        continue;
      }

      const skillId = skillResult.rows[0].id;

      // Check if relationship already exists
      const existing = await pool.query(
        'SELECT id FROM job_skills WHERE job_posting_id = $1 AND skill_id = $2',
        [job.id, skillId]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO job_skills (job_posting_id, skill_id) VALUES ($1, $2)',
          [job.id, skillId]
        );
        created++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`   Created ${created} job-skill relationships, skipped ${skipped} existing`);
}

async function rollback(pool) {
  console.log('   Rolling back job_skills...');
  await pool.query('DELETE FROM job_skills');
  console.log('   All job_skills relationships deleted');
}

module.exports = { seed, rollback, name: 'job_skills' };
