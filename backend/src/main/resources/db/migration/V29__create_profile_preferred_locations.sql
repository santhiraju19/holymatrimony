-- ============================================================
-- V29: Multiple preferred locations
-- ============================================================
--
-- Partner Preferences remain completely optional.
--
-- Each profile may have zero or more structured preferred
-- locations.
--
-- Existing scalar preferred_country / preferred_state /
-- preferred_district / preferred_city columns are retained
-- temporarily for backward compatibility.
-- ============================================================

CREATE TABLE IF NOT EXISTS profile_preferred_locations (
    id UUID PRIMARY KEY,
    profile_id UUID NOT NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,

    country VARCHAR(120),
    state VARCHAR(120),
    district VARCHAR(120),
    city VARCHAR(120),

    CONSTRAINT fk_profile_preferred_locations_profile
        FOREIGN KEY (profile_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS
    idx_profile_preferred_locations_profile_id
ON profile_preferred_locations(profile_id);

CREATE INDEX IF NOT EXISTS
    idx_profile_preferred_locations_country
ON profile_preferred_locations(country);

CREATE INDEX IF NOT EXISTS
    idx_profile_preferred_locations_state
ON profile_preferred_locations(state);

CREATE INDEX IF NOT EXISTS
    idx_profile_preferred_locations_city
ON profile_preferred_locations(city);

CREATE UNIQUE INDEX IF NOT EXISTS
    uq_profile_preferred_locations_profile_sort
ON profile_preferred_locations(profile_id, sort_order);


-- ============================================================
-- Backfill existing single preferred locations
-- ============================================================

INSERT INTO profile_preferred_locations (
    id,
    profile_id,
    sort_order,
    country,
    state,
    district,
    city
)
SELECT
    gen_random_uuid(),
    id,
    0,
    preferred_country,
    preferred_state,
    preferred_district,
    preferred_city
FROM profiles
WHERE
       NULLIF(TRIM(preferred_country), '') IS NOT NULL
    OR NULLIF(TRIM(preferred_state), '') IS NOT NULL
    OR NULLIF(TRIM(preferred_district), '') IS NOT NULL
    OR NULLIF(TRIM(preferred_city), '') IS NOT NULL
ON CONFLICT (profile_id, sort_order)
DO NOTHING;
