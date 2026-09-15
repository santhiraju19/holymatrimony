package com.theholymatrimony.backend.secureconnect.dto;

import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record SecureConnectCallResponse(
        UUID callId,
        UUID callerUserId,
        UUID calleeUserId,
        CallMediaType mediaType,
        CallStatus status,
        LocalDateTime initiatedAt,
        LocalDateTime answeredAt,
        LocalDateTime endedAt,
        Long durationSeconds
) {
}
