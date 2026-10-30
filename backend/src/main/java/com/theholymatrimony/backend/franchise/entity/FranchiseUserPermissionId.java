package com.theholymatrimony.backend.franchise.entity;

import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

/**
 * Composite identifier for a franchise-user permission.
 *
 * Natural database identity:
 *
 *     franchise_user_id + permission
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class FranchiseUserPermissionId
        implements Serializable {

    private UUID franchiseUserId;

    private FranchisePermission permission;
}
