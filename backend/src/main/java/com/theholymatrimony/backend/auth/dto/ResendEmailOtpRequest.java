package com.theholymatrimony.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendEmailOtpRequest(

        @Email(
                message =
                        "Please enter a valid email address."
        )
        @NotBlank(
                message =
                        "Email is required."
        )
        String email

) {
}