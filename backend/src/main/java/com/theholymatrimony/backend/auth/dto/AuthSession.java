package com.theholymatrimony.backend.auth.dto;

public record AuthSession(
        AuthResponse response,
        String refreshToken
) {
}