package com.theholymatrimony.backend.security.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    /**
     * Secret key used for signing JWT tokens.
     * Must be at least 32 characters.
     */
    private String secret;

    /**
     * Access Token validity in milliseconds.
     * Example: 900000 = 15 minutes
     */
    private long accessTokenExpiration;

    /**
     * Refresh Token validity in milliseconds.
     * Example: 604800000 = 7 days
     */
    private long refreshTokenExpiration;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    public void setAccessTokenExpiration(long accessTokenExpiration) {
        this.accessTokenExpiration = accessTokenExpiration;
    }

    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }

    public void setRefreshTokenExpiration(long refreshTokenExpiration) {
        this.refreshTokenExpiration = refreshTokenExpiration;
    }
}