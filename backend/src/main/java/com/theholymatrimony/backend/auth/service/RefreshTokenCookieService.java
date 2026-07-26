package com.theholymatrimony.backend.auth.service;

import com.theholymatrimony.backend.security.jwt.JwtProperties;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RefreshTokenCookieService {

    public static final String REFRESH_TOKEN_COOKIE =
            "refresh_token";

    private static final String COOKIE_PATH =
            "/api/v1/auth";

    private final JwtProperties jwtProperties;

    @Value("${app.auth.refresh-cookie-secure:false}")
    private boolean secureCookie;

    @Value("${app.auth.refresh-cookie-same-site:Lax}")
    private String sameSite;

    public void addRefreshTokenCookie(
            HttpServletResponse response,
            String refreshToken
    ) {
        ResponseCookie cookie = ResponseCookie
                .from(
                        REFRESH_TOKEN_COOKIE,
                        refreshToken
                )
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path(COOKIE_PATH)
                .maxAge(
                        Duration.ofMillis(
                                jwtProperties
                                        .getRefreshTokenExpiration()
                        )
                )
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );
    }

    public void clearRefreshTokenCookie(
            HttpServletResponse response
    ) {
        ResponseCookie cookie = ResponseCookie
                .from(
                        REFRESH_TOKEN_COOKIE,
                        ""
                )
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path(COOKIE_PATH)
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );
    }
}