const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedData() {
  try {
    console.log('🌱 Starting database seeder...');
    
    // 1. Create Admin User
    console.log('👤 Creating admin user...');
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@jobmatch.com']
    );
    
    let adminId;
    if (existingAdmin.rows.length === 0) {
      const saltRounds = 12;
      const adminPassword = 'admin123';
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
      
      const adminResult = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id`,
        ['admin@jobmatch.com', passwordHash, 'Admin', 'User', 'admin', true]
      );
      
      adminId = adminResult.rows[0].id;
      console.log('✅ Admin user created!');
      console.log('   Email: admin@jobmatch.com');
      console.log('   Password: admin123');
    } else {
      adminId = existingAdmin.rows[0].id;
      console.log('✅ Admin user already exists!');
    }
    
    // 2. Create Sample Companies
    console.log('🏢 Creating sample companies...');
    const companies = [
      {
        name: 'TechCorp Inc.',
        description: 'Leading technology company specializing in software development and AI solutions.',
        website: 'https://techcorp.com',
        industry: 'Technology',
        size: '1000-5000',
        location: 'San Francisco, CA'
      },
      {
        name: 'StartupXYZ',
        description: 'Innovative startup focused on mobile applications and cloud services.',
        website: 'https://startupxyz.com',
        industry: 'Technology',
        size: '50-200',
        location: 'Remote'
      },
      {
        name: 'DesignStudio',
        description: 'Creative design agency providing UI/UX and branding services.',
        website: 'https://designstudio.com',
        industry: 'Design',
        size: '20-50',
        location: 'New York, NY'
      },
      {
        name: 'DataFlow Systems',
        description: 'Data analytics and business intelligence solutions provider.',
        website: 'https://dataflow.com',
        industry: 'Data & Analytics',
        size: '200-500',
        location: 'Austin, TX'
      }
    ];
    
    const companyIds = [];
    for (const company of companies) {
      const existingCompany = await pool.query(
        'SELECT id FROM companies WHERE name = $1',
        [company.name]
      );
      
      if (existingCompany.rows.length === 0) {
        const result = await pool.query(
          `INSERT INTO companies (name, description, website, industry, size, location)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [company.name, company.description, company.website, company.industry, company.size, company.location]
        );
        companyIds.push(result.rows[0].id);
        console.log(`   ✅ Created company: ${company.name}`);
      } else {
        companyIds.push(existingCompany.rows[0].id);
        console.log(`   ✅ Company already exists: ${company.name}`);
      }
    }
    
    // 3. Create Sample Jobs
    console.log('💼 Creating sample jobs...');
    const jobs = [
      {
        company_id: companyIds[0],
        title: 'Senior React Developer',
        description: 'We are looking for a senior React developer to join our team. You will be responsible for building user-facing features and reusable components.',
        requirements: ['5+ years React experience', 'Strong JavaScript skills', 'Experience with Redux', 'Testing experience'],
        skills_required: ['React', 'JavaScript', 'TypeScript', 'Redux', 'Jest'],
        location: 'San Francisco, CA',
        job_type: 'full_time',
        experience_level: 'senior',
        salary_min: 120000,
        salary_max: 150000,
        posted_by: adminId
      },
      {
        company_id: companyIds[1],
        title: 'Full Stack Developer',
        description: 'Join our growing startup as a full stack developer. Work on exciting projects using modern technologies.',
        requirements: ['3+ years full stack experience', 'Node.js experience', 'Database knowledge', 'API development'],
        skills_required: ['React', 'Node.js', 'MongoDB', 'AWS', 'Express'],
        location: 'Remote',
        job_type: 'full_time',
        experience_level: 'mid',
        salary_min: 90000,
        salary_max: 120000,
        posted_by: adminId
      },
      {
        company_id: companyIds[2],
        title: 'Frontend Developer',
        description: 'Contract position for frontend development. Work with our design team to create beautiful user interfaces.',
        requirements: ['2+ years frontend experience', 'CSS expertise', 'Design collaboration', 'Responsive design'],
        skills_required: ['React', 'Vue.js', 'CSS', 'Figma', 'Sass'],
        location: 'New York, NY',
        job_type: 'contract',
        experience_level: 'mid',
        salary_min: 80,
        salary_max: 100,
        posted_by: adminId
      },
      {
        company_id: companyIds[3],
        title: 'Data Scientist',
        description: 'Join our data team to analyze complex datasets and build machine learning models.',
        requirements: ['PhD or Masters in Data Science', 'Python experience', 'Machine learning knowledge', 'SQL skills'],
        skills_required: ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow'],
        location: 'Austin, TX',
        job_type: 'full_time',
        experience_level: 'senior',
        salary_min: 110000,
        salary_max: 140000,
        posted_by: adminId
      },
      {
        company_id: companyIds[0],
        title: 'DevOps Engineer',
        description: 'Help us scale our infrastructure and improve our deployment processes.',
        requirements: ['3+ years DevOps experience', 'AWS/Azure knowledge', 'Docker experience', 'CI/CD pipelines'],
        skills_required: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
        location: 'San Francisco, CA',
        job_type: 'full_time',
        experience_level: 'mid',
        salary_min: 100000,
        salary_max: 130000,
        posted_by: adminId
      }
    ];
    
    for (const job of jobs) {
      const existingJob = await pool.query(
        'SELECT id FROM job_postings WHERE title = $1 AND company_id = $2',
        [job.title, job.company_id]
      );
      
      if (existingJob.rows.length === 0) {
        await pool.query(
          `INSERT INTO job_postings 
           (company_id, title, description, requirements, skills_required, location, 
            job_type, experience_level, salary_min, salary_max, posted_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            job.company_id, job.title, job.description, job.requirements, 
            job.skills_required, job.location, job.job_type, job.experience_level,
            job.salary_min, job.salary_max, job.posted_by
          ]
        );
        console.log(`   ✅ Created job: ${job.title}`);
      } else {
        console.log(`   ✅ Job already exists: ${job.title}`);
      }
    }
    
    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('👤 Admin User: admin@jobmatch.com / admin123');
    console.log(`🏢 Companies: ${companies.length} companies created`);
    console.log(`💼 Jobs: ${jobs.length} jobs created`);
    console.log('');
    console.log('🚀 You can now:');
    console.log('1. Login as admin with: admin@jobmatch.com / admin123');
    console.log('2. Browse jobs in the frontend');
    console.log('3. Test the full application flow');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await pool.end();
  }
}

// Run the seeder
seedData();
