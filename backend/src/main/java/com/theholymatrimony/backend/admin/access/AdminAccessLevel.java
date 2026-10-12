package com.theholymatrimony.backend.admin.access;

/**
 * Administrative access level for ROLE_ADMIN accounts.
 *
 * SUPER_ADMIN:
 *     Full administrative access, including management
 *     of sub-admin accounts and their permissions.
 *
 * SUB_ADMIN:
 *     Administrative access limited to explicitly
 *     assigned permissions.
 */
public enum AdminAccessLevel {

    SUPER_ADMIN,

    SUB_ADMIN
}
