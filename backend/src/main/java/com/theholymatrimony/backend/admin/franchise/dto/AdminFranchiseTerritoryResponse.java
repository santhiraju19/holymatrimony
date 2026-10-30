package com.theholymatrimony.backend.admin.franchise.dto;

import com.theholymatrimony.backend.franchise.enums.FranchiseTerritoryType;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * HQ representation of a territory allocated under a District Franchise.
 *
 * Franchise and geographic scope are derived from the persisted active
 * district allocation rather than from client-supplied scope identifiers.
 */
public record AdminFranchiseTerritoryResponse(

        UUID territoryId,

        String territoryCode,
        String name,
        FranchiseTerritoryType territoryType,
        String coverageDescription,
        Boolean active,

        UUID franchiseId,
        String franchiseCode,
        String franchiseName,

        UUID allocationId,

        UUID stateId,
        Integer stateLgdCode,
        String stateName,

        UUID districtId,
        Integer districtLgdCode,
        String districtName,

        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}
