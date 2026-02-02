-- Add resume_url column to job_applications table

ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS resume_url VARCHAR(500);

-- Add column to track if user used profile resume or uploaded new one
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS resume_source VARCHAR(50) DEFAULT 'profile'
CHECK (resume_source IN ('profile', 'uploaded'));

-- Rollback
-- ALTER TABLE job_applications DROP COLUMN IF EXISTS resume_url;
-- ALTER TABLE job_applications DROP COLUMN IF EXISTS resume_source;
