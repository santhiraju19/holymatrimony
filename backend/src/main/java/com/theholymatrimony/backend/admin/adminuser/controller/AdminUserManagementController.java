package com.theholymatrimony.backend.admin.adminuser.controller;

import com.theholymatrimony.backend.admin.adminuser.dto.CreateSubAdminRequest;
import com.theholymatrimony.backend.admin.adminuser.dto.SubAdminPageResponse;
import com.theholymatrimony.backend.admin.adminuser.dto.SubAdminResponse;
import com.theholymatrimony.backend.admin.adminuser.dto.UpdateSubAdminPermissionsRequest;
import com.theholymatrimony.backend.admin.adminuser.dto.UpdateSubAdminStatusRequest;
import com.theholymatrimony.backend.admin.adminuser.service.SubAdminManagementService;
import com.theholymatrimony.backend.auth.enums.UserStatus;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/admin-users")
@RequiredArgsConstructor
@PreAuthorize("@adminAuthorization.isSuperAdmin(authentication)")
public class AdminUserManagementController {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final SubAdminManagementService
            subAdminManagementService;

    @GetMapping
    public ResponseEntity<SubAdminPageResponse>
    getSubAdmins(
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
            UserStatus status
    ) {
        int safePage =
                Math.max(
                        page,
                        0
                );

        int safeSize =
                normalizePageSize(
                        size
                );

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return ResponseEntity.ok(
                subAdminManagementService
                        .getSubAdmins(
                                search,
                                status,
                                pageable
                        )
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<SubAdminResponse>
    getSubAdmin(
            @PathVariable
            UUID userId
    ) {
        return ResponseEntity.ok(
                subAdminManagementService
                        .getSubAdmin(
                                userId
                        )
        );
    }

    @PostMapping
    public ResponseEntity<SubAdminResponse>
    createSubAdmin(
            @Valid
            @RequestBody
            CreateSubAdminRequest request
    ) {
        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        subAdminManagementService
                                .createSubAdmin(
                                        request
                                )
                );
    }

    @PatchMapping("/{userId}/permissions")
    public ResponseEntity<SubAdminResponse>
    updatePermissions(
            @PathVariable
            UUID userId,

            @Valid
            @RequestBody
            UpdateSubAdminPermissionsRequest request
    ) {
        return ResponseEntity.ok(
                subAdminManagementService
                        .updatePermissions(
                                userId,
                                request
                        )
        );
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<SubAdminResponse>
    updateStatus(
            @PathVariable
            UUID userId,

            @Valid
            @RequestBody
            UpdateSubAdminStatusRequest request,

            HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(
                subAdminManagementService
                        .updateStatus(
                                userId,
                                request,
                                getClientIp(
                                        httpRequest
                                )
                        )
        );
    }

    @PostMapping("/{userId}/resend-setup-otp")
    public ResponseEntity<Map<String, String>>
    resendSetupOtp(
            @PathVariable
            UUID userId
    ) {
        subAdminManagementService
                .resendSetupOtp(
                        userId
                );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Password setup OTP sent successfully."
                )
        );
    }

    private int normalizePageSize(
            int size
    ) {
        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }

        return Math.min(
                size,
                MAX_PAGE_SIZE
        );
    }

    private String getClientIp(
            HttpServletRequest request
    ) {
        String forwardedFor =
                request.getHeader(
                        "X-Forwarded-For"
                );

        if (
                forwardedFor != null
                        && !forwardedFor.isBlank()
        ) {
            return forwardedFor
                    .split(",")[0]
                    .trim();
        }

        String realIp =
                request.getHeader(
                        "X-Real-IP"
                );

        if (
                realIp != null
                        && !realIp.isBlank()
        ) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }
}
