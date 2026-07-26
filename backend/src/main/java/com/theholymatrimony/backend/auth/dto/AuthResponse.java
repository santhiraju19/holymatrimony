package com.theholymatrimony.backend.auth.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String email,
        String fullName
) {
}