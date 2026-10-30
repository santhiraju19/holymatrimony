/*
 * ============================================================
 * V43 - Franchise Access Control
 * ============================================================
 *
 * Establishes the authentication and authorization foundation
 * for District Franchise users.
 *
 * Security model:
 *
 *   users.role = ROLE_FRANCHISE
 *       |
 *       v
 *   franchise_users
 *       |
 *       +----> franchises
 *       |
 *       +----> franchise_user_permissions
 *
 * Geographic authorization is intentionally NOT stored here.
 *
 * Franchise scope is derived server-side:
 *
 *   authenticated user
 *       -> active franchise membership
 *       -> franchise
 *       -> active district allocation
 *       -> allowed territories
 *
 * This prevents clients from selecting or expanding their own
 * district/territory authorization scope.
 *
 * Franchise permissions are database-authoritative so grants
 * and revocations can take effect independently of JWT expiry.
 *
 * FRANCHISE_OWNER receives all franchise permissions
 * implicitly in application authorization logic and therefore
 * does not require rows in franchise_user_permissions.
 */


/*
 * ------------------------------------------------------------
 * PLATFORM ROLE
 * ------------------------------------------------------------
 *
 * Existing users.role is VARCHAR-based, so no PostgreSQL enum
 * alteration is required. ROLE_FRANCHISE becomes a valid
 * application-level Role value once the Java Role enum is
 * updated.
 *
 * Existing admin constraints already require non-ROLE_ADMIN
 * users to keep admin_access_level NULL.
 */


/*
 * ------------------------------------------------------------
 * FRANCHISE USERS
 * ------------------------------------------------------------
 *
 * Membership/history table connecting an authenticated user
 * account to a District Franchise.
 *
 * Historical memberships are retained.
 *
 * A user may have many historical membership rows but only one
 * ACTIVE franchise membership at a time.
 *
 * A franchise may have multiple active users.
 */

CREATE TABLE franchise_users (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    franchise_id UUID NOT NULL,

    user_id UUID NOT NULL,

    staff_role VARCHAR(40) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    deactivated_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_franchise_users_franchise
        FOREIGN KEY (franchise_id)
        REFERENCES franchises(id),

    CONSTRAINT fk_franchise_users_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_franchise_users_staff_role
        CHECK (
            staff_role IN (
                'FRANCHISE_OWNER',
                'FRANCHISE_MANAGER',
                'RELATIONSHIP_MANAGER',
                'SALES_EXECUTIVE',
                'ACCOUNTANT'
            )
        ),

    CONSTRAINT chk_franchise_users_status
        CHECK (
            status IN (
                'ACTIVE',
                'DEACTIVATED'
            )
        ),

    CONSTRAINT chk_franchise_users_dates
        CHECK (
            deactivated_at IS NULL
            OR deactivated_at >= joined_at
        ),

    /*
     * ACTIVE membership:
     *     deactivated_at must be NULL.
     *
     * DEACTIVATED membership:
     *     deactivated_at must be populated.
     */
    CONSTRAINT chk_franchise_users_status_dates
        CHECK (
            (
                status = 'ACTIVE'
                AND deactivated_at IS NULL
            )
            OR
            (
                status = 'DEACTIVATED'
                AND deactivated_at IS NOT NULL
            )
        )
);


/*
 * A user cannot simultaneously belong to more than one
 * District Franchise.
 */

CREATE UNIQUE INDEX uq_active_franchise_membership_per_user
    ON franchise_users(user_id)
    WHERE status = 'ACTIVE';


/*
 * A District Franchise has exactly one active owner once an
 * owner is provisioned.
 *
 * The database can enforce "at most one"; application
 * provisioning/lifecycle logic will ensure an operational
 * franchise is not left without an owner.
 */

CREATE UNIQUE INDEX uq_active_owner_per_franchise
    ON franchise_users(franchise_id)
    WHERE status = 'ACTIVE'
      AND staff_role = 'FRANCHISE_OWNER';


/*
 * Prevent duplicate simultaneously-active membership records
 * for the same user/franchise pair explicitly as well.
 *
 * This is partially redundant with the global active-user
 * uniqueness above, but documents and protects the membership
 * invariant directly.
 */

CREATE UNIQUE INDEX uq_active_franchise_user
    ON franchise_users(franchise_id, user_id)
    WHERE status = 'ACTIVE';


/*
 * Common membership lookups.
 */

CREATE INDEX idx_franchise_users_franchise
    ON franchise_users(franchise_id);

CREATE INDEX idx_franchise_users_user
    ON franchise_users(user_id);

CREATE INDEX idx_franchise_users_staff_role
    ON franchise_users(staff_role);

CREATE INDEX idx_franchise_users_status
    ON franchise_users(status);


/*
 * ------------------------------------------------------------
 * FRANCHISE USER PERMISSIONS
 * ------------------------------------------------------------
 *
 * Explicit permissions for non-owner franchise staff.
 *
 * FRANCHISE_OWNER is intentionally handled as an implicit
 * all-permissions role in application authorization logic.
 */

CREATE TABLE franchise_user_permissions (

    franchise_user_id UUID NOT NULL,

    permission VARCHAR(80) NOT NULL,

    CONSTRAINT fk_franchise_user_permissions_membership
        FOREIGN KEY (franchise_user_id)
        REFERENCES franchise_users(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_franchise_user_permissions
        UNIQUE (franchise_user_id, permission),

    CONSTRAINT chk_franchise_user_permission
        CHECK (
            permission IN (
                'DASHBOARD_VIEW',
                'MEMBERS_VIEW',
                'MEMBERS_MANAGE',
                'LEADS_VIEW',
                'LEADS_MANAGE',
                'TERRITORIES_VIEW',
                'TERRITORIES_MANAGE',
                'PAYMENTS_VIEW',
                'COMMISSIONS_VIEW',
                'REPORTS_VIEW',
                'ANALYTICS_VIEW',
                'STAFF_MANAGE'
            )
        )
);


/*
 * Permission lookup indexes.
 */

CREATE INDEX idx_franchise_user_permissions_membership
    ON franchise_user_permissions(franchise_user_id);

CREATE INDEX idx_franchise_user_permissions_permission
    ON franchise_user_permissions(permission);


/*
 * ------------------------------------------------------------
 * USER ROLE INTEGRITY
 * ------------------------------------------------------------
 *
 * A franchise membership must correspond to a user whose
 * platform role is ROLE_FRANCHISE.
 *
 * A normal PostgreSQL CHECK constraint cannot safely enforce a
 * value in another table, so cross-table enforcement belongs
 * in application provisioning/authorization logic.
 *
 * The existing users.admin_access_level constraints already
 * guarantee ROLE_FRANCHISE accounts cannot carry admin access
 * levels because only ROLE_ADMIN may have one.
 *
 * Public registration continues to provision ROLE_USER only.
 */
