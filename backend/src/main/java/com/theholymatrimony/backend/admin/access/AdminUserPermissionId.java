package com.theholymatrimony.backend.admin.access;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

/**
 * Composite identifier for an assigned sub-admin permission.
 *
 * The database key is the natural pair:
 *
 *     user_id + permission
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class AdminUserPermissionId
        implements Serializable {

    private UUID userId;

    private AdminPermission permission;
}
