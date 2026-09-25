package com.theholymatrimony.backend.secureconnect.scheduler;

import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import com.theholymatrimony.backend.secureconnect.service.SecureConnectCallService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SecureConnectBalanceExpiryScheduler {

    private final SecureConnectCallSessionRepository
            callSessionRepository;

    private final SecureConnectCallService
            callService;

    /*
     * Each call is processed through its own transactional
     * service method. Do not put @Transactional on this
     * scheduler: one problematic call must not roll back
     * expiry processing for other calls.
     */
    @Scheduled(
            fixedDelayString =
                    "${secure-connect.call.balance-scan-interval-millis:1000}"
    )
    public void expireConnectedCalls() {

        List<UUID> candidateIds;

        try {
            candidateIds = callSessionRepository
                    .findIdsByStatusAndConnectedAtIsNotNull(
                            CallStatus.ACCEPTED
                    );
        } catch (RuntimeException exception) {
            log.error(
                    "Unable to retrieve Secure Connect expiry candidates.",
                    exception
            );
            return;
        }

        for (UUID callId : candidateIds) {
            try {
                boolean expired =
                        callService.endIfBalanceExhausted(callId);

                if (expired) {
                    log.info(
                            "Secure Connect call expired: {}",
                            callId
                    );
                }
            } catch (RuntimeException exception) {
                log.warn(
                        "Unable to process Secure Connect call expiry: {}",
                        callId,
                        exception
                );
            }
        }
    }
}
