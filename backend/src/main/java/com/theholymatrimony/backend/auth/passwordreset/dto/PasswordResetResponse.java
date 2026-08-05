package com.theholymatrimony.backend.auth.passwordreset.dto;

public record PasswordResetResponse(

        boolean success,
        String message

) {
}