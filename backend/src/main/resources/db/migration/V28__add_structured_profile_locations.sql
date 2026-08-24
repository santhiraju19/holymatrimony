-- ============================================================
-- V28: Structured profile locations
-- ============================================================
--
-- Adds structured district / church / family / preference
-- location columns required by the Profile entity.
--
-- Important:
-- - District does NOT become an additional profile-completion
--   requirement.
-- - Church information remains optional.
-- - Partner Preferences remain optional.
-- - Existing city/state/country and preferred country/state/city
--   columns are preserved.
-- ============================================================


-- ============================================================
-- Current Location
-- ============================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS district VARCHAR(120);


-- ============================================================
-- Church Location
-- Church Information remains optional.
-- ============================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS church_country VARCHAR(120);

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS church_state VARCHAR(120);

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS church_district VARCHAR(120);

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS church_city VARCHAR(120);


-- ============================================================
-- Family Location
-- ============================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS family_country VARCHAR(120);

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS family_state VARCHAR(120);

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS family_district VARCHAR(120);

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS family_city VARCHAR(120);


-- ============================================================
-- Partner Preference Location
-- preferred_country / preferred_state / preferred_city
-- already exist from an earlier migration.
-- ============================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS preferred_district VARCHAR(120);
