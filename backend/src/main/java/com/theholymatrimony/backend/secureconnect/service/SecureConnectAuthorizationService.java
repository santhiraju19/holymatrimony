package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.secureconnect.dto.SecureConnectAuthorizationResponse;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;

import java.util.UUID;

public interface SecureConnectAuthorizationService {

    SecureConnectAuthorizationResponse authorizeInitiation(
            UUID callerUserId,
            UUID calleeUserId,
            CallMediaType mediaType
    );
}
