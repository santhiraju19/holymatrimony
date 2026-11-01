package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.franchise.dto.CreateFranchiseLeadRequest;
import com.theholymatrimony.backend.franchise.dto.FranchiseLeadResponse;
import com.theholymatrimony.backend.franchise.dto.UpdateFranchiseLeadRequest;
import com.theholymatrimony.backend.franchise.service.FranchiseLeadService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Franchise-facing lead management API.
 *
 * Route-level ROLE_FRANCHISE enforcement is provided by SecurityConfig.
 *
 * Permission and geographic authorization are enforced by the service layer.
 * Lead ownership is derived exclusively from the authenticated franchise
 * user's active district allocation.
 */
@RestController
@RequestMapping("/api/v1/franchise/leads")
@RequiredArgsConstructor
public class FranchiseLeadController {

    private final FranchiseLeadService franchiseLeadService;

    @GetMapping
    public ApiResponse<List<FranchiseLeadResponse>> listLeads(
            Authentication authentication
    ) {

        List<FranchiseLeadResponse> response =
                franchiseLeadService.listLeads(
                        authentication.getName()
                );

        return ApiResponse.success(
                response
        );
    }

    @PostMapping
    public ApiResponse<FranchiseLeadResponse> createLead(
            Authentication authentication,
            @Valid
            @RequestBody
            CreateFranchiseLeadRequest request
    ) {

        FranchiseLeadResponse response =
                franchiseLeadService.createLead(
                        authentication.getName(),
                        request
                );

        return ApiResponse.success(
                "Lead created successfully.",
                response
        );
    }

    @PatchMapping("/{leadId}")
    public ApiResponse<FranchiseLeadResponse> updateLead(
            Authentication authentication,
            @PathVariable
            UUID leadId,
            @Valid
            @RequestBody
            UpdateFranchiseLeadRequest request
    ) {

        FranchiseLeadResponse response =
                franchiseLeadService.updateLead(
                        authentication.getName(),
                        leadId,
                        request
                );

        return ApiResponse.success(
                "Lead updated successfully.",
                response
        );
    }
}
