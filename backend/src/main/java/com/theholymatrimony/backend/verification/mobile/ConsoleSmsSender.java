package com.theholymatrimony.backend.verification.mobile;

import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "sms.provider",
        havingValue = "console"
)
@Slf4j
public class ConsoleSmsSender
        implements SmsSender {

    @Override
    public void sendVerificationOtp(
            String mobile,
            String otp
    ) {

        log.warn(
                "DEVELOPMENT SMS OTP for {}: {}",
                mobile,
                otp
        );
    }
}
