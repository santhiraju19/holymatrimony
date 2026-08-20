ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS boost_started_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_profiles_boost_expires_at
    ON profiles (boost_expires_at);
