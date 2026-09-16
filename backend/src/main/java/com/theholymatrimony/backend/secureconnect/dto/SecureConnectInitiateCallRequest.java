package com.theholymatrimony.backend.secureconnect.dto;

import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SecureConnectInitiateCallRequest(
        @NotNull
        UUID calleeUserId,

        @NotNull
        CallMediaType mediaType
) {
}
