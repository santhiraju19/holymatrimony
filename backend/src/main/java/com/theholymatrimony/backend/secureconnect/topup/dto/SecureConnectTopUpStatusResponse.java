package com.theholymatrimony.backend.secureconnect.topup.dto;

import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;

import java.util.UUID;

public record SecureConnectTopUpStatusResponse(
        UUID topUpPaymentId,
        CallMediaType mediaType,
        int minutes,
        long seconds,
        int amount,
        String currency,
        PaymentStatus status
) {
}
