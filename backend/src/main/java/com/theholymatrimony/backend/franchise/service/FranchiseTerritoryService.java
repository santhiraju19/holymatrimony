package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.dto.FranchiseTerritoryResponse;

import java.util.List;

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
}
