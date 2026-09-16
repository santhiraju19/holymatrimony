package com.theholymatrimony.backend.secureconnect.dto;

import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;

public record SecureConnectMediaCredentials(
        String serverUrl,
        String participantToken,
        String roomName,
        String participantIdentity,
        CallMediaType mediaType
) {
}
