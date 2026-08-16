package com.theholymatrimony.backend.verification.mobile;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "sms.provider",
        havingValue = "disabled",
        matchIfMissing = true
)
public class DisabledSmsSender implements SmsSender {

    @Override
    public void sendVerificationOtp(
            String mobile,
            String otp
    ) {
        throw new IllegalStateException(
                "SMS delivery is not configured."
        );
    }
}