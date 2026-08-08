package com.theholymatrimony.backend.admin.controller;

import com.theholymatrimony.backend.admin.dto.AdminProfileDetailResponse;
import com.theholymatrimony.backend.admin.dto.AdminProfilePageResponse;
import com.theholymatrimony.backend.admin.dto.UpdateProfileVerificationRequest;

import com.theholymatrimony.backend.admin.service.AdminProfileVerificationService;

import com.theholymatrimony.backend.common.response.ApiResponse;

import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/profiles")
@RequiredArgsConstructor
public class AdminProfileVerificationController {

    private final AdminProfileVerificationService
            adminProfileVerificationService;

    @GetMapping
    public ResponseEntity<
            ApiResponse<AdminProfilePageResponse>
            >
    getProfiles(

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size,

            @RequestParam(
                    required = false
            )
            String search,

            @RequestParam(
                    required = false
            )
            ProfileVerificationStatus status

    ) {

        AdminProfilePageResponse response =
                adminProfileVerificationService
                        .getProfiles(
                                page,
                                size,
                                search,
                                status
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    @GetMapping("/{profileId}")
    public ResponseEntity<
            ApiResponse<AdminProfileDetailResponse>
            >
    getProfile(

            @PathVariable
            UUID profileId

    ) {

        AdminProfileDetailResponse response =
                adminProfileVerificationService
                        .getProfile(
                                profileId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    @PatchMapping(
            "/{profileId}/verification"
    )
    public ResponseEntity<
            ApiResponse<AdminProfileDetailResponse>
            >
    updateVerification(

            @PathVariable
            UUID profileId,

            @Valid
            @RequestBody
            UpdateProfileVerificationRequest request

    ) {

        AdminProfileDetailResponse response =
                adminProfileVerificationService
                        .updateVerification(
                                profileId,
                                request
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile verification updated successfully.",
                        response
                )
        );
    }
}