package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.franchise.dto.FranchiseTerritoryResponse;
import com.theholymatrimony.backend.franchise.service.FranchiseTerritoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
