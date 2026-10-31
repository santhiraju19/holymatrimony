package com.theholymatrimony.backend.admin.franchise.controller;

import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseClosureResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseStatusResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseTerritoryResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchisePageResponse;
import com.theholymatrimony.backend.admin.franchise.dto.CreateDistrictFranchiseRequest;
import com.theholymatrimony.backend.admin.franchise.dto.CreateFranchiseTerritoryRequest;
import com.theholymatrimony.backend.admin.franchise.dto.UpdateFranchiseStatusRequest;
import com.theholymatrimony.backend.admin.franchise.dto.TerminateFranchiseRequest;
import com.theholymatrimony.backend.admin.franchise.service.AdminFranchiseManagementService;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;
import com.theholymatrimony.backend.common.response.ApiResponse;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HQ management endpoints for District Franchises.
 *
 * Franchise provisioning is intentionally restricted to SUPER_ADMIN.
 * Geographic state scope is never accepted independently from the client;
 * the service derives state from the selected district.
 */
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/franchises")
@RequiredArgsConstructor
@PreAuthorize("@adminAuthorization.isSuperAdmin(authentication)")
public class AdminFranchiseManagementController {

    private final AdminFranchiseManagementService
            adminFranchiseManagementService;

    /**
     * Provisions one District Franchise and its initial owner account.
     *
     * The authenticated administrator identity is obtained from Spring
     * Security and passed to the service for server-side authorization.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AdminFranchiseResponse>>
    createDistrictFranchise(
            Authentication authentication,

            @Valid
            @RequestBody
            CreateDistrictFranchiseRequest request
    ) {
        if (
                authentication == null
                        || !authentication.isAuthenticated()
                        || authentication.getName() == null
                        || authentication.getName().isBlank()
        ) {
            throw new IllegalStateException(
                    "Authenticated administrator not found."
            );
        }

        AdminFranchiseResponse response =
                adminFranchiseManagementService
                        .createDistrictFranchise(
                                authentication.getName(),
                                request
                        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                response
                        )
                );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AdminFranchisePageResponse>>
    listFranchises(
            Authentication authentication,

            @RequestParam(
                    required = false
            )
            String search,

            @RequestParam(
                    required = false
            )
            FranchiseStatus status,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size
    ) {
        String administratorEmail =
                requireAdministratorEmail(
                        authentication
                );

        AdminFranchisePageResponse response =
                adminFranchiseManagementService
                        .listFranchises(
                                administratorEmail,
                                search,
                                status,
                                page,
                                size
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    @GetMapping("/{franchiseId}")
    public ResponseEntity<ApiResponse<AdminFranchiseResponse>> getFranchise(
            Authentication authentication,
            @PathVariable UUID franchiseId
    ) {
        String administratorEmail =
                requireAdministratorEmail(
                        authentication
                );

        AdminFranchiseResponse response =
                adminFranchiseManagementService.getFranchise(
                        administratorEmail,
                        franchiseId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }



    /**
     * Updates the operational lifecycle status of a District Franchise.
     *
     * Supported transitions are enforced by the service:
     * ONBOARDING -> ACTIVE,
     * ACTIVE -> SUSPENDED,
     * SUSPENDED -> ACTIVE.
     *
     * Terminal lifecycle changes are intentionally excluded because
     * franchise closure must coordinate district allocation release.
     */
    @PatchMapping("/{franchiseId}/status")
    public ResponseEntity<ApiResponse<AdminFranchiseStatusResponse>>
    updateFranchiseStatus(
            Authentication authentication,
            @PathVariable UUID franchiseId,
            @Valid
            @RequestBody
            UpdateFranchiseStatusRequest request
    ) {
        AdminFranchiseStatusResponse response =
                adminFranchiseManagementService.updateFranchiseStatus(
                        requireAdministratorEmail(authentication),
                        franchiseId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Franchise status updated successfully.",
                        response
                )
        );
    }


    /**
     * Permanently terminates an ACTIVE or SUSPENDED District Franchise.
     *
     * This endpoint is intentionally separate from the generic status endpoint.
     * The service performs coordinated closure of the franchise, active district
     * allocation, territories, franchise-user memberships, and lifecycle audit.
     */
    @PostMapping("/{franchiseId}/terminate")
    public ResponseEntity<ApiResponse<AdminFranchiseClosureResponse>>
    terminateFranchise(
            Authentication authentication,
            @PathVariable UUID franchiseId,
            @Valid
            @RequestBody
            TerminateFranchiseRequest request
    ) {
        AdminFranchiseClosureResponse response =
                adminFranchiseManagementService.terminateFranchise(
                        requireAdministratorEmail(authentication),
                        franchiseId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Franchise terminated successfully.",
                        response
                )
        );
    }


    @PostMapping("/{franchiseId}/territories")
    public ResponseEntity<ApiResponse<AdminFranchiseTerritoryResponse>>
    createTerritory(
            Authentication authentication,
            @PathVariable UUID franchiseId,
            @Valid
            @RequestBody
            CreateFranchiseTerritoryRequest request
    ) {
        AdminFranchiseTerritoryResponse response =
                adminFranchiseManagementService.createTerritory(
                        requireAdministratorEmail(authentication),
                        franchiseId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Franchise territory created successfully.",
                                response
                        )
                );
    }

    @GetMapping("/{franchiseId}/territories")
    public ResponseEntity<ApiResponse<List<AdminFranchiseTerritoryResponse>>>
    listTerritories(
            Authentication authentication,
            @PathVariable UUID franchiseId
    ) {
        List<AdminFranchiseTerritoryResponse> response =
                adminFranchiseManagementService.listTerritories(
                        requireAdministratorEmail(authentication),
                        franchiseId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Franchise territories fetched successfully.",
                        response
                )
        );
    }

    @GetMapping("/{franchiseId}/territories/{territoryId}")
    public ResponseEntity<ApiResponse<AdminFranchiseTerritoryResponse>>
    getTerritory(
            Authentication authentication,
            @PathVariable UUID franchiseId,
            @PathVariable UUID territoryId
    ) {
        AdminFranchiseTerritoryResponse response =
                adminFranchiseManagementService.getTerritory(
                        requireAdministratorEmail(authentication),
                        franchiseId,
                        territoryId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Franchise territory fetched successfully.",
                        response
                )
        );
    }

    private String requireAdministratorEmail(
            Authentication authentication
    ) {
        if (
                authentication == null
                        || !authentication.isAuthenticated()
                        || authentication.getName() == null
                        || authentication.getName().isBlank()
        ) {
            throw new IllegalStateException(
                    "Authenticated administrator identity is required."
            );
        }

        return authentication.getName();
    }

}
