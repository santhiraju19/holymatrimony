package com.theholymatrimony.backend.auth.service;

import com.theholymatrimony.backend.auth.exception.InvalidRefreshTokenException;
import com.theholymatrimony.backend.auth.entity.RefreshToken;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.RefreshTokenRepository;
import com.theholymatrimony.backend.security.jwt.JwtProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final int TOKEN_BYTE_LENGTH = 64;

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public String createRefreshToken(
            User user,
            String clientIp
    ) {
        String rawToken = generateSecureToken();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setExpiresAt(
                Instant.now().plusMillis(
                        jwtProperties.getRefreshTokenExpiration()
                )
        );
        refreshToken.setCreatedByIp(normalizeIp(clientIp));

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    @Transactional(readOnly = true)
    public RefreshToken validateRefreshToken(
            String rawToken
    ) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidRefreshTokenException(
        "Refresh token has been revoked."
);
        }

        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByTokenHash(tokenHash)
                        .orElseThrow(
                                () -> new InvalidRefreshTokenException(
                                        "Invalid refresh token."
                                )
                        );

        if (refreshToken.isRevoked()) {
            throw new InvalidRefreshTokenException(
                    "Refresh token has been revoked."
            );
        }

        if (refreshToken.isExpired()) {
            throw new InvalidRefreshTokenException(
                    "Refresh token has expired."
            );
        }

       if (!Boolean.TRUE.equals(
        refreshToken.getUser().getEnabled()
)) {
            throw new InvalidRefreshTokenException(
                    "User account is disabled."
            );
        }

        return refreshToken;
    }

    @Transactional
    public String rotateRefreshToken(
            String currentRawToken,
            String clientIp
    ) {
        RefreshToken currentToken =
                validateRefreshToken(currentRawToken);

        String replacementRawToken =
                generateSecureToken();

        String replacementTokenHash =
                hashToken(replacementRawToken);

        currentToken.revoke(
                normalizeIp(clientIp),
                "Refresh token rotated",
                replacementTokenHash
        );

        RefreshToken replacementToken =
                new RefreshToken();

        replacementToken.setUser(
                currentToken.getUser()
        );

        replacementToken.setTokenHash(
                replacementTokenHash
        );

        replacementToken.setExpiresAt(
                Instant.now().plusMillis(
                        jwtProperties.getRefreshTokenExpiration()
                )
        );

        replacementToken.setCreatedByIp(
                normalizeIp(clientIp)
        );

        refreshTokenRepository.save(currentToken);
        refreshTokenRepository.save(replacementToken);

        return replacementRawToken;
    }

    @Transactional
    public void revokeRefreshToken(
            String rawToken,
            String clientIp,
            String reason
    ) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        String tokenHash = hashToken(rawToken);

        refreshTokenRepository
                .findByTokenHash(tokenHash)
                .filter(token -> !token.isRevoked())
                .ifPresent(token -> {
                    token.revoke(
                            normalizeIp(clientIp),
                            reason,
                            null
                    );

                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void revokeAllUserTokens(
            User user,
            String clientIp,
            String reason
    ) {
        List<RefreshToken> activeTokens =
                refreshTokenRepository
                        .findByUserAndRevokedAtIsNull(user);

        String normalizedIp = normalizeIp(clientIp);

        for (RefreshToken token : activeTokens) {
            if (!token.isExpired()) {
                token.revoke(
                        normalizedIp,
                        reason,
                        null
                );
            }
        }

        refreshTokenRepository.saveAll(activeTokens);
    }

    public String hashToken(
            String rawToken
    ) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    rawToken.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 hashing is unavailable.",
                    exception
            );
        }
    }

    private String generateSecureToken() {
        byte[] tokenBytes =
                new byte[TOKEN_BYTE_LENGTH];

        secureRandom.nextBytes(tokenBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);
    }

    private String normalizeIp(
            String clientIp
    ) {
        if (clientIp == null || clientIp.isBlank()) {
            return "unknown";
        }

        String normalizedIp = clientIp.trim();

        if (normalizedIp.length() > 45) {
            return normalizedIp.substring(0, 45);
        }

        return normalizedIp;
    }
}