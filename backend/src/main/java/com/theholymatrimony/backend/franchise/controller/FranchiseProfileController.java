package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.franchise.dto.FranchiseAccessResponse;
import com.theholymatrimony.backend.franchise.service.FranchiseProfileService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authenticated franchise-user profile and authorization context.
 *
 * Route-level ROLE_FRANCHISE enforcement is configured in SecurityConfig.
 * Membership, lifecycle, district scope, and effective permissions are
 * derived and enforced by the franchise access/service layer.
 */
@RestController
@RequestMapping("/api/v1/franchise")
@RequiredArgsConstructor
public class FranchiseProfileController {

    private final FranchiseProfileService franchiseProfileService;

    @GetMapping("/me")
    public ApiResponse<FranchiseAccessResponse> getCurrentFranchiseAccess(
            Authentication authentication
    ) {

        FranchiseAccessResponse response =
                franchiseProfileService
                        .getCurrentFranchiseAccess(
                                authentication.getName()
                        );

        return ApiResponse.success(
                response
        );
    }
}
