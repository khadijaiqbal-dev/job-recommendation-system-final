/**
 * Companies Seeder
 * Seeds the companies table with sample companies across various industries
 */

const companies = [
  {
    name: 'TechCorp Inc.',
    description: 'Leading technology company specializing in software development, AI solutions, and enterprise software. We build cutting-edge products that transform how businesses operate.',
    website: 'https://techcorp.example.com',
    industry: 'Technology',
    size: '1000-5000',
    location: 'San Francisco, CA'
  },
  {
    name: 'StartupXYZ',
    description: 'Innovative startup focused on mobile applications and cloud services. We move fast, break things, and build amazing products.',
    website: 'https://startupxyz.example.com',
    industry: 'Technology',
    size: '50-200',
    location: 'Remote'
  },
  {
    name: 'DesignStudio Pro',
    description: 'Award-winning creative design agency providing UI/UX design, branding, and digital experience services to clients worldwide.',
    website: 'https://designstudiopro.example.com',
    industry: 'Design',
    size: '20-50',
    location: 'New York, NY'
  },
  {
    name: 'DataFlow Systems',
    description: 'Data analytics and business intelligence solutions provider. We help companies make data-driven decisions with our advanced analytics platform.',
    website: 'https://dataflow.example.com',
    industry: 'Data & Analytics',
    size: '200-500',
    location: 'Austin, TX'
  },
  {
    name: 'CloudNine Solutions',
    description: 'Cloud infrastructure and DevOps consulting firm. We help companies migrate to the cloud and optimize their infrastructure.',
    website: 'https://cloudnine.example.com',
    industry: 'Cloud Services',
    size: '100-200',
    location: 'Seattle, WA'
  },
  {
    name: 'FinTech Innovations',
    description: 'Financial technology company building the future of digital payments and banking. Our platform processes millions of transactions daily.',
    website: 'https://fintechinnovations.example.com',
    industry: 'Finance',
    size: '500-1000',
    location: 'New York, NY'
  },
  {
    name: 'HealthTech Labs',
    description: 'Healthcare technology startup developing AI-powered diagnostic tools and patient management systems.',
    website: 'https://healthtechlabs.example.com',
    industry: 'Healthcare',
    size: '50-100',
    location: 'Boston, MA'
  },
  {
    name: 'EcoSmart Technologies',
    description: 'Sustainable technology company creating smart solutions for energy management and environmental monitoring.',
    website: 'https://ecosmart.example.com',
    industry: 'CleanTech',
    size: '100-200',
    location: 'Denver, CO'
  },
  {
    name: 'GameVerse Studios',
    description: 'Game development studio creating immersive gaming experiences across mobile, console, and PC platforms.',
    website: 'https://gameverse.example.com',
    industry: 'Gaming',
    size: '200-500',
    location: 'Los Angeles, CA'
  },
  {
    name: 'CyberShield Security',
    description: 'Cybersecurity firm providing enterprise security solutions, penetration testing, and security consulting services.',
    website: 'https://cybershield.example.com',
    industry: 'Cybersecurity',
    size: '100-200',
    location: 'Washington, DC'
  },
  {
    name: 'EdTech Academy',
    description: 'Education technology company building online learning platforms and educational tools for students worldwide.',
    website: 'https://edtechacademy.example.com',
    industry: 'Education',
    size: '50-100',
    location: 'Chicago, IL'
  },
  {
    name: 'LogiTech Solutions',
    description: 'Logistics and supply chain technology company developing warehouse management and delivery optimization systems.',
    website: 'https://logitech-solutions.example.com',
    industry: 'Logistics',
    size: '200-500',
    location: 'Atlanta, GA'
  }
];

async function seed(pool) {
  console.log('   Seeding companies...');

  let created = 0;
  let skipped = 0;
  const companyIds = [];

  for (const company of companies) {
    const existing = await pool.query(
      'SELECT id FROM companies WHERE name = $1',
      [company.name]
    );

    if (existing.rows.length === 0) {
      const result = await pool.query(
        `INSERT INTO companies (name, description, website, industry, size, location)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [company.name, company.description, company.website, company.industry, company.size, company.location]
      );
      companyIds.push(result.rows[0].id);
      created++;
    } else {
      companyIds.push(existing.rows[0].id);
      skipped++;
    }
  }

  console.log(`   Created ${created} companies, skipped ${skipped} existing`);
  return companyIds;
}

async function rollback(pool) {
  console.log('   Rolling back companies...');
  // This will cascade delete job_postings due to FK constraint
  await pool.query('DELETE FROM companies');
  console.log('   All companies deleted');
}

module.exports = { seed, rollback, name: 'companies', data: companies };
