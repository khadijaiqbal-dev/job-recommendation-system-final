/**
 * Job Postings Seeder
 * Seeds the job_postings table with sample jobs across various companies
 */

const jobs = [
  // TechCorp Inc. Jobs
  {
    company_name: 'TechCorp Inc.',
    title: 'Senior React Developer',
    description: `We are looking for a Senior React Developer to join our growing team. You will be responsible for building user-facing features using React.js and implementing reusable components and front-end libraries.

Responsibilities:
- Develop new user-facing features using React.js
- Build reusable components and front-end libraries for future use
- Translate designs and wireframes into high-quality code
- Optimize components for maximum performance across devices
- Collaborate with back-end developers and web designers`,
    requirements: ['5+ years React experience', 'Strong JavaScript/TypeScript skills', 'Experience with Redux or similar state management', 'Unit testing experience with Jest'],
    skills_required: ['React', 'JavaScript', 'TypeScript', 'Redux', 'Jest', 'Git'],
    location: 'San Francisco, CA',
    job_type: 'full_time',
    experience_level: 'senior',
    salary_min: 140000,
    salary_max: 180000
  },
  {
    company_name: 'TechCorp Inc.',
    title: 'DevOps Engineer',
    description: `Join our infrastructure team to help scale our cloud-based platform. You'll be responsible for maintaining and improving our CI/CD pipelines and cloud infrastructure.

Responsibilities:
- Design and maintain CI/CD pipelines
- Manage AWS infrastructure using Infrastructure as Code
- Monitor and improve system reliability
- Implement security best practices
- Collaborate with development teams on deployment strategies`,
    requirements: ['3+ years DevOps experience', 'AWS certification preferred', 'Strong Docker/Kubernetes knowledge', 'Experience with Terraform'],
    skills_required: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux'],
    location: 'San Francisco, CA',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: 120000,
    salary_max: 150000
  },

  // StartupXYZ Jobs
  {
    company_name: 'StartupXYZ',
    title: 'Full Stack Developer',
    description: `Join our fast-paced startup as a Full Stack Developer. Work on exciting projects using modern technologies and help shape the future of our product.

Responsibilities:
- Develop features across the entire stack
- Write clean, maintainable code
- Participate in code reviews and technical discussions
- Help define technical architecture decisions
- Work directly with founders on product roadmap`,
    requirements: ['3+ years full stack experience', 'Node.js proficiency', 'React experience', 'Database design skills'],
    skills_required: ['React', 'Node.js', 'MongoDB', 'AWS', 'Express', 'TypeScript'],
    location: 'Remote',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: 100000,
    salary_max: 130000
  },
  {
    company_name: 'StartupXYZ',
    title: 'Junior Frontend Developer',
    description: `Great opportunity for a junior developer to grow with a dynamic startup. You'll work alongside senior developers and learn best practices while contributing to real projects.

Responsibilities:
- Implement UI components based on designs
- Fix bugs and improve existing features
- Write unit tests for components
- Learn and grow with mentorship from senior developers`,
    requirements: ['1+ year frontend experience', 'React knowledge', 'HTML/CSS proficiency', 'Eagerness to learn'],
    skills_required: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    location: 'Remote',
    job_type: 'full_time',
    experience_level: 'entry',
    salary_min: 65000,
    salary_max: 85000
  },

  // DesignStudio Pro Jobs
  {
    company_name: 'DesignStudio Pro',
    title: 'Senior UI/UX Designer',
    description: `We're looking for a talented Senior UI/UX Designer to lead design projects for our diverse client base. You'll create stunning interfaces that delight users.

Responsibilities:
- Lead design projects from concept to delivery
- Create wireframes, prototypes, and high-fidelity designs
- Conduct user research and usability testing
- Mentor junior designers
- Present designs to clients and stakeholders`,
    requirements: ['5+ years UI/UX experience', 'Strong portfolio required', 'Figma expertise', 'User research experience'],
    skills_required: ['Figma', 'UI Design', 'UX Design', 'User Research', 'Prototyping', 'Design Systems'],
    location: 'New York, NY',
    job_type: 'full_time',
    experience_level: 'senior',
    salary_min: 110000,
    salary_max: 140000
  },
  {
    company_name: 'DesignStudio Pro',
    title: 'Frontend Developer (Contract)',
    description: `6-month contract position to implement designs for client projects. Work closely with our design team to bring beautiful interfaces to life.

Responsibilities:
- Implement pixel-perfect designs
- Build responsive web applications
- Collaborate with designers on feasibility
- Optimize for performance and accessibility`,
    requirements: ['3+ years frontend experience', 'Strong CSS skills', 'Animation experience', 'Accessibility knowledge'],
    skills_required: ['React', 'Vue.js', 'CSS', 'Tailwind CSS', 'Sass', 'Accessibility'],
    location: 'New York, NY',
    job_type: 'contract',
    experience_level: 'mid',
    salary_min: 85,
    salary_max: 110
  },

  // DataFlow Systems Jobs
  {
    company_name: 'DataFlow Systems',
    title: 'Senior Data Scientist',
    description: `Join our data science team to build predictive models and extract insights from complex datasets. You'll work on challenging problems that impact business decisions.

Responsibilities:
- Build and deploy machine learning models
- Analyze large datasets to extract insights
- Collaborate with stakeholders to understand requirements
- Present findings to technical and non-technical audiences
- Stay current with latest ML research`,
    requirements: ['PhD or Masters in relevant field', 'Strong Python skills', 'Production ML experience', 'Excellent communication'],
    skills_required: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Data Analysis'],
    location: 'Austin, TX',
    job_type: 'full_time',
    experience_level: 'senior',
    salary_min: 140000,
    salary_max: 175000
  },
  {
    company_name: 'DataFlow Systems',
    title: 'Data Engineer',
    description: `Build and maintain our data infrastructure. Design scalable data pipelines that power our analytics platform.

Responsibilities:
- Design and build data pipelines
- Maintain data warehouse infrastructure
- Optimize query performance
- Implement data quality monitoring
- Collaborate with data scientists`,
    requirements: ['3+ years data engineering experience', 'Strong SQL skills', 'Spark experience', 'Cloud data services'],
    skills_required: ['Python', 'SQL', 'Apache Spark', 'AWS', 'PostgreSQL', 'Airflow'],
    location: 'Austin, TX',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: 110000,
    salary_max: 140000
  },

  // CloudNine Solutions Jobs
  {
    company_name: 'CloudNine Solutions',
    title: 'Cloud Architect',
    description: `Design and implement cloud solutions for enterprise clients. Lead cloud migration projects and establish best practices.

Responsibilities:
- Design cloud architecture for client projects
- Lead migration planning and execution
- Establish cloud governance and best practices
- Provide technical leadership to delivery teams
- Conduct architecture reviews`,
    requirements: ['7+ years cloud experience', 'AWS/Azure certifications', 'Enterprise architecture experience', 'Strong communication'],
    skills_required: ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Microservices', 'Serverless'],
    location: 'Seattle, WA',
    job_type: 'full_time',
    experience_level: 'lead',
    salary_min: 160000,
    salary_max: 200000
  },

  // FinTech Innovations Jobs
  {
    company_name: 'FinTech Innovations',
    title: 'Backend Developer (Java)',
    description: `Join our core platform team building high-performance financial transaction systems. Work on systems processing millions of transactions daily.

Responsibilities:
- Design and implement backend services
- Optimize for performance and reliability
- Ensure security compliance
- Write comprehensive tests
- Participate in on-call rotation`,
    requirements: ['5+ years Java experience', 'Financial systems experience', 'High-performance systems', 'Security minded'],
    skills_required: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Microservices', 'Kafka'],
    location: 'New York, NY',
    job_type: 'full_time',
    experience_level: 'senior',
    salary_min: 150000,
    salary_max: 190000
  },

  // HealthTech Labs Jobs
  {
    company_name: 'HealthTech Labs',
    title: 'Machine Learning Engineer',
    description: `Work on cutting-edge AI applications in healthcare. Build models that help doctors make better diagnoses.

Responsibilities:
- Develop ML models for medical imaging
- Collaborate with medical professionals
- Deploy models to production
- Ensure HIPAA compliance
- Research latest techniques`,
    requirements: ['3+ years ML experience', 'Healthcare experience preferred', 'PyTorch proficiency', 'Production ML deployment'],
    skills_required: ['Python', 'PyTorch', 'TensorFlow', 'Computer Vision', 'Docker', 'MLOps'],
    location: 'Boston, MA',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: 120000,
    salary_max: 155000
  },

  // CyberShield Security Jobs
  {
    company_name: 'CyberShield Security',
    title: 'Security Engineer',
    description: `Protect our clients from cyber threats. Conduct penetration tests and security assessments for enterprise clients.

Responsibilities:
- Conduct penetration testing
- Perform security assessments
- Write detailed security reports
- Advise clients on remediation
- Stay current with latest threats`,
    requirements: ['5+ years security experience', 'OSCP/CEH certification', 'Strong scripting skills', 'Excellent documentation'],
    skills_required: ['Cybersecurity', 'Penetration Testing', 'Python', 'Linux', 'OWASP', 'Security Auditing'],
    location: 'Washington, DC',
    job_type: 'full_time',
    experience_level: 'senior',
    salary_min: 130000,
    salary_max: 165000
  },

  // GameVerse Studios Jobs
  {
    company_name: 'GameVerse Studios',
    title: 'Game Developer (Unity)',
    description: `Create immersive gaming experiences using Unity. Work on mobile and console games played by millions.

Responsibilities:
- Develop gameplay features
- Optimize game performance
- Collaborate with artists and designers
- Implement multiplayer features
- Debug and fix issues`,
    requirements: ['3+ years Unity experience', 'C# proficiency', 'Shipped games', 'Multiplayer experience'],
    skills_required: ['Unity', 'C#', 'Game Development', 'Git', 'Agile'],
    location: 'Los Angeles, CA',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: 90000,
    salary_max: 120000
  },

  // EdTech Academy Jobs
  {
    company_name: 'EdTech Academy',
    title: 'Full Stack Developer',
    description: `Build educational technology that helps students learn. Work on our learning management system used by thousands of schools.

Responsibilities:
- Develop new platform features
- Improve student learning experience
- Build admin tools for educators
- Ensure accessibility compliance
- Integrate with third-party services`,
    requirements: ['3+ years full stack experience', 'EdTech experience preferred', 'Accessibility knowledge', 'API development'],
    skills_required: ['React', 'Node.js', 'PostgreSQL', 'REST API', 'Accessibility', 'TypeScript'],
    location: 'Chicago, IL',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: 95000,
    salary_max: 125000
  },

  // Remote Internship
  {
    company_name: 'StartupXYZ',
    title: 'Software Development Intern',
    description: `3-month internship program for students or recent graduates. Learn from experienced developers and contribute to real projects.

Responsibilities:
- Work on real features under mentorship
- Learn professional software development practices
- Participate in code reviews
- Present work at end of internship`,
    requirements: ['Currently enrolled or recent graduate', 'Basic programming knowledge', 'Eagerness to learn', 'Good communication'],
    skills_required: ['JavaScript', 'Python', 'Git', 'HTML', 'CSS'],
    location: 'Remote',
    job_type: 'internship',
    experience_level: 'entry',
    salary_min: 25,
    salary_max: 35
  }
];

async function seed(pool) {
  console.log('   Seeding job postings...');

  // Get admin user ID for posted_by
  const adminResult = await pool.query(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
  );

  let adminId = null;
  if (adminResult.rows.length > 0) {
    adminId = adminResult.rows[0].id;
  }

  let created = 0;
  let skipped = 0;

  for (const job of jobs) {
    // Get company ID
    const companyResult = await pool.query(
      'SELECT id FROM companies WHERE name = $1',
      [job.company_name]
    );

    if (companyResult.rows.length === 0) {
      console.log(`   Skipping job "${job.title}" - company "${job.company_name}" not found`);
      continue;
    }

    const companyId = companyResult.rows[0].id;

    // Check if job already exists
    const existing = await pool.query(
      'SELECT id FROM job_postings WHERE title = $1 AND company_id = $2',
      [job.title, companyId]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO job_postings
         (company_id, title, description, requirements, skills_required, location,
          job_type, experience_level, salary_min, salary_max, posted_by, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          companyId, job.title, job.description, job.requirements, job.skills_required,
          job.location, job.job_type, job.experience_level, job.salary_min, job.salary_max,
          adminId, true
        ]
      );
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`   Created ${created} job postings, skipped ${skipped} existing`);
}

async function rollback(pool) {
  console.log('   Rolling back job postings...');
  await pool.query('DELETE FROM job_postings');
  console.log('   All job postings deleted');
}

module.exports = { seed, rollback, name: 'job_postings', data: jobs };
