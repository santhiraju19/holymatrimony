ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30);

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP;

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMP;

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS verification_reviewed_by UUID;

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS verification_reason VARCHAR(1000);

UPDATE profiles
SET verification_status = 'NOT_SUBMITTED'
WHERE verification_status IS NULL;

ALTER TABLE profiles
    ALTER COLUMN verification_status SET DEFAULT 'NOT_SUBMITTED';

ALTER TABLE profiles
    ALTER COLUMN verification_status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_verification_status
    ON profiles (verification_status);

CREATE INDEX IF NOT EXISTS idx_profiles_verification_submitted_at
    ON profiles (verification_submitted_at);