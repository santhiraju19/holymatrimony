package com.theholymatrimony.backend.auth.dto;

import java.util.UUID;

public record EmailVerificationResponse(
        UUID userId,
        String email,
        boolean emailVerified,
        String message
) {
}