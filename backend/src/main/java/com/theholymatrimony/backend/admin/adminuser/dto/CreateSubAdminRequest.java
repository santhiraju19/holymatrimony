package com.theholymatrimony.backend.admin.adminuser.dto;

import com.theholymatrimony.backend.admin.access.AdminPermission;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CreateSubAdminRequest(

        @NotBlank(message = "Full name is required.")
        @Size(
                max = 120,
                message = "Full name must not exceed 120 characters."
        )
        String fullName,

        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        @Size(
                max = 150,
                message = "Email must not exceed 150 characters."
        )
        String email,

        @NotEmpty(
                message = "Select at least one admin permission."
        )
        Set<AdminPermission> permissions

) {
}
