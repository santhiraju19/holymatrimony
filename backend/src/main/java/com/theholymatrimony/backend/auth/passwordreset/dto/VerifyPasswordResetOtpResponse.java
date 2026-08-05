package com.theholymatrimony.backend.auth.passwordreset.dto;

public record VerifyPasswordResetOtpResponse(

        boolean success,
        String message,
        String resetToken

) {
}