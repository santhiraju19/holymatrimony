/*
 * ============================================================
 * V41 - Admin Access Control
 * ============================================================
 *
 * Adds support for:
 *
 *   SUPER_ADMIN
 *   SUB_ADMIN
 *
 * Existing ROLE_ADMIN accounts are promoted to SUPER_ADMIN.
 *
 * Normal ROLE_USER accounts remain unchanged and have no
 * administrative access level.
 *
 * Sub-admin permissions are stored separately so access can
 * be granted and revoked without changing the existing role
 * model.
 */

/*
 * ------------------------------------------------------------
 * ADMIN ACCESS LEVEL
 * ------------------------------------------------------------
 */

ALTER TABLE users
ADD COLUMN IF NOT EXISTS admin_access_level VARCHAR(30);

/*
 * Preserve all existing administrator access.
 *
 * Every administrator that existed before this migration is
 * treated as a SUPER_ADMIN.
 */
UPDATE users
SET admin_access_level = 'SUPER_ADMIN'
WHERE role = 'ROLE_ADMIN'
  AND admin_access_level IS NULL;

/*
 * Normal members must never carry an administrative
 * access level.
 */
UPDATE users
SET admin_access_level = NULL
WHERE role <> 'ROLE_ADMIN';


/*
 * ------------------------------------------------------------
 * ADMIN PERMISSIONS
 * ------------------------------------------------------------
 */

CREATE TABLE IF NOT EXISTS admin_user_permissions (
    user_id UUID NOT NULL,
    permission VARCHAR(80) NOT NULL,

    CONSTRAINT fk_admin_user_permissions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_admin_user_permissions
        UNIQUE (user_id, permission)
);


/*
 * ------------------------------------------------------------
 * LOOKUP INDEXES
 * ------------------------------------------------------------
 */

CREATE INDEX IF NOT EXISTS idx_users_admin_access_level
ON users(admin_access_level);

CREATE INDEX IF NOT EXISTS idx_admin_user_permissions_user
ON admin_user_permissions(user_id);

CREATE INDEX IF NOT EXISTS idx_admin_user_permissions_permission
ON admin_user_permissions(permission);


/*
 * ------------------------------------------------------------
 * DATA INTEGRITY
 * ------------------------------------------------------------
 */

ALTER TABLE users
DROP CONSTRAINT IF EXISTS chk_users_admin_access_level;

ALTER TABLE users
ADD CONSTRAINT chk_users_admin_access_level
CHECK (
    admin_access_level IS NULL
    OR admin_access_level IN (
        'SUPER_ADMIN',
        'SUB_ADMIN'
    )
);

ALTER TABLE users
DROP CONSTRAINT IF EXISTS chk_users_admin_role_access;

ALTER TABLE users
ADD CONSTRAINT chk_users_admin_role_access
CHECK (
    (
        role = 'ROLE_ADMIN'
        AND admin_access_level IN (
            'SUPER_ADMIN',
            'SUB_ADMIN'
        )
    )
    OR
    (
        role <> 'ROLE_ADMIN'
        AND admin_access_level IS NULL
    )
);
