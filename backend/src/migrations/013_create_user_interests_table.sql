-- Create user_interests table for AI learning from user behavior

CREATE TABLE IF NOT EXISTS user_interests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    -- Interest vectors learned from behavior
    skill_interests JSONB DEFAULT '{}',        -- {"React": 0.8, "Python": 0.6}
    industry_interests JSONB DEFAULT '{}',     -- {"Technology": 0.9, "Finance": 0.3}
    job_type_interests JSONB DEFAULT '{}',     -- {"full_time": 0.8, "remote": 0.9}
    location_interests JSONB DEFAULT '{}',     -- {"San Francisco": 0.7, "Remote": 0.9}
    salary_preference_min INTEGER,
    salary_preference_max INTEGER,
    experience_level_interests JSONB DEFAULT '{}', -- {"senior": 0.6, "mid": 0.8}

    -- Tracking
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_interactions INTEGER DEFAULT 0,

    UNIQUE(user_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_last_updated ON user_interests(last_updated);

-- Rollback
-- DROP TABLE IF EXISTS user_interests;
