package com.theholymatrimony.backend.secureconnect.scheduler;

import com.theholymatrimony.backend.secureconnect.config.SecureConnectCallProperties;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import com.theholymatrimony.backend.secureconnect.service.SecureConnectCallService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SecureConnectMissedCallScheduler {

    private final SecureConnectCallSessionRepository
            callSessionRepository;

    private final SecureConnectCallService
            callService;

    private final SecureConnectCallProperties
            properties;

    @Scheduled(
            fixedDelayString =
                    "${secure-connect.call.missed-scan-interval-millis:5000}"
    )
    public void expireRingingCalls() {
        LocalDateTime cutoff =
                LocalDateTime.now()
                        .minusSeconds(
                                properties
                                        .getRingTimeoutSeconds()
                        );

        List<UUID> candidateIds =
                callSessionRepository
                        .findIdsByStatusAndInitiatedAtBefore(
                                CallStatus.RINGING,
                                cutoff
                        );

        for (UUID callId : candidateIds) {
            try {
                callService
                        .markMissedIfStillRinging(
                                callId
                        );
            } catch (RuntimeException exception) {
                /*
                 * One malformed/transient call must not prevent
                 * other expired calls from being processed.
                 */
                log.warn(
                        "Unable to expire Secure Connect call {}",
                        callId,
                        exception
                );
            }
        }
    }
}
