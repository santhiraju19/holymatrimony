package com.theholymatrimony.backend.admin.access.dto;

import com.theholymatrimony.backend.admin.access.AdminAccessLevel;
import com.theholymatrimony.backend.admin.access.AdminPermission;

import java.util.Set;
import java.util.UUID;

public record AdminAccessResponse(
        UUID userId,
        String fullName,
        String email,
        AdminAccessLevel accessLevel,
        Set<AdminPermission> permissions
) {
}
