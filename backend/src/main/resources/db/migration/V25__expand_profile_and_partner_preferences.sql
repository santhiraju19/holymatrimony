-- =========================================================
-- Personal information
-- =========================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS height_cm INTEGER,
    ADD COLUMN IF NOT EXISTS weight_kg INTEGER,
    ADD COLUMN IF NOT EXISTS complexion VARCHAR(50),
    ADD COLUMN IF NOT EXISTS body_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS mother_tongue VARCHAR(80),
    ADD COLUMN IF NOT EXISTS religion VARCHAR(80),
    ADD COLUMN IF NOT EXISTS community VARCHAR(120),
    ADD COLUMN IF NOT EXISTS sub_community VARCHAR(120),
    ADD COLUMN IF NOT EXISTS faith_background VARCHAR(80),
    ADD COLUMN IF NOT EXISTS physical_status VARCHAR(80),
    ADD COLUMN IF NOT EXISTS diet VARCHAR(50),
    ADD COLUMN IF NOT EXISTS smoking VARCHAR(30),
    ADD COLUMN IF NOT EXISTS drinking VARCHAR(30);

-- =========================================================
-- Education
-- =========================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS education_field VARCHAR(120);

-- =========================================================
-- Family
-- =========================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS family_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS family_values VARCHAR(50);

-- =========================================================
-- Partner preferences
-- =========================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS preferred_height_from_cm INTEGER,
    ADD COLUMN IF NOT EXISTS preferred_height_to_cm INTEGER,
    ADD COLUMN IF NOT EXISTS preferred_religion VARCHAR(80),
    ADD COLUMN IF NOT EXISTS preferred_marital_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS preferred_community VARCHAR(120),
    ADD COLUMN IF NOT EXISTS community_no_bar BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS preferred_mother_tongue VARCHAR(80),
    ADD COLUMN IF NOT EXISTS preferred_profession VARCHAR(120),
    ADD COLUMN IF NOT EXISTS preferred_country VARCHAR(120),
    ADD COLUMN IF NOT EXISTS preferred_state VARCHAR(120),
    ADD COLUMN IF NOT EXISTS preferred_city VARCHAR(120),
    ADD COLUMN IF NOT EXISTS preferred_diet VARCHAR(50),
    ADD COLUMN IF NOT EXISTS preferred_smoking VARCHAR(30),
    ADD COLUMN IF NOT EXISTS preferred_drinking VARCHAR(30),
    ADD COLUMN IF NOT EXISTS preferred_faith_commitment VARCHAR(80);
