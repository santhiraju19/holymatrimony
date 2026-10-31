package com.theholymatrimony.backend.franchise.dto;

import com.theholymatrimony.backend.franchise.enums.FranchiseTerritoryType;

import java.util.UUID;

/**
 * Franchise-facing representation of an active territory in the
 * authenticated user's current district allocation.
 *
 * Geographic scope is always derived server-side.
 */
public record FranchiseTerritoryResponse(
        UUID territoryId,
        String territoryCode,
        String name,
        FranchiseTerritoryType territoryType,
        String coverageDescription
) {
}
