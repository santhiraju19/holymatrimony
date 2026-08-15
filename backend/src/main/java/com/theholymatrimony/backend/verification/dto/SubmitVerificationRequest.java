package com.theholymatrimony.backend.verification.dto;

import jakarta.validation.constraints.Size;

public record SubmitVerificationRequest(

        @Size(
                max = 1000,
                message = "Verification note cannot exceed 1000 characters."
        )
        String note
) {
}
