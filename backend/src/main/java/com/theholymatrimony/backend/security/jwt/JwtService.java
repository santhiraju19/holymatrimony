package com.theholymatrimony.backend.security.jwt;

import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;

    public JwtService(
            JwtEncoder jwtEncoder,
            JwtProperties jwtProperties
    ) {
        this.jwtEncoder = jwtEncoder;
        this.jwtProperties = jwtProperties;
    }

    public String generateToken(String email) {

        Instant now = Instant.now();

        Instant expiresAt = now.plusMillis(
                jwtProperties.getExpiration()
        );

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("holy-matrimony")
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(email)
                .build();

        return jwtEncoder
                .encode(JwtEncoderParameters.from(claims))
                .getTokenValue();
    }
}