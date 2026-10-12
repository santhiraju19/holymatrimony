package com.theholymatrimony.backend.admin.access;

/**
 * Granular permissions available to SUB_ADMIN accounts.
 *
 * SUPER_ADMIN accounts implicitly have every permission
 * and do not require rows in admin_user_permissions.
 */
public enum AdminPermission {

    DASHBOARD_VIEW,

    ANALYTICS_VIEW,

    USERS_MANAGE,

    PROFILES_MANAGE,

    VERIFICATIONS_MANAGE,

    MEMBERSHIPS_VIEW,

    PAYMENTS_VIEW,

    REPORTS_MANAGE
}
