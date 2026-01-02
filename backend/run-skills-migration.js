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
    console.log("🔄 Running skills migration...");

    // Read the SQL file
    const sqlFile = path.join(__dirname, "create_skills_tables.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Execute the SQL
    await pool.query(sql);

    console.log("✅ Skills tables created successfully!");
    console.log("   - skills table");
    console.log("   - job_skills junction table");
    console.log("   - Indexes created");
  } catch (error) {
    console.error("❌ Error running migration:", error.message);
    if (error.code === "42P07") {
      console.log("ℹ️  Tables already exist, skipping...");
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();
