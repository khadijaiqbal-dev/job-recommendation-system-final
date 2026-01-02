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

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin seeder...');
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@jobmatch.com']
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists!');
      return;
    }
    
    // Hash admin password
    const saltRounds = 12;
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    // Create admin user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, first_name, last_name, role`,
      ['admin@jobmatch.com', passwordHash, 'Admin', 'User', 'admin', true]
    );
    
    const admin = result.rows[0];
    
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Name:', admin.first_name, admin.last_name);
    console.log('🔐 Role:', admin.role);
    console.log('');
    console.log('You can now login with:');
    console.log('Email: admin@jobmatch.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await pool.end();
  }
}

// Run the seeder
seedAdmin();
