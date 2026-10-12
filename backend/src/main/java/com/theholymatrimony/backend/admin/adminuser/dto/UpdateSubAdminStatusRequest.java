package com.theholymatrimony.backend.admin.adminuser.dto;

import com.theholymatrimony.backend.auth.enums.UserStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateSubAdminStatusRequest(

        @NotNull(message = "Status is required.")
        UserStatus status,

        @Size(
                max = 500,
                message = "Status reason must not exceed 500 characters."
        )
        String reason

) {
}
