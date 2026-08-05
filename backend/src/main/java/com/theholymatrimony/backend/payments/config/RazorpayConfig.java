package com.theholymatrimony.backend.payments.config;

import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(
        name = "payments.enabled",
        havingValue = "true"
)
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

        if (
                !keyId.startsWith(TEST_KEY_PREFIX)
                        && !keyId.startsWith(LIVE_KEY_PREFIX)
        ) {
            throw new IllegalStateException(
                    "Invalid Razorpay Key ID. It must start with "
                            + "'rzp_test_' or 'rzp_live_'."
            );
        }

        return new RazorpayClient(
                keyId,
                keySecret
        );
    }

    private String sanitize(
            String value
    ) {
        if (value == null) {
            return "";
        }

        return value
                .trim()
                .replace("\"", "")
                .replace("'", "");
    }
}