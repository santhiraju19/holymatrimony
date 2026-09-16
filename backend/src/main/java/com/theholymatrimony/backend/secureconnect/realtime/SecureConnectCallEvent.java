package com.theholymatrimony.backend.secureconnect.realtime;

import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record SecureConnectCallEvent(

        SecureConnectCallEventType eventType,

        UUID callId,

        CallMediaType mediaType,

        CallStatus status,

        SecureConnectCallMember otherMember,

        LocalDateTime occurredAt

) {
}
