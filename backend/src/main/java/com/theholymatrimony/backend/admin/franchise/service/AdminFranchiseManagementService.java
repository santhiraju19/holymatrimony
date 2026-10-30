package com.theholymatrimony.backend.admin.franchise.service;

import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchisePageResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseStatusResponse;
import com.theholymatrimony.backend.admin.franchise.dto.CreateDistrictFranchiseRequest;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseTerritoryResponse;
import com.theholymatrimony.backend.admin.franchise.dto.CreateFranchiseTerritoryRequest;
import com.theholymatrimony.backend.admin.franchise.dto.UpdateFranchiseStatusRequest;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;

import java.util.List;
import java.util.UUID;

/**
 * HQ management operations for District Franchises.
 *
 * Authorization is evaluated against the authenticated HQ administrator.
 * The first provisioning operation is intentionally SUPER_ADMIN-only.
 */
public interface AdminFranchiseManagementService {

    /**
     * Atomically provisions a District Franchise.
     *
     * The implementation is responsible for:
     * - requiring SUPER_ADMIN authorization;
     * - validating and deriving the selected district/state;
     * - enforcing one active franchise per district;
     * - creating the franchise;
     * - creating its active district allocation;
     * - provisioning the ROLE_FRANCHISE owner account;
     * - creating the active FRANCHISE_OWNER membership;
     * - initiating the existing secure password-setup flow.
     *
     * @param administratorEmail authenticated HQ administrator identity
     * @param request provisioning request
     * @return persisted franchise, geography, and owner details
     */
    AdminFranchiseResponse createDistrictFranchise(
            String administratorEmail,
            CreateDistrictFranchiseRequest request
    );

    /**
     * Returns the HQ paginated District Franchise list.
     *
     * Authorization remains SUPER_ADMIN-only for the current HQ slice.
     */
    AdminFranchisePageResponse listFranchises(
            String administratorEmail,
            String search,
            FranchiseStatus status,
            int page,
            int size
    );


    /**
     * Returns one District Franchise for HQ detail viewing.
     *
     * Authorization remains SUPER_ADMIN-only for the current HQ slice.
     *
     * @param administratorEmail authenticated HQ administrator identity
     * @param franchiseId persisted franchise identifier
     * @return persisted franchise, geography, and owner details
     */
    AdminFranchiseResponse getFranchise(
            String administratorEmail,
            UUID franchiseId
    );


    /**
     * Creates a territory under the franchise's active district allocation.
     *
     * Franchise and geographic scope are derived server-side from franchiseId.
     */
    AdminFranchiseTerritoryResponse createTerritory(
            String administratorEmail,
            UUID franchiseId,
            CreateFranchiseTerritoryRequest request
    );

    /**
     * Lists territories under the franchise's active district allocation.
     *
     * HQ may see both active and inactive territories.
     */
    List<AdminFranchiseTerritoryResponse> listTerritories(
            String administratorEmail,
            UUID franchiseId
    );

    /**
     * Returns one territory only when it belongs to the franchise's
     * active district allocation.
     */
    AdminFranchiseTerritoryResponse getTerritory(
            String administratorEmail,
            UUID franchiseId,
            UUID territoryId
    );

    /**
     * Changes the operational lifecycle status of a District Franchise.
     *
     * The implementation must enforce the server-side transition matrix;
     * accepting a FranchiseStatus value does not make every transition valid.
     *
     * Current operational lifecycle:
     * ONBOARDING -> ACTIVE
     * ACTIVE -> SUSPENDED
     * SUSPENDED -> ACTIVE
     *
     * Terminal lifecycle changes are intentionally handled separately
     * because franchise closure must coordinate district allocation release.
     *
     * Authorization remains SUPER_ADMIN-only for this HQ slice.
     */
    AdminFranchiseStatusResponse updateFranchiseStatus(
            String administratorEmail,
            UUID franchiseId,
            UpdateFranchiseStatusRequest request
    );

}
