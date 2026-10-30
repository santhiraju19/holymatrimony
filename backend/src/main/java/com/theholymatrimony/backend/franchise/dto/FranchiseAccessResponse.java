package com.theholymatrimony.backend.franchise.dto;

import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.franchise.enums.FranchiseStaffRole;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;

import java.util.Set;
import java.util.UUID;

/**
 * Current authenticated franchise-user context.
 *
 * Geographic scope is derived server-side from the authenticated
 * franchise membership and its active district allocation.
 */
public record FranchiseAccessResponse(
        UUID userId,
        String fullName,
        String email,

        UUID franchiseUserId,
        FranchiseStaffRole staffRole,

        UUID franchiseId,
        String franchiseCode,
        String franchiseName,
        FranchiseStatus franchiseStatus,

        UUID stateId,
        Integer stateLgdCode,
        String stateName,

        UUID districtId,
        Integer districtLgdCode,
        String districtName,

        Set<FranchisePermission> permissions
) {
}
