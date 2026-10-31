-- ============================================================
-- V45 — Canonical district relationship for member profiles
-- ============================================================
--
-- Purpose:
--   Establish a durable geographic authorization key between
--   member profiles and the canonical geo_districts table.
--
-- Existing profile country/state/district/city text fields are
-- intentionally retained for display and backward compatibility.
--
-- Franchise authorization must use district_id rather than
-- trusting or comparing free-text profile location values.
--
-- district_id remains nullable because:
--   - existing profiles may not yet contain district information;
--   - non-India / incomplete locations may not map to the current
--     canonical India geography model;
--   - an unmapped profile must not be guessed into a district.
--
-- Backfill policy:
--   Only profiles with an unambiguous active canonical
--   state + district match are assigned district_id.
-- ============================================================


-- ============================================================
-- 1. Add nullable canonical district reference
-- ============================================================

ALTER TABLE profiles
    ADD COLUMN district_id UUID;


-- ============================================================
-- 2. Backfill safely from existing profile location text
--
-- State is included in the match because district names are not
-- globally unique across India.
--
-- The grouped canonical_matches CTE guarantees that a profile is
-- backfilled only when exactly one active canonical district
-- matches its normalized state + district names.
-- ============================================================

WITH canonical_matches AS (
    SELECT
        LOWER(BTRIM(gs.name)) AS normalized_state_name,
        LOWER(BTRIM(gd.name)) AS normalized_district_name,
        MIN(gd.id::text)::uuid AS district_id,
        COUNT(*) AS match_count
    FROM geo_states gs
    JOIN geo_districts gd
        ON gd.state_id = gs.id
    WHERE gs.active = TRUE
      AND gd.active = TRUE
    GROUP BY
        LOWER(BTRIM(gs.name)),
        LOWER(BTRIM(gd.name))
),
unambiguous_matches AS (
    SELECT
        normalized_state_name,
        normalized_district_name,
        district_id
    FROM canonical_matches
    WHERE match_count = 1
)
UPDATE profiles p
SET district_id = match.district_id
FROM unambiguous_matches match
WHERE p.district_id IS NULL
  AND UPPER(BTRIM(COALESCE(p.country, ''))) = 'INDIA'
  AND NULLIF(BTRIM(p.state), '') IS NOT NULL
  AND NULLIF(BTRIM(p.district), '') IS NOT NULL
  AND LOWER(BTRIM(p.state)) =
      match.normalized_state_name
  AND LOWER(BTRIM(p.district)) =
      match.normalized_district_name;


-- ============================================================
-- 3. Enforce canonical referential integrity
-- ============================================================

ALTER TABLE profiles
    ADD CONSTRAINT fk_profiles_district
    FOREIGN KEY (district_id)
    REFERENCES geo_districts(id)
    ON DELETE RESTRICT;


-- ============================================================
-- 4. Index franchise member-scope lookups
-- ============================================================

CREATE INDEX idx_profiles_district_id
    ON profiles(district_id);
