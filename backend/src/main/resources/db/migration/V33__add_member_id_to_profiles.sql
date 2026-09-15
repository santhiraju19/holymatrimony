-- ============================================================
-- Holy Matrimony
-- V33 - Permanent Membership ID
-- ============================================================
--
-- Every profile receives a permanent public-facing identifier:
--
--     HM-000001
--     HM-000002
--
-- Membership ID is:
--   - independent of paid membership/subscription
--   - unique and permanent
--   - safe for members to share
--   - searchable without exposing email/mobile
--
-- Existing profiles receive IDs in profile creation order.
-- PostgreSQL allocates IDs for all future profiles.
-- ============================================================


-- ============================================================
-- 1. Sequence for future Membership IDs
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS profile_member_id_seq
    AS BIGINT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE;


-- ============================================================
-- 2. Add Membership ID column
-- ============================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS member_id VARCHAR(20);


-- ============================================================
-- 3. Backfill existing profiles
--
-- Oldest profile receives the lowest Membership ID.
-- UUID is used only as a deterministic tie-breaker.
-- ============================================================

WITH ordered_profiles AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            ORDER BY created_at ASC, id ASC
        ) AS member_number
    FROM profiles
    WHERE member_id IS NULL
       OR BTRIM(member_id) = ''
)
UPDATE profiles p
SET member_id =
        'HM-' ||
        LPAD(
            ordered_profiles.member_number::TEXT,
            6,
            '0'
        )
FROM ordered_profiles
WHERE p.id = ordered_profiles.id;


-- ============================================================
-- 4. Advance sequence beyond all backfilled IDs
--
-- If 27 profiles exist, the next sequence value becomes 28.
-- ============================================================

SELECT setval(
    'profile_member_id_seq',
    COALESCE(
        (
            SELECT MAX(
                SUBSTRING(member_id FROM 4)::BIGINT
            )
            FROM profiles
            WHERE member_id ~ '^HM-[0-9]+$'
        ),
        0
    ) + 1,
    false
);


-- ============================================================
-- 5. Database default for all future profiles
--
-- Database allocation prevents duplicate IDs during concurrent
-- registrations/profile creation.
-- ============================================================

ALTER TABLE profiles
    ALTER COLUMN member_id
    SET DEFAULT (
        'HM-' ||
        LPAD(
            nextval('profile_member_id_seq')::TEXT,
            6,
            '0'
        )
    );


-- ============================================================
-- 6. Membership ID is mandatory
-- ============================================================

ALTER TABLE profiles
    ALTER COLUMN member_id SET NOT NULL;


-- ============================================================
-- 7. Unique Membership ID
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS ux_profiles_member_id
    ON profiles(member_id);


-- ============================================================
-- 8. Valid Membership ID format
--
-- Six digits minimum. Additional digits are automatically
-- supported if the platform eventually exceeds 999,999 profiles.
-- ============================================================

ALTER TABLE profiles
    DROP CONSTRAINT IF EXISTS chk_profiles_member_id_format;

ALTER TABLE profiles
    ADD CONSTRAINT chk_profiles_member_id_format
    CHECK (member_id ~ '^HM-[0-9]{6,}$');
