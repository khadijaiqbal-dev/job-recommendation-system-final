#!/usr/bin/env node

/**
 * Database Seeder Runner
 *
 * Usage:
 *   node seed.js              - Run all seeders
 *   node seed.js skills       - Run specific seeder
 *   node seed.js rollback     - Rollback all seeders
 *   node seed.js rollback skills - Rollback specific seeder
 *   node seed.js fresh        - Rollback all and re-seed
 *   node seed.js status       - Show seeding status
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Get all seeder files in order
function getSeederFiles() {
  const seedersDir = __dirname;
  const files = fs.readdirSync(seedersDir)
    .filter(f => f.match(/^\d{3}_.*\.js$/) && f !== 'seed.js')
    .sort();
  return files;
}

// Load a seeder module
function loadSeeder(filename) {
  const seederPath = path.join(__dirname, filename);
  return require(seederPath);
}

// Run all seeders
async function seedAll() {
  console.log('');
  console.log('==================================');
  console.log('   Database Seeder Runner');
  console.log('==================================');
  console.log('');

  const files = getSeederFiles();

  console.log(`Found ${files.length} seeders to run:`);
  files.forEach(f => console.log(`  - ${f}`));
  console.log('');

  for (const file of files) {
    const seeder = loadSeeder(file);
    console.log(`Running seeder: ${file}`);

    try {
      await seeder.seed(pool);
      console.log(`   Completed: ${seeder.name || file}`);
    } catch (error) {
      console.error(`   Error in ${file}:`, error.message);
      throw error;
    }
  }

  console.log('');
  console.log('==================================');
  console.log('   All seeders completed!');
  console.log('==================================');
  console.log('');
}

// Run specific seeder
async function seedOne(name) {
  const files = getSeederFiles();
  const file = files.find(f => f.includes(name));

  if (!file) {
    console.error(`Seeder "${name}" not found`);
    console.log('Available seeders:');
    files.forEach(f => console.log(`  - ${f}`));
    process.exit(1);
  }

  console.log(`Running seeder: ${file}`);
  const seeder = loadSeeder(file);
  await seeder.seed(pool);
  console.log(`Completed: ${seeder.name || file}`);
}

// Rollback all seeders (in reverse order)
async function rollbackAll() {
  console.log('');
  console.log('==================================');
  console.log('   Rolling back all seeders');
  console.log('==================================');
  console.log('');

  const files = getSeederFiles().reverse();

  for (const file of files) {
    const seeder = loadSeeder(file);
    console.log(`Rolling back: ${file}`);

    try {
      await seeder.rollback(pool);
      console.log(`   Rolled back: ${seeder.name || file}`);
    } catch (error) {
      console.error(`   Error rolling back ${file}:`, error.message);
    }
  }

  console.log('');
  console.log('All seeders rolled back!');
  console.log('');
}

// Rollback specific seeder
async function rollbackOne(name) {
  const files = getSeederFiles();
  const file = files.find(f => f.includes(name));

  if (!file) {
    console.error(`Seeder "${name}" not found`);
    process.exit(1);
  }

  console.log(`Rolling back seeder: ${file}`);
  const seeder = loadSeeder(file);
  await seeder.rollback(pool);
  console.log(`Rolled back: ${seeder.name || file}`);
}

// Fresh - rollback all and re-seed
async function fresh() {
  console.log('');
  console.log('==================================');
  console.log('   Fresh Seed (Rollback + Seed)');
  console.log('==================================');
  console.log('');

  await rollbackAll();
  await seedAll();
}

// Show status
async function status() {
  console.log('');
  console.log('==================================');
  console.log('   Seeder Status');
  console.log('==================================');
  console.log('');

  const files = getSeederFiles();
  console.log(`Available seeders: ${files.length}`);
  console.log('');

  // Show counts for each table
  const tables = [
    { name: 'skills', query: 'SELECT COUNT(*) FROM skills' },
    { name: 'companies', query: 'SELECT COUNT(*) FROM companies' },
    { name: 'users', query: 'SELECT COUNT(*) FROM users' },
    { name: 'user_profiles', query: 'SELECT COUNT(*) FROM user_profiles' },
    { name: 'job_postings', query: 'SELECT COUNT(*) FROM job_postings' },
    { name: 'job_skills', query: 'SELECT COUNT(*) FROM job_skills' },
    { name: 'job_applications', query: 'SELECT COUNT(*) FROM job_applications' }
  ];

  console.log('Table row counts:');
  for (const table of tables) {
    try {
      const result = await pool.query(table.query);
      console.log(`  ${table.name}: ${result.rows[0].count} rows`);
    } catch (error) {
      console.log(`  ${table.name}: (table not found)`);
    }
  }

  console.log('');
  console.log('Test accounts:');
  console.log('  Admin: admin@jobmatch.com / admin123');
  console.log('  User:  john.developer@example.com / password123');
  console.log('');
}

// Main execution
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'rollback':
        if (arg) {
          await rollbackOne(arg);
        } else {
          await rollbackAll();
        }
        break;

      case 'fresh':
        await fresh();
        break;

      case 'status':
        await status();
        break;

      case undefined:
      case 'all':
        await seedAll();
        break;

      default:
        // Run specific seeder
        await seedOne(command);
        break;
    }
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
