-- Add company_id column to job_postings table if it doesn't exist
-- This migration adds the company_id column and updates existing records

-- Add company_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'job_postings' 
        AND column_name = 'company_id'
    ) THEN
        ALTER TABLE job_postings ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE;
        
        -- Create index for company_id
        CREATE INDEX IF NOT EXISTS idx_job_postings_company_id ON job_postings(company_id);
        
        -- Try to match existing company_name values to companies and set company_id
        -- This is optional - if companies don't match, company_id will remain NULL
        UPDATE job_postings jp
        SET company_id = c.id
        FROM companies c
        WHERE jp.company_name = c.name
        AND jp.company_id IS NULL;
    END IF;
END $$;

