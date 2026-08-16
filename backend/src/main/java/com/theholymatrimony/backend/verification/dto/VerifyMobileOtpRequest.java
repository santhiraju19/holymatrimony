package com.theholymatrimony.backend.verification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyMobileOtpRequest(

        @NotBlank(
                message = "OTP is required."
        )
        @Pattern(
                regexp = "^\\d{6}$",
                message = "OTP must contain exactly 6 digits."
        )
        String otp
) {
}
