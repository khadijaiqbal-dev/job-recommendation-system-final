const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const MIGRATIONS_DIR = __dirname;

async function ensureMigrationsTable() {
  const migrationTableSQL = fs.readFileSync(
    path.join(MIGRATIONS_DIR, '001_create_migrations_table.sql'),
    'utf8'
  );
  await pool.query(migrationTableSQL);
}

async function getAppliedMigrations() {
  const result = await pool.query('SELECT name FROM migrations ORDER BY name');
  return result.rows.map(row => row.name);
}

async function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql') && file !== '001_create_migrations_table.sql')
    .sort();
  return files;
}

async function runMigration(filename) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query(
      'INSERT INTO migrations (name) VALUES ($1)',
      [filename]
    );
    await client.query('COMMIT');
    console.log(`✓ Applied migration: ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function migrate() {
  console.log('Starting migrations...\n');

  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();
    console.log('✓ Migrations table ready\n');

    // Get applied and pending migrations
    const applied = await getAppliedMigrations();
    const allMigrations = await getMigrationFiles();
    const pending = allMigrations.filter(m => !applied.includes(m));

    if (pending.length === 0) {
      console.log('No pending migrations. Database is up to date.\n');
      return;
    }

    console.log(`Found ${pending.length} pending migration(s):\n`);

    // Run each pending migration
    for (const migration of pending) {
      await runMigration(migration);
    }

    console.log('\n✓ All migrations applied successfully!\n');
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function rollback(steps = 1) {
  console.log(`Rolling back ${steps} migration(s)...\n`);

  try {
    await ensureMigrationsTable();

    const result = await pool.query(
      'SELECT name FROM migrations ORDER BY applied_at DESC LIMIT $1',
      [steps]
    );

    if (result.rows.length === 0) {
      console.log('No migrations to rollback.\n');
      return;
    }

    for (const row of result.rows) {
      await pool.query('DELETE FROM migrations WHERE name = $1', [row.name]);
      console.log(`✓ Rolled back: ${row.name}`);
    }

    console.log('\n✓ Rollback complete. Run migrations again to re-apply.\n');
    console.log('Note: Table changes are NOT automatically reverted.');
    console.log('You may need to manually drop/alter tables if needed.\n');
  } catch (error) {
    console.error('\n✗ Rollback failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function status() {
  console.log('Migration Status:\n');

  try {
    await ensureMigrationsTable();

    const applied = await getAppliedMigrations();
    const allMigrations = await getMigrationFiles();

    console.log('Applied migrations:');
    if (applied.length === 0) {
      console.log('  (none)\n');
    } else {
      applied.forEach(m => console.log(`  ✓ ${m}`));
      console.log();
    }

    const pending = allMigrations.filter(m => !applied.includes(m));
    console.log('Pending migrations:');
    if (pending.length === 0) {
      console.log('  (none)\n');
    } else {
      pending.forEach(m => console.log(`  ○ ${m}`));
      console.log();
    }
  } catch (error) {
    console.error('Error checking status:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function fresh() {
  console.log('WARNING: This will drop ALL tables and re-run migrations!\n');

  try {
    // Get all table names
    const result = await pool.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
    `);

    if (result.rows.length > 0) {
      console.log('Dropping all tables...');

      // Drop all tables with CASCADE
      for (const row of result.rows) {
        await pool.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
        console.log(`  ✓ Dropped: ${row.tablename}`);
      }
      console.log();
    }

    // Run all migrations
    await pool.end();

    // Create new pool for migrations
    const newPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Replace the pool reference for migrate function
    Object.assign(pool, newPool);

  } catch (error) {
    console.error('Error during fresh migration:', error.message);
    process.exit(1);
  }

  // Now run migrations with a fresh start
  await migrate();
}

// CLI handling
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'up':
  case 'migrate':
  case undefined:
    migrate();
    break;
  case 'rollback':
    rollback(parseInt(arg) || 1);
    break;
  case 'status':
    status();
    break;
  case 'fresh':
    fresh();
    break;
  default:
    console.log(`
Job Recommendation System - Database Migration Tool

Usage:
  node migrate.js [command]

Commands:
  up, migrate    Run all pending migrations (default)
  rollback [n]   Rollback n migrations (default: 1)
  status         Show migration status
  fresh          Drop all tables and re-run migrations

Examples:
  node migrate.js              # Run pending migrations
  node migrate.js up           # Run pending migrations
  node migrate.js rollback     # Rollback last migration
  node migrate.js rollback 3   # Rollback last 3 migrations
  node migrate.js status       # Show status
  node migrate.js fresh        # Fresh install (drops all tables)
`);
}
