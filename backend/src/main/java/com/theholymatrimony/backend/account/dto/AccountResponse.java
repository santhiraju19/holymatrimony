package com.theholymatrimony.backend.account.dto;

import com.theholymatrimony.backend.auth.enums.UserStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String fullName,
        String email,
        String mobile,
        boolean emailVerified,
        UserStatus status,
        String membershipType,
        Integer profileCompletion,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt
) {
}
