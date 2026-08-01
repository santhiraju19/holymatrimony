package com.theholymatrimony.backend.payments.config;

import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    private static final String TEST_KEY_PREFIX = "rzp_test_";
    private static final String LIVE_KEY_PREFIX = "rzp_live_";

    @Bean
    public RazorpayClient razorpayClient(
            @Value("${razorpay.key.id:}") String rawKeyId,
            @Value("${razorpay.key.secret:}") String rawKeySecret
    ) throws Exception {

        String keyId = sanitize(rawKeyId);
        String keySecret = sanitize(rawKeySecret);

        System.out.println("===== RAZORPAY CONFIGURATION =====");
        System.out.println("Key ID preview: " + maskKeyId(keyId));
        System.out.println("Key ID length: " + keyId.length());
        System.out.println("Key Secret length: " + keySecret.length());
        System.out.println("Test mode: " + keyId.startsWith(TEST_KEY_PREFIX));
        System.out.println("Live mode: " + keyId.startsWith(LIVE_KEY_PREFIX));
        System.out.println("=================================");

        if (keyId.isBlank()) {
            throw new IllegalStateException(
                    "RAZORPAY_KEY_ID is missing."
            );
        }

        if (keySecret.isBlank()) {
            throw new IllegalStateException(
                    "RAZORPAY_KEY_SECRET is missing."
            );
        }

        if (!keyId.startsWith(TEST_KEY_PREFIX)
                && !keyId.startsWith(LIVE_KEY_PREFIX)) {

            if (keySecret.startsWith(TEST_KEY_PREFIX)
                    || keySecret.startsWith(LIVE_KEY_PREFIX)) {
                throw new IllegalStateException(
                        "Razorpay Key ID and Key Secret appear to be swapped."
                );
            }

            throw new IllegalStateException(
                    "Invalid Razorpay Key ID. It must start with "
                            + "'rzp_test_' or 'rzp_live_'."
            );
        }

        return new RazorpayClient(keyId, keySecret);
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }

        return value
                .trim()
                .replace("\"", "")
                .replace("'", "");
    }

    private String maskKeyId(String keyId) {
        if (keyId == null || keyId.isBlank()) {
            return "[empty]";
        }

        if (keyId.length() <= 12) {
            return "[invalid]";
        }

        return keyId.substring(0, 9)
                + "****"
                + keyId.substring(keyId.length() - 4);
    }
}