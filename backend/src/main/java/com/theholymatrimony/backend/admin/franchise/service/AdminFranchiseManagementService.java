package com.theholymatrimony.backend.admin.franchise.service;

import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchisePageResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseResponse;
import com.theholymatrimony.backend.admin.franchise.dto.CreateDistrictFranchiseRequest;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;

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

}
