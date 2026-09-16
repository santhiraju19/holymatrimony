package com.theholymatrimony.backend.secureconnect.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@ConfigurationProperties(prefix = "secure-connect.livekit")
public class LiveKitProperties {

    private String url;
    private String apiKey;
    private String apiSecret;
    private long tokenTtlSeconds = 300L;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiSecret() {
        return apiSecret;
    }

    public void setApiSecret(String apiSecret) {
        this.apiSecret = apiSecret;
    }

    public long getTokenTtlSeconds() {
        return tokenTtlSeconds;
    }

    public void setTokenTtlSeconds(long tokenTtlSeconds) {
        this.tokenTtlSeconds = tokenTtlSeconds;
    }

    public void validate() {
        if (!StringUtils.hasText(url)) {
            throw new IllegalStateException(
                    "LiveKit URL is not configured."
            );
        }

        if (!StringUtils.hasText(apiKey)) {
            throw new IllegalStateException(
                    "LiveKit API key is not configured."
            );
        }

        if (!StringUtils.hasText(apiSecret)) {
            throw new IllegalStateException(
                    "LiveKit API secret is not configured."
            );
        }

        if (tokenTtlSeconds < 60L) {
            throw new IllegalStateException(
                    "LiveKit token TTL must be at least 60 seconds."
            );
        }
    }
}
