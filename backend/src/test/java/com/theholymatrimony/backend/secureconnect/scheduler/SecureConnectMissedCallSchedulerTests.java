package com.theholymatrimony.backend.secureconnect.scheduler;

import com.theholymatrimony.backend.secureconnect.config.SecureConnectCallProperties;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import com.theholymatrimony.backend.secureconnect.service.SecureConnectCallService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecureConnectMissedCallSchedulerTests {

    @Mock
    private SecureConnectCallSessionRepository
            callSessionRepository;

    @Mock
    private SecureConnectCallService
            callService;

    private SecureConnectCallProperties properties;

    private SecureConnectMissedCallScheduler scheduler;

    @BeforeEach
    void setUp() {
        properties =
                new SecureConnectCallProperties();

        properties.setRingTimeoutSeconds(45);
        properties.setMissedScanIntervalMillis(5000);

        scheduler =
                new SecureConnectMissedCallScheduler(
                        callSessionRepository,
                        callService,
                        properties
                );
    }

    @Test
    void expireRingingCallsProcessesEveryExpiredCandidate() {
        UUID first = UUID.randomUUID();
        UUID second = UUID.randomUUID();

        when(
                callSessionRepository
                        .findIdsByStatusAndInitiatedAtBefore(
                                eq(CallStatus.RINGING),
                                any(LocalDateTime.class)
                        )
        ).thenReturn(
                List.of(first, second)
        );

        scheduler.expireRingingCalls();

        verify(callService)
                .markMissedIfStillRinging(first);

        verify(callService)
                .markMissedIfStillRinging(second);
    }

    @Test
    void expireRingingCallsDoesNothingWhenThereAreNoCandidates() {
        when(
                callSessionRepository
                        .findIdsByStatusAndInitiatedAtBefore(
                                eq(CallStatus.RINGING),
                                any(LocalDateTime.class)
                        )
        ).thenReturn(List.of());

        scheduler.expireRingingCalls();

        verify(callService, never())
                .markMissedIfStillRinging(any());
    }

    @Test
    void expireRingingCallsContinuesWhenOneCandidateFails() {
        UUID first = UUID.randomUUID();
        UUID second = UUID.randomUUID();

        when(
                callSessionRepository
                        .findIdsByStatusAndInitiatedAtBefore(
                                eq(CallStatus.RINGING),
                                any(LocalDateTime.class)
                        )
        ).thenReturn(
                List.of(first, second)
        );

        doThrow(
                new IllegalStateException(
                        "temporary failure"
                )
        ).when(callService)
                .markMissedIfStillRinging(first);

        scheduler.expireRingingCalls();

        verify(callService)
                .markMissedIfStillRinging(first);

        verify(callService)
                .markMissedIfStillRinging(second);
    }
}
