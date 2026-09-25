package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.secureconnect.dto.SecureConnectCallResponse;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;

import java.util.List;
import java.util.UUID;

public interface SecureConnectCallService {

    SecureConnectCallResponse initiateCall(
            String callerEmail,
            UUID calleeUserId,
            CallMediaType mediaType
    );

    SecureConnectCallResponse acceptCall(
            String authenticatedEmail,
            UUID callId
    );

    SecureConnectCallResponse markConnected(
            String authenticatedEmail,
            UUID callId
    );

    SecureConnectCallResponse declineCall(
            String authenticatedEmail,
            UUID callId
    );

    SecureConnectCallResponse cancelCall(
            String authenticatedEmail,
            UUID callId
    );

    SecureConnectCallResponse markMissed(
            UUID callId
    );

    boolean markMissedIfStillRinging(
            UUID callId
    );

    boolean endIfBalanceExhausted(
            UUID callId
    );

    SecureConnectCallResponse failCall(
            UUID callId
    );

    SecureConnectCallResponse endCall(
            String authenticatedEmail,
            UUID callId
    );

    List<SecureConnectCallResponse> getCallHistory(
            String authenticatedEmail
    );
}
