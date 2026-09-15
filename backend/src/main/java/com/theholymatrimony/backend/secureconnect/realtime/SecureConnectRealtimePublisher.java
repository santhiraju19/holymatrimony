package com.theholymatrimony.backend.secureconnect.realtime;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;

public interface SecureConnectRealtimePublisher {

    void publishIncomingCall(
            SecureConnectCallSession call
    );

    void publishAcceptedCall(
            SecureConnectCallSession call
    );

    void publishDeclinedCall(
            SecureConnectCallSession call
    );

    void publishCancelledCall(
            SecureConnectCallSession call
    );

    void publishMissedCall(
            SecureConnectCallSession call
    );

    void publishFailedCall(
            SecureConnectCallSession call
    );

    void publishEndedCall(
            SecureConnectCallSession call,
            User actor
    );
}
