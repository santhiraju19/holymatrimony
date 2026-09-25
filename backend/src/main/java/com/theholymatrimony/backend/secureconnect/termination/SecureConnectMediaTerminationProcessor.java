package com.theholymatrimony.backend.secureconnect.termination;

import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecureConnectMediaTerminationProcessor {

    private final SecureConnectMediaTerminationRepository repository;
    private final SecureConnectCallSessionRepository callRepository;
    private final LiveKitRoomTerminationClient liveKitClient;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public List<UUID> claimNext(UUID claimToken) {
        return repository.claimNextBatch(claimToken, 1);
    }

    @Transactional(readOnly = true)
    public String getClaimedRoom(
            UUID terminationId,
            UUID claimToken
    ) {
        return repository.findById(terminationId)
                .filter(item ->
                        "PROCESSING".equals(item.getStatus())
                )
                .filter(item ->
                        claimToken.equals(item.getClaimToken())
                )
                .map(
                        SecureConnectMediaTermination::getProviderRoomId
                )
                .orElse(null);
    }

    public void terminateRoom(String roomName) {
        if (roomName == null
                || !roomName.matches(
                        "sc_[0-9a-fA-F-]{36}"
                )) {
            throw new IllegalArgumentException(
                    "Invalid Secure Connect room."
            );
        }

        UUID callId = UUID.fromString(
                roomName.substring(3)
        );

        SecureConnectCallSession call =
                callRepository.findById(callId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Call session not found."
                                )
                        );

        if (!roomName.equals(call.getProviderRoomId())
                || !"LIVEKIT".equals(call.getProvider())) {
            throw new IllegalStateException(
                    "LiveKit room does not match call session."
            );
        }

        UUID callerId = call.getCaller().getId();
        UUID calleeId = call.getCallee().getId();

        liveKitClient.removeParticipant(roomName, callerId);
        liveKitClient.removeParticipant(roomName, calleeId);
        liveKitClient.deleteRoom(roomName);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean markCompleted(
            UUID terminationId,
            UUID claimToken
    ) {
        return repository.completeClaim(
                terminationId,
                claimToken
        ) == 1;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean scheduleRetry(
            UUID terminationId,
            UUID claimToken
    ) {
        boolean updated = repository.retryClaim(
                terminationId,
                claimToken
        ) == 1;

        if (updated) {
            log.warn(
                    "LiveKit termination retry scheduled: {}",
                    terminationId
            );
        }

        return updated;
    }
}
