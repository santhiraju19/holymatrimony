package com.theholymatrimony.backend.secureconnect.dto;

import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;

import java.util.UUID;

public record SecureConnectUsageBalance(
        UUID callSessionId,
        UUID userId,
        CallMediaType mediaType,
        boolean unlimited,
        long planRemainingSeconds,
        long topUpRemainingSeconds,
        long totalRemainingSeconds
) {
}
