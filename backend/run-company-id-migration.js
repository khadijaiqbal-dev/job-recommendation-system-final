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
    console.log("🔄 Running company_id migration...");

    // Read the SQL file
    const sqlFile = path.join(__dirname, "add_company_id_column.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Execute the SQL
    await pool.query(sql);

    console.log("✅ company_id column added successfully!");
    console.log("   - company_id column added to job_postings");
    console.log("   - Foreign key constraint added");
    console.log("   - Index created");
    console.log("   - Existing records updated where possible");
  } catch (error) {
    console.error("❌ Error running migration:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();
