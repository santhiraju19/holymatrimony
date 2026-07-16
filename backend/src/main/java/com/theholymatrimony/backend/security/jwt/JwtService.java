package com.theholymatrimony.backend.security.jwt;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public String generateToken(String email) {

        /*
         * Temporary implementation.
         * Next pack will replace this with Nimbus JWT.
         */

        return "HM-TOKEN-" + email + "-" + System.currentTimeMillis();
    }

    public String extractUsername(String token) {

        if (token == null || !token.startsWith("HM-TOKEN-")) {
            return null;
        }

        String value = token.substring("HM-TOKEN-".length());

        return value.substring(0, value.lastIndexOf("-"));
    }

    public boolean isTokenValid(String token, String email) {

        String username = extractUsername(token);

        return username != null && username.equals(email);
    }

}