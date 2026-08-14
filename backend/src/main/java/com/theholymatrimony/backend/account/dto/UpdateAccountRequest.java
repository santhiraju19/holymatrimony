package com.theholymatrimony.backend.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateAccountRequest(

        @NotBlank(message = "Full name is required.")
        @Size(
                min = 2,
                max = 120,
                message = "Full name must be between 2 and 120 characters."
        )
        String fullName,

        @Pattern(
                regexp = "^$|^[+]?[0-9]{7,15}$",
                message = "Please enter a valid mobile number."
        )
        String mobile
) {
}
