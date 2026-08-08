package com.theholymatrimony.backend.admin.dto;

import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateProfileVerificationRequest {

    @NotNull(
            message = "Verification status is required."
    )
    private ProfileVerificationStatus status;

    @Size(
            max = 1000,
            message = "Verification reason cannot exceed 1000 characters."
    )
    private String reason;
}