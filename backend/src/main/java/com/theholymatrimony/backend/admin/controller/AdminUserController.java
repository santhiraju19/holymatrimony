package com.theholymatrimony.backend.admin.controller;

import com.theholymatrimony.backend.admin.dto.AdminUserDetailResponse;
import com.theholymatrimony.backend.admin.dto.AdminUserPageResponse;
import com.theholymatrimony.backend.admin.dto.UpdateUserStatusRequest;
import com.theholymatrimony.backend.admin.service.AdminUserService;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.common.response.ApiResponse;

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
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminUserPageResponse>>
    getUsers(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size,

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            UserStatus status

    ) {

        AdminUserPageResponse response =
                adminUserService.getUsers(
                        page,
                        size,
                        search,
                        status
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<AdminUserDetailResponse>>
    getUser(

            @PathVariable
            UUID userId

    ) {

        AdminUserDetailResponse response =
                adminUserService.getUser(
                        userId
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<AdminUserDetailResponse>>
    updateUserStatus(

            @PathVariable
            UUID userId,

            @Valid
            @RequestBody
            UpdateUserStatusRequest request

    ) {

        AdminUserDetailResponse response =
                adminUserService.updateUserStatus(
                        userId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User status updated successfully",
                        response
                )
        );
    }
}