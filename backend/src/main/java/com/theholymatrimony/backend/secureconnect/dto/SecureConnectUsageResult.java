package com.theholymatrimony.backend.secureconnect.dto;

import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;

import java.util.UUID;

public record SecureConnectUsageResult(
        UUID callSessionId,
        UUID userId,
        CallMediaType mediaType,
        long requestedSeconds,
        long chargedSeconds,
        long planSecondsUsed,
        long topUpSecondsUsed,
        boolean unlimited,
        boolean alreadyFinalized,
        long planRemainingSeconds,
        long topUpRemainingSeconds
) {
}
