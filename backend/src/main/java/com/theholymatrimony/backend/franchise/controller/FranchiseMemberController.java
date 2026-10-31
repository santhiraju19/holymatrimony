package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.franchise.dto.FranchiseMemberResponse;
import com.theholymatrimony.backend.franchise.service.FranchiseMemberService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Franchise-facing member operations.
 *
 * Geographic authorization scope is derived exclusively from the
 * authenticated franchise user's active district allocation.
 */
@RestController
@RequestMapping("/api/v1/franchise/members")
@RequiredArgsConstructor
public class FranchiseMemberController {

    private final FranchiseMemberService franchiseMemberService;

    @GetMapping
    public ApiResponse<List<FranchiseMemberResponse>> listMembers(
            Authentication authentication
    ) {

        List<FranchiseMemberResponse> response =
                franchiseMemberService.listMembers(
                        authentication.getName()
                );

        return ApiResponse.success(
                response
        );
    }
}
