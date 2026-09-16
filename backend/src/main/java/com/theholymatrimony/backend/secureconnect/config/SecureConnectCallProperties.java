package com.theholymatrimony.backend.secureconnect.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "secure-connect.call")
public class SecureConnectCallProperties {

    private long ringTimeoutSeconds = 45;
    private long missedScanIntervalMillis = 5000;

    public long getRingTimeoutSeconds() {
        return ringTimeoutSeconds;
    }

    public void setRingTimeoutSeconds(
            long ringTimeoutSeconds
    ) {
        if (ringTimeoutSeconds < 5) {
            throw new IllegalArgumentException(
                    "Secure Connect ring timeout must be at least 5 seconds."
            );
        }

        this.ringTimeoutSeconds =
                ringTimeoutSeconds;
    }

    public long getMissedScanIntervalMillis() {
        return missedScanIntervalMillis;
    }

    public void setMissedScanIntervalMillis(
            long missedScanIntervalMillis
    ) {
        if (missedScanIntervalMillis < 1000) {
            throw new IllegalArgumentException(
                    "Secure Connect missed-call scan interval must be at least 1000 ms."
            );
        }

        this.missedScanIntervalMillis =
                missedScanIntervalMillis;
    }
}
