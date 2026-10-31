package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.franchise.dto.FranchiseTerritoryResponse;
import com.theholymatrimony.backend.franchise.dto.UpdateFranchiseTerritoryRequest;
import com.theholymatrimony.backend.franchise.service.FranchiseTerritoryService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Franchise-user territory API.
 *
 * Route-level ROLE_FRANCHISE enforcement is provided by SecurityConfig.
 * Permission and geographic scope are enforced by the service layer.
 */
@RestController
@RequestMapping("/api/v1/franchise/territories")
@RequiredArgsConstructor
public class FranchiseTerritoryController {

    private final FranchiseTerritoryService franchiseTerritoryService;

    @GetMapping
    public ApiResponse<List<FranchiseTerritoryResponse>>
    listTerritories(
            Authentication authentication
    ) {

        List<FranchiseTerritoryResponse> response =
                franchiseTerritoryService
                        .listActiveTerritories(
                                authentication.getName()
                        );

        return ApiResponse.success(
                response
        );
    }

    @PatchMapping("/{territoryId}")
    public ApiResponse<FranchiseTerritoryResponse>
    updateTerritory(
            Authentication authentication,
            @PathVariable
            UUID territoryId,
            @Valid
            @RequestBody
            UpdateFranchiseTerritoryRequest request
    ) {

        FranchiseTerritoryResponse response =
                franchiseTerritoryService
                        .updateTerritory(
                                authentication.getName(),
                                territoryId,
                                request
                        );

        return ApiResponse.success(
                "Territory updated successfully.",
                response
        );
    }
}
