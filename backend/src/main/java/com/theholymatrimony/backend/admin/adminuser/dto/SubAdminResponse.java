package com.theholymatrimony.backend.admin.adminuser.dto;

import com.theholymatrimony.backend.admin.access.AdminAccessLevel;
import com.theholymatrimony.backend.admin.access.AdminPermission;
import com.theholymatrimony.backend.auth.enums.UserStatus;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record SubAdminResponse(

        UUID id,
        String fullName,
        String email,
        AdminAccessLevel accessLevel,
        UserStatus status,
        boolean enabled,
        Set<AdminPermission> permissions,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}
