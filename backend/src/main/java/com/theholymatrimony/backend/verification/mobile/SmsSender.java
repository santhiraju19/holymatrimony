package com.theholymatrimony.backend.verification.mobile;

public interface SmsSender {

    void sendVerificationOtp(
            String mobile,
            String otp
    );
}
