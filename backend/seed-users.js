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

async function seedUsers() {
  try {
    console.log('🌱 Creating test users...');
    
    const saltRounds = 12;
    
    // 1. Admin User
    const adminPassword = 'admin123';
    const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    const adminResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, first_name, last_name, role`,
      ['admin@jobmatch.com', adminPasswordHash, 'Admin', 'User', 'admin', true]
    );
    
    if (adminResult.rows.length > 0) {
      console.log('✅ Admin user created!');
    } else {
      console.log('✅ Admin user already exists!');
    }
    
    // 2. Job Seeker User
    const seekerPassword = 'seeker123';
    const seekerPasswordHash = await bcrypt.hash(seekerPassword, saltRounds);
    
    const seekerResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, first_name, last_name, role`,
      ['seeker@jobmatch.com', seekerPasswordHash, 'John', 'Doe', 'job_seeker', true]
    );
    
    if (seekerResult.rows.length > 0) {
      console.log('✅ Job Seeker user created!');
    } else {
      console.log('✅ Job Seeker user already exists!');
    }
    
    console.log('');
    console.log('🎉 Test users created successfully!');
    console.log('');
    console.log('👤 Admin User:');
    console.log('   Email: admin@jobmatch.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Can: Add, Edit, Delete jobs + View all jobs');
    console.log('');
    console.log('👤 Job Seeker User:');
    console.log('   Email: seeker@jobmatch.com');
    console.log('   Password: seeker123');
    console.log('   Role: job_seeker');
    console.log('   Can: View jobs + Apply to jobs');
    console.log('');
    console.log('🚀 Test the role-based access:');
    console.log('1. Login as admin to manage jobs');
    console.log('2. Login as seeker to browse and apply');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await pool.end();
  }
}

// Run the seeder
seedUsers();
