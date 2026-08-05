package com.theholymatrimony.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyEmailOtpRequest(

        @Email(
                message =
                        "Please enter a valid email address."
        )
        @NotBlank(
                message =
                        "Email is required."
        )
        String email,

        @NotBlank(
                message =
                        "OTP is required."
        )
        @Pattern(
                regexp = "^\\d{6}$",
                message =
                        "OTP must contain exactly 6 digits."
        )
        String otp

) {
}