package com.theholymatrimony.backend.admin.adminuser.dto;

import com.theholymatrimony.backend.admin.access.AdminPermission;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record UpdateSubAdminPermissionsRequest(

        @NotEmpty(
                message = "Select at least one admin permission."
        )
        Set<AdminPermission> permissions

) {
}
