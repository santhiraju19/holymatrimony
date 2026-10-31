package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.dto.FranchiseTerritoryResponse;
import com.theholymatrimony.backend.franchise.dto.UpdateFranchiseTerritoryRequest;

import java.util.List;
import java.util.UUID;

/**
 * Franchise-user territory operations.
 *
 * The authenticated user's franchise and district scope must be derived
 * server-side and must never be supplied by the client as authorization
 * scope.
 */
public interface FranchiseTerritoryService {

    List<FranchiseTerritoryResponse> listActiveTerritories(
            String email
    );

    /**
     * Updates permitted operational metadata for one active territory
     * inside the authenticated franchise user's geographic scope.
     *
     * Structural and geographic fields are intentionally immutable from
     * the franchise-user API.
     */
    FranchiseTerritoryResponse updateTerritory(
            String email,
            UUID territoryId,
            UpdateFranchiseTerritoryRequest request
    );
}
