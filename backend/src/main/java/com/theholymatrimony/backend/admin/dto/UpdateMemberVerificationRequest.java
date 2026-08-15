package com.theholymatrimony.backend.admin.dto;

import com.theholymatrimony.backend.verification.enums.VerificationStatus;

import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMemberVerificationRequest {

    @NotNull(
            message = "Verification status is required."
    )
    private VerificationStatus status;

    private String reason;
}
