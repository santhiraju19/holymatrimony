package com.theholymatrimony.backend.secureconnect.termination;

import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecureConnectMediaTerminationQueue {

    private final SecureConnectMediaTerminationRepository repository;

    /**
     * Must be invoked inside the transaction that ends the call.
     * The database commits the call status and termination request together.
     */
    @Transactional(propagation =
            org.springframework.transaction.annotation.Propagation.MANDATORY)
    public void enqueue(SecureConnectCallSession call) {

        if (call == null || call.getId() == null) {
            throw new IllegalArgumentException(
                    "A persisted Secure Connect call is required."
            );
        }

        if (!"LIVEKIT".equalsIgnoreCase(call.getProvider())) {
            return;
        }

        String roomId = call.getProviderRoomId();

        if (!StringUtils.hasText(roomId)) {
            return;
        }

        String expectedRoom = "sc_" + call.getId();

        if (!expectedRoom.equals(roomId)) {
            throw new IllegalStateException(
                    "Secure Connect room does not match the call."
            );
        }

        repository.enqueueIfAbsent(
                UUID.randomUUID(),
                call.getId(),
                "LIVEKIT",
                roomId
        );
    }
}
