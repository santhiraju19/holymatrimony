package com.theholymatrimony.backend.secureconnect.topup.dto;

import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;

public record SecureConnectTopUpPackageResponse(
        String packageCode,
        CallMediaType mediaType,
        int minutes,
        long seconds,
        int amount,
        String currency
) {
}
