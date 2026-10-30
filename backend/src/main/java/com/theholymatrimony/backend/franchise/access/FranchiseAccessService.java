package com.theholymatrimony.backend.franchise.access;

import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.FranchiseTerritory;
import com.theholymatrimony.backend.franchise.entity.FranchiseUser;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Central database-authoritative authorization service for franchise access.
 *
 * Authentication establishes identity and the platform ROLE_FRANCHISE role.
 * This service then derives the user's current franchise membership,
 * operational district scope, territory scope, and effective permissions
 * from the database.
 *
 * Client-supplied franchise, district, or territory identifiers must never
 * be trusted as authorization scope.
 */
public interface FranchiseAccessService {

    /**
     * Requires an active ROLE_FRANCHISE account with an ACTIVE franchise
     * membership whose franchise itself is operationally ACTIVE.
     */
    FranchiseUser requireFranchiseUser(
            String email
    );

    /**
     * Requires the current franchise to have an active district allocation.
     *
     * The district is derived from the authenticated user's franchise;
     * callers do not choose the franchise or district authorization scope.
     */
    FranchiseDistrictAllocation requireActiveDistrictAllocation(
            String email
    );

    /**
     * Requires the franchise user to have the requested permission.
     *
     * FRANCHISE_OWNER implicitly has every franchise permission.
     * Other staff roles require an explicit database permission row.
     */
    FranchiseUser requirePermission(
            String email,
            FranchisePermission permission
    );

    /**
     * Returns whether the current franchise user has the requested
     * database-authoritative permission.
     */
    boolean hasPermission(
            String email,
            FranchisePermission permission
    );

    /**
     * Returns the currently effective franchise permissions.
     *
     * FRANCHISE_OWNER receives all permissions implicitly.
     */
    Set<FranchisePermission> getEffectivePermissions(
            String email
    );

    /**
     * Requires an active territory to belong to the authenticated
     * franchise's active district allocation.
     */
    FranchiseTerritory requireTerritoryInScope(
            String email,
            UUID territoryId
    );

    /**
     * Returns active territory identifiers derived from the authenticated
     * franchise's current scope.
     */
    List<UUID> getActiveTerritoryIds(
            String email
    );
}
