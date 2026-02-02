/**
 * Skills Seeder
 * Seeds the skills table with comprehensive technical and soft skills
 */

const skills = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP',
  'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell Scripting', 'Bash',

  // Frontend Frameworks & Libraries
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'jQuery', 'Bootstrap',
  'Tailwind CSS', 'Material UI', 'Chakra UI', 'Ant Design', 'Redux', 'MobX', 'Zustand',

  // Backend Frameworks
  'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Ruby on Rails',
  'ASP.NET', 'Laravel', 'Symfony', 'Gin', 'Echo', 'Fiber',

  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite', 'Oracle', 'SQL Server',
  'Cassandra', 'DynamoDB', 'Firebase', 'Supabase', 'CouchDB', 'Neo4j', 'GraphQL',

  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
  'Terraform', 'Ansible', 'Puppet', 'Chef', 'CircleCI', 'Travis CI', 'ArgoCD', 'Helm',

  // Data Science & ML
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
  'Pandas', 'NumPy', 'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI',
  'Natural Language Processing', 'Computer Vision', 'MLOps', 'Apache Spark',

  // Mobile Development
  'React Native', 'Flutter', 'iOS Development', 'Android Development', 'SwiftUI',
  'Jetpack Compose', 'Xamarin', 'Ionic', 'Cordova',

  // Testing
  'Jest', 'Mocha', 'Cypress', 'Selenium', 'Playwright', 'JUnit', 'PyTest', 'RSpec',
  'Testing Library', 'Enzyme', 'Vitest', 'Karma', 'Jasmine',

  // Tools & Platforms
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Slack', 'Figma',
  'Postman', 'Swagger', 'VS Code', 'IntelliJ IDEA', 'Linux', 'Unix', 'Windows Server',

  // API & Architecture
  'REST API', 'GraphQL', 'gRPC', 'WebSockets', 'Microservices', 'Serverless',
  'Event-Driven Architecture', 'Domain-Driven Design', 'CQRS', 'Event Sourcing',

  // Security
  'Cybersecurity', 'OWASP', 'Penetration Testing', 'Security Auditing', 'OAuth', 'JWT',
  'SSL/TLS', 'Encryption', 'Identity Management', 'SIEM',

  // Soft Skills
  'Project Management', 'Agile', 'Scrum', 'Kanban', 'Team Leadership', 'Communication',
  'Problem Solving', 'Critical Thinking', 'Time Management', 'Collaboration',

  // Design
  'UI Design', 'UX Design', 'User Research', 'Wireframing', 'Prototyping', 'Adobe XD',
  'Sketch', 'InVision', 'Design Systems', 'Responsive Design', 'Accessibility',

  // Business & Analytics
  'Business Analysis', 'Product Management', 'Requirements Gathering', 'Stakeholder Management',
  'Google Analytics', 'A/B Testing', 'SEO', 'Digital Marketing', 'Content Strategy'
];

async function seed(pool) {
  console.log('   Seeding skills...');

  let created = 0;
  let skipped = 0;

  for (const skillName of skills) {
    const existing = await pool.query(
      'SELECT id FROM skills WHERE name = $1',
      [skillName]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO skills (name) VALUES ($1)',
        [skillName]
      );
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`   Created ${created} skills, skipped ${skipped} existing`);
}

async function rollback(pool) {
  console.log('   Rolling back skills...');
  await pool.query('DELETE FROM skills');
  console.log('   All skills deleted');
}

module.exports = { seed, rollback, name: 'skills' };
