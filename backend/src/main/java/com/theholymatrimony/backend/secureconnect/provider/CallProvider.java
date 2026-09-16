package com.theholymatrimony.backend.secureconnect.provider;

import com.theholymatrimony.backend.secureconnect.dto.SecureConnectMediaCredentials;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;

import java.util.UUID;

public interface CallProvider {

    String providerName();

    String roomName(
            SecureConnectCallSession call
    );

    SecureConnectMediaCredentials createParticipantCredentials(
            SecureConnectCallSession call,
            UUID participantUserId
    );
}
