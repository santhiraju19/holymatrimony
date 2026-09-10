-- ============================================================
-- Holy Matrimony
-- Browse / Search profile visibility
--
-- profile_completed:
--   Full/core profile completion.
--
-- profile_live:
--   Minimum Basic + Personal Information has been completed and
--   the member is eligible for Browse/Search visibility.
--
-- A profile photo is NOT required.
--
-- Church details other than denomination, education, family,
-- partner preferences, lifestyle fields and trust verification
-- are NOT required for profile_live.
-- ============================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS profile_live BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- Existing member backfill
--
-- Keep all previously completed profiles live.
--
-- Also immediately activate existing incomplete profiles that
-- already satisfy the new minimum visibility requirements.
-- ============================================================

UPDATE profiles
SET profile_live = TRUE
WHERE profile_completed = TRUE
   OR (
        mobile IS NOT NULL
        AND TRIM(mobile) <> ''

        AND date_of_birth IS NOT NULL

        AND gender IS NOT NULL
        AND TRIM(gender) <> ''

        AND marital_status IS NOT NULL
        AND TRIM(marital_status) <> ''

        AND height_cm IS NOT NULL

        AND mother_tongue IS NOT NULL
        AND TRIM(mother_tongue) <> ''

        AND religion IS NOT NULL
        AND TRIM(religion) <> ''

        AND denomination IS NOT NULL
        AND TRIM(denomination) <> ''
   );
