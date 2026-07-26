package com.theholymatrimony.backend.auth.controller;

import com.theholymatrimony.backend.auth.dto.AuthResponse;
import com.theholymatrimony.backend.auth.dto.AuthSession;
import com.theholymatrimony.backend.auth.dto.LoginRequest;
import com.theholymatrimony.backend.auth.dto.RegisterRequest;
import com.theholymatrimony.backend.auth.dto.RegisterResponse;
import com.theholymatrimony.backend.auth.service.AuthService;
import com.theholymatrimony.backend.auth.service.RefreshTokenCookieService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenCookieService refreshTokenCookieService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        RegisterResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String clientIp = getClientIp(httpRequest);

        AuthSession session = authService.login(
                request,
                clientIp
        );

        refreshTokenCookieService.addRefreshTokenCookie(
                httpResponse,
                session.refreshToken()
        );

        return ResponseEntity.ok(session.response());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(
                    name = RefreshTokenCookieService.REFRESH_TOKEN_COOKIE,
                    required = false
            ) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshTokenCookieService.clearRefreshTokenCookie(
                    httpResponse
            );

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        String clientIp = getClientIp(httpRequest);

        AuthSession session = authService.refresh(
                refreshToken,
                clientIp
        );

        refreshTokenCookieService.addRefreshTokenCookie(
                httpResponse,
                session.refreshToken()
        );

        return ResponseEntity.ok(session.response());
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @CookieValue(
                    name = RefreshTokenCookieService.REFRESH_TOKEN_COOKIE,
                    required = false
            ) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String clientIp = getClientIp(httpRequest);

        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(
                    refreshToken,
                    clientIp
            );
        }

        refreshTokenCookieService.clearRefreshTokenCookie(
                httpResponse
        );

        return ResponseEntity.ok(
                Map.of("message", "Logout successful.")
        );
    }

    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");

        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }
}