
package com.theholymatrimony.backend.safety.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;

import com.theholymatrimony.backend.safety.dto.BlockStatusResponse;
import com.theholymatrimony.backend.safety.dto.ReportUserRequest;
import com.theholymatrimony.backend.safety.dto.UserReportResponse;

import com.theholymatrimony.backend.safety.service.SafetyService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/safety")
@RequiredArgsConstructor
public class SafetyController {

    private final SafetyService
            safetyService;


    /*
     * ============================================================
     * BLOCK USER
     * ============================================================
     */

    @PutMapping(
            "/users/{userId}/block"
    )
    public ResponseEntity<
            ApiResponse<BlockStatusResponse>
            >
    blockUser(
            Authentication authentication,

            @PathVariable
            UUID userId
    ) {

        String email =
                getAuthenticatedEmail(
                        authentication
                );

        BlockStatusResponse response =
                safetyService.blockUser(
                        email,
                        userId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User blocked successfully",
                        response
                )
        );
    }


    /*
     * ============================================================
     * UNBLOCK USER
     * ============================================================
     */

    @DeleteMapping(
            "/users/{userId}/block"
    )
    public ResponseEntity<
            ApiResponse<BlockStatusResponse>
            >
    unblockUser(
            Authentication authentication,

            @PathVariable
            UUID userId
    ) {

        String email =
                getAuthenticatedEmail(
                        authentication
                );

        BlockStatusResponse response =
                safetyService.unblockUser(
                        email,
                        userId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User unblocked successfully",
                        response
                )
        );
    }


    /*
     * ============================================================
     * BLOCK STATUS
     * ============================================================
     */

    @GetMapping(
            "/users/{userId}/block-status"
    )
    public ResponseEntity<
            ApiResponse<BlockStatusResponse>
            >
    getBlockStatus(
            Authentication authentication,

            @PathVariable
            UUID userId
    ) {

        String email =
                getAuthenticatedEmail(
                        authentication
                );

        BlockStatusResponse response =
                safetyService.getBlockStatus(
                        email,
                        userId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Block status retrieved successfully",
                        response
                )
        );
    }


    /*
     * ============================================================
     * REPORT USER
     * ============================================================
     */

    @PostMapping(
            "/users/{userId}/report"
    )
    public ResponseEntity<
            ApiResponse<UserReportResponse>
            >
    reportUser(
            Authentication authentication,

            @PathVariable
            UUID userId,

            @Valid
            @RequestBody
            ReportUserRequest request
    ) {

        String email =
                getAuthenticatedEmail(
                        authentication
                );

        UserReportResponse response =
                safetyService.reportUser(
                        email,
                        userId,
                        request
                );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        ApiResponse.success(
                                "Report submitted successfully",
                                response
                        )
                );
    }


    /*
     * ============================================================
     * AUTHENTICATION HELPER
     * ============================================================
     */

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                !authentication.isAuthenticated()
        ) {

            throw new AccessDeniedException(
                    "Authentication is required"
            );
        }

        String email =
                authentication.getName();

        if (
                email == null ||
                email.isBlank()
        ) {

            throw new AccessDeniedException(
                    "Authenticated user is required"
            );
        }

        return email.trim();
    }
}