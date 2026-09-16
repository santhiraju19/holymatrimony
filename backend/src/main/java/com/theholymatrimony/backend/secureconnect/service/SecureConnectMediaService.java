package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.secureconnect.dto.SecureConnectMediaCredentials;

import java.util.UUID;

public interface SecureConnectMediaService {

    SecureConnectMediaCredentials createCredentials(
            String authenticatedEmail,
            UUID callId
    );
}
