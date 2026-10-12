package com.theholymatrimony.backend.admin.access;

import com.theholymatrimony.backend.auth.entity.User;

/**
 * Central authorization service for administrative access.
 *
 * Permission decisions are database-authoritative so changes to
 * a sub-admin's access take effect without waiting for JWT expiry.
 */
public interface AdminAccessService {

    /**
     * Requires the authenticated account to be an active administrator.
     */
    User requireAdmin(String email);

    /**
     * Requires the authenticated account to be a SUPER_ADMIN.
     */
    User requireSuperAdmin(String email);

    /**
     * Requires the administrator to have the requested permission.
     *
     * SUPER_ADMIN accounts implicitly pass every permission check.
     * SUB_ADMIN accounts must have the permission assigned in the database.
     */
    User requirePermission(
            String email,
            AdminPermission permission
    );

    /**
     * Returns whether the administrator currently has the requested
     * permission according to the database.
     */
    boolean hasPermission(
            String email,
            AdminPermission permission
    );

    /**
     * Returns the administrator's currently effective permissions.
     *
     * SUPER_ADMIN accounts implicitly receive every permission.
     * SUB_ADMIN accounts receive only permissions assigned in the database.
     */
    java.util.Set<AdminPermission> getEffectivePermissions(
            String email
    );
}
