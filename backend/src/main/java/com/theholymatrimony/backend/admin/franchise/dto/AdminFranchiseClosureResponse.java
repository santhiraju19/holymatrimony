package com.theholymatrimony.backend.admin.franchise.dto;

import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * HQ result of an atomic District Franchise closure.
 */
public record AdminFranchiseClosureResponse(

        UUID franchiseId,

        String franchiseCode,

        String franchiseName,

        FranchiseStatus previousStatus,

        FranchiseStatus status,

        LocalDateTime terminatedAt,

        UUID districtAllocationId,

        UUID districtId,

        String districtName,

        LocalDateTime allocationEndedAt,

        int deactivatedTerritoryCount,

        int deactivatedMembershipCount,

        UUID lifecycleEventId,

        String reason,

        UUID performedByUserId,

        LocalDateTime occurredAt

) {
}
