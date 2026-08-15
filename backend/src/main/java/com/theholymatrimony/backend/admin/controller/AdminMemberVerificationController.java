package com.theholymatrimony.backend.admin.controller;

import com.theholymatrimony.backend.admin.dto.AdminMemberVerificationPageResponse;
import com.theholymatrimony.backend.admin.dto.AdminMemberVerificationResponse;
import com.theholymatrimony.backend.admin.dto.UpdateMemberVerificationRequest;
import com.theholymatrimony.backend.admin.service.AdminMemberVerificationService;
import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;

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
@RequestMapping(
        "/api/v1/admin/verifications"
)
@RequiredArgsConstructor
public class AdminMemberVerificationController {

    private final AdminMemberVerificationService
            adminMemberVerificationService;

    @GetMapping
    public ResponseEntity<
            ApiResponse<
                    AdminMemberVerificationPageResponse
                    >
            >
    getVerifications(

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
            VerificationStatus status,

            @RequestParam(
                    required = false
            )
            VerificationType type
    ) {

        AdminMemberVerificationPageResponse response =
                adminMemberVerificationService
                        .getVerifications(
                                page,
                                size,
                                search,
                                status,
                                type
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    @GetMapping(
            "/{verificationId}"
    )
    public ResponseEntity<
            ApiResponse<
                    AdminMemberVerificationResponse
                    >
            >
    getVerification(
            @PathVariable
            UUID verificationId
    ) {

        AdminMemberVerificationResponse response =
                adminMemberVerificationService
                        .getVerification(
                                verificationId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    @PatchMapping(
            "/{verificationId}"
    )
    public ResponseEntity<
            ApiResponse<
                    AdminMemberVerificationResponse
                    >
            >
    updateVerification(

            @PathVariable
            UUID verificationId,

            @Valid
            @RequestBody
            UpdateMemberVerificationRequest request
    ) {

        AdminMemberVerificationResponse response =
                adminMemberVerificationService
                        .updateVerification(
                                verificationId,
                                request
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Member verification updated successfully.",
                        response
                )
        );
    }
}