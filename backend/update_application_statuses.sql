-- Update application statuses and create status history tracking

-- First, drop the old constraint and add new one
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- Add new status constraint
ALTER TABLE job_applications 
ADD CONSTRAINT job_applications_status_check 
CHECK (status IN ('APPLIED', 'SHORT_LISTED', 'REJECTED', 'CALL_FOR_INTERVIEW', 'SHORT_LISTED_BY_COMPANY', 'SELECTED'));

-- Update default status
ALTER TABLE job_applications ALTER COLUMN status SET DEFAULT 'APPLIED';

-- Create application status history table
CREATE TABLE IF NOT EXISTS application_status_history (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES job_applications(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_application_status_history_application_id ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_application_status_history_created_at ON application_status_history(created_at);

-- Migrate existing data
UPDATE job_applications 
SET status = CASE 
    WHEN status = 'applied' THEN 'APPLIED'
    WHEN status = 'reviewed' THEN 'SHORT_LISTED'
    WHEN status = 'interview' THEN 'CALL_FOR_INTERVIEW'
    WHEN status = 'accepted' THEN 'SELECTED'
    WHEN status = 'rejected' THEN 'REJECTED'
    ELSE 'APPLIED'
END;

