package com.theholymatrimony.backend.account.dto;

import jakarta.validation.constraints.NotBlank;

public record DeleteAccountRequest(

        @NotBlank(message = "Password is required.")
        String password,

        @NotBlank(message = "Confirmation is required.")
        String confirmation
) {
}
