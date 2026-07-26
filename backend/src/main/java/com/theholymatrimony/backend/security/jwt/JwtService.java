package com.theholymatrimony.backend.security.jwt;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
public class JwtService {

    private static final String ISSUER = "holy-matrimony-backend";
    private static final String TOKEN_TYPE = "access";

    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;

    public JwtService(
            JwtEncoder jwtEncoder,
            JwtProperties jwtProperties
    ) {
        this.jwtEncoder = Objects.requireNonNull(
                jwtEncoder,
                "jwtEncoder must not be null"
        );

        this.jwtProperties = Objects.requireNonNull(
                jwtProperties,
                "jwtProperties must not be null"
        );
    }

    /**
     * Preserves compatibility with the existing authentication service.
     */
    public String generateToken(String email) {
        return generateAccessToken(email, List.of("ROLE_USER"));
    }

    /**
     * Generates a signed JWT access token containing the authenticated
     * user's email and authorities.
     */
    public String generateAccessToken(
            String email,
            List<String> authorities
    ) {
        validateEmail(email);

        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusMillis(
                jwtProperties.getAccessTokenExpiration()
        );

        List<String> safeAuthorities =
                authorities == null
                        ? List.of()
                        : authorities.stream()
                                .filter(Objects::nonNull)
                                .map(String::trim)
                                .filter(authority -> !authority.isBlank())
                                .distinct()
                                .toList();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(email.trim().toLowerCase())
                .issuedAt(issuedAt)
                .notBefore(issuedAt)
                .expiresAt(expiresAt)
                .claim("type", TOKEN_TYPE)
                .claim("authorities", safeAuthorities)
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        return jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                header,
                                claims
                        )
                )
                .getTokenValue();
    }

    public long getAccessTokenExpirationMillis() {
        return jwtProperties.getAccessTokenExpiration();
    }

    private void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email must not be null or blank"
            );
        }

        if (jwtProperties.getAccessTokenExpiration() <= 0) {
            throw new IllegalStateException(
                    "JWT access-token-expiration must be greater than zero"
            );
        }
    }
}