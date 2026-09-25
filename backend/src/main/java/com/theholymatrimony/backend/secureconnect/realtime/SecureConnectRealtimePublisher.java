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

    /*
     * Server-authoritative termination has no human actor.
     *
     * Both participants must receive CALL_ENDED so both media
     * sessions close when a limited Secure Connect balance is
     * exhausted.
     */
    void publishServerEndedCall(
            SecureConnectCallSession call
    );
}
