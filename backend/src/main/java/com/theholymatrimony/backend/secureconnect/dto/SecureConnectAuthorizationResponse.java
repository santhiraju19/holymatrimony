package com.theholymatrimony.backend.secureconnect.dto;

import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;

import java.util.UUID;

public record SecureConnectAuthorizationResponse(
        boolean allowed,
        String code,
        String message,
        UUID membershipId,
        MembershipPlan plan,
        CallMediaType mediaType,
        boolean unlimited,
        long planRemainingSeconds,
        long topUpRemainingSeconds
) {
}
