const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  try {
    console.log("🔄 Running application status migration...");

    // Read the SQL file
    const sqlFile = path.join(__dirname, "update_application_statuses.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Execute the SQL
    await pool.query(sql);

    console.log("✅ Application status migration completed successfully!");
    console.log("   - Updated status enum");
    console.log("   - Created application_status_history table");
    console.log("   - Migrated existing data");
    console.log("   - Created indexes");
  } catch (error) {
    console.error("❌ Error running migration:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();
