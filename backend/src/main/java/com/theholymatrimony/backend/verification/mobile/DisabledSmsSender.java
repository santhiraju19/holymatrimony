package com.theholymatrimony.backend.verification.mobile;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnMissingBean(SmsSender.class)
public class DisabledSmsSender
        implements SmsSender {

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
