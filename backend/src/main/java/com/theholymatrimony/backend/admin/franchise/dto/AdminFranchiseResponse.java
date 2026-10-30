package com.theholymatrimony.backend.admin.franchise.dto;

import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.franchise.enums.FranchiseStaffRole;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;
import com.theholymatrimony.backend.franchise.enums.FranchiseUserStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * HQ representation of a provisioned District Franchise.
 *
 * Geographic values are derived from the persisted district
 * allocation rather than from client-supplied state scope.
 */
public record AdminFranchiseResponse(

        UUID franchiseId,
        String franchiseCode,
        String franchiseName,
        FranchiseStatus franchiseStatus,

        UUID allocationId,

        UUID stateId,
        Integer stateLgdCode,
        String stateName,

        UUID districtId,
        Integer districtLgdCode,
        String districtName,

        UUID ownerUserId,
        String ownerFullName,
        String ownerEmail,
        String ownerMobile,
        UserStatus ownerAccountStatus,

        UUID franchiseUserId,
        FranchiseStaffRole ownerStaffRole,
        FranchiseUserStatus franchiseUserStatus,

        LocalDateTime allocatedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}
