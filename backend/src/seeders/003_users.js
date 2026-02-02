/**
 * Users Seeder
 * Seeds the users and user_profiles tables with sample users
 */

const bcrypt = require('bcryptjs');

const users = [
  // Admin User
  {
    email: 'admin@jobmatch.com',
    password: 'admin123',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    is_verified: true,
    profile: null
  },
  // Job Seekers
  {
    email: 'john.developer@example.com',
    password: 'password123',
    first_name: 'John',
    last_name: 'Developer',
    role: 'job_seeker',
    is_verified: true,
    profile: {
      bio: 'Full-stack developer with 5 years of experience building scalable web applications. Passionate about clean code and user experience.',
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
      experience_years: 5,
      location: 'San Francisco, CA',
      phone: '+1-555-0101',
      linkedin_url: 'https://linkedin.com/in/johndeveloper',
      github_url: 'https://github.com/johndeveloper',
      preferred_job_types: ['full_time', 'remote'],
      preferred_locations: ['San Francisco, CA', 'Remote'],
      salary_expectation_min: 120000,
      salary_expectation_max: 150000
    }
  },
  {
    email: 'sarah.designer@example.com',
    password: 'password123',
    first_name: 'Sarah',
    last_name: 'Designer',
    role: 'job_seeker',
    is_verified: true,
    profile: {
      bio: 'UI/UX designer with a passion for creating beautiful and intuitive user experiences. Experience with design systems and user research.',
      skills: ['Figma', 'UI Design', 'UX Design', 'User Research', 'Prototyping', 'Adobe XD'],
      experience_years: 4,
      location: 'New York, NY',
      phone: '+1-555-0102',
      linkedin_url: 'https://linkedin.com/in/sarahdesigner',
      preferred_job_types: ['full_time', 'contract'],
      preferred_locations: ['New York, NY', 'Remote'],
      salary_expectation_min: 90000,
      salary_expectation_max: 120000
    }
  },
  {
    email: 'mike.datascientist@example.com',
    password: 'password123',
    first_name: 'Mike',
    last_name: 'DataScientist',
    role: 'job_seeker',
    is_verified: true,
    profile: {
      bio: 'Data scientist with expertise in machine learning and predictive analytics. PhD in Computer Science with focus on NLP.',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Data Analysis', 'Natural Language Processing'],
      experience_years: 6,
      location: 'Austin, TX',
      phone: '+1-555-0103',
      linkedin_url: 'https://linkedin.com/in/mikedatascientist',
      github_url: 'https://github.com/mikedatascientist',
      preferred_job_types: ['full_time'],
      preferred_locations: ['Austin, TX', 'San Francisco, CA', 'Remote'],
      salary_expectation_min: 140000,
      salary_expectation_max: 180000
    }
  },
  {
    email: 'emily.devops@example.com',
    password: 'password123',
    first_name: 'Emily',
    last_name: 'DevOps',
    role: 'job_seeker',
    is_verified: true,
    profile: {
      bio: 'DevOps engineer specializing in cloud infrastructure and CI/CD pipelines. AWS and Kubernetes certified.',
      skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'GitHub Actions', 'Linux'],
      experience_years: 4,
      location: 'Seattle, WA',
      phone: '+1-555-0104',
      linkedin_url: 'https://linkedin.com/in/emilydevops',
      github_url: 'https://github.com/emilydevops',
      preferred_job_types: ['full_time', 'remote'],
      preferred_locations: ['Seattle, WA', 'Remote'],
      salary_expectation_min: 110000,
      salary_expectation_max: 140000
    }
  },
  {
    email: 'alex.mobile@example.com',
    password: 'password123',
    first_name: 'Alex',
    last_name: 'Mobile',
    role: 'job_seeker',
    is_verified: true,
    profile: {
      bio: 'Mobile developer with experience in both iOS and Android development. Shipped 10+ apps on app stores.',
      skills: ['React Native', 'Swift', 'Kotlin', 'iOS Development', 'Android Development', 'Flutter'],
      experience_years: 5,
      location: 'Los Angeles, CA',
      phone: '+1-555-0105',
      linkedin_url: 'https://linkedin.com/in/alexmobile',
      github_url: 'https://github.com/alexmobile',
      preferred_job_types: ['full_time', 'contract'],
      preferred_locations: ['Los Angeles, CA', 'Remote'],
      salary_expectation_min: 100000,
      salary_expectation_max: 130000
    }
  },
  {
    email: 'lisa.backend@example.com',
    password: 'password123',
    first_name: 'Lisa',
    last_name: 'Backend',
    role: 'job_seeker',
    is_verified: true,
    profile: {
      bio: 'Backend developer with strong expertise in microservices architecture and API design. Java and Go enthusiast.',
      skills: ['Java', 'Go', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis', 'gRPC'],
      experience_years: 7,
      location: 'Chicago, IL',
      phone: '+1-555-0106',
      linkedin_url: 'https://linkedin.com/in/lisabackend',
      github_url: 'https://github.com/lisabackend',
      preferred_job_types: ['full_time'],
      preferred_locations: ['Chicago, IL', 'Remote'],
      salary_expectation_min: 130000,
      salary_expectation_max: 160000
    }
  },
  {
    email: 'chris.security@example.com',
    password: 'password123',
    first_name: 'Chris',
    last_name: 'Security',
    role: 'job_seeker',
    is_verified: true,
    profile: {
      bio: 'Cybersecurity professional with experience in penetration testing and security auditing. OSCP certified.',
      skills: ['Cybersecurity', 'Penetration Testing', 'OWASP', 'Security Auditing', 'Python', 'Linux'],
      experience_years: 6,
      location: 'Washington, DC',
      phone: '+1-555-0107',
      linkedin_url: 'https://linkedin.com/in/chrissecurity',
      preferred_job_types: ['full_time', 'contract'],
      preferred_locations: ['Washington, DC', 'Remote'],
      salary_expectation_min: 120000,
      salary_expectation_max: 150000
    }
  },
  {
    email: 'david.junior@example.com',
    password: 'password123',
    first_name: 'David',
    last_name: 'Junior',
    role: 'job_seeker',
    is_verified: true,
    profile: {
      bio: 'Recent computer science graduate eager to start a career in software development. Quick learner with strong fundamentals.',
      skills: ['JavaScript', 'Python', 'React', 'Git', 'HTML', 'CSS'],
      experience_years: 1,
      location: 'Boston, MA',
      phone: '+1-555-0108',
      linkedin_url: 'https://linkedin.com/in/davidjunior',
      github_url: 'https://github.com/davidjunior',
      preferred_job_types: ['full_time', 'internship'],
      preferred_locations: ['Boston, MA', 'New York, NY', 'Remote'],
      salary_expectation_min: 60000,
      salary_expectation_max: 80000
    }
  },
  {
    email: 'rachel.product@example.com',
    password: 'password123',
    first_name: 'Rachel',
    last_name: 'Product',
    role: 'job_seeker',
    is_verified: true,
    profile: {
      bio: 'Product manager with technical background. Experience in agile methodologies and cross-functional team leadership.',
      skills: ['Product Management', 'Agile', 'Scrum', 'Jira', 'User Research', 'A/B Testing', 'SQL'],
      experience_years: 5,
      location: 'San Francisco, CA',
      phone: '+1-555-0109',
      linkedin_url: 'https://linkedin.com/in/rachelproduct',
      preferred_job_types: ['full_time'],
      preferred_locations: ['San Francisco, CA', 'Seattle, WA', 'Remote'],
      salary_expectation_min: 130000,
      salary_expectation_max: 160000
    }
  }
];

