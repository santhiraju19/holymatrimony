package com.theholymatrimony.backend.admin.dto;

import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {

    private UUID id;

    private String fullName;

    private String email;

    private String mobile;

    private Role role;

    private UserStatus status;

    private boolean enabled;

    private boolean emailVerified;

    private Integer profileCompletion;

    private String membershipType;

    private LocalDateTime createdAt;

    private LocalDateTime lastLoginAt;
}