package com.theholymatrimony.backend.verification.dto;

public record MobileOtpResponse(

        String mobile,

        boolean verified,

        String message
) {
}