async function seed(pool) {
  console.log('   Seeding users and profiles...');

  let usersCreated = 0;
  let usersSkipped = 0;
  let profilesCreated = 0;

  for (const userData of users) {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email]
    );

    let userId;
    if (existing.rows.length === 0) {
      const passwordHash = await bcrypt.hash(userData.password, 12);

      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [userData.email, passwordHash, userData.first_name, userData.last_name, userData.role, userData.is_verified]
      );

      userId = result.rows[0].id;
      usersCreated++;
    } else {
      userId = existing.rows[0].id;
      usersSkipped++;
    }

    // Create profile if exists
    if (userData.profile) {
      const existingProfile = await pool.query(
        'SELECT id FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      if (existingProfile.rows.length === 0) {
        const p = userData.profile;
        await pool.query(
          `INSERT INTO user_profiles
           (user_id, bio, skills, experience_years, location, phone, linkedin_url, github_url,
            preferred_job_types, preferred_locations, salary_expectation_min, salary_expectation_max)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            userId, p.bio, p.skills, p.experience_years, p.location, p.phone,
            p.linkedin_url, p.github_url || null, p.preferred_job_types, p.preferred_locations,
            p.salary_expectation_min, p.salary_expectation_max
          ]
        );
        profilesCreated++;
      }
    }
  }

  console.log(`   Created ${usersCreated} users (skipped ${usersSkipped}), ${profilesCreated} profiles`);
}

async function rollback(pool) {
  console.log('   Rolling back users and profiles...');
  // Profiles will be cascade deleted
  await pool.query('DELETE FROM users');
  console.log('   All users and profiles deleted');
}

module.exports = { seed, rollback, name: 'users', data: users };
