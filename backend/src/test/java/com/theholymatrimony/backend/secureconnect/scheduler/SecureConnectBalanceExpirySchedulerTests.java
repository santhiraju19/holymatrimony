package com.theholymatrimony.backend.secureconnect.scheduler;

import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import com.theholymatrimony.backend.secureconnect.service.SecureConnectCallService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.*;

class SecureConnectBalanceExpirySchedulerTests {

    private SecureConnectCallSessionRepository repository;
    private SecureConnectCallService callService;
    private SecureConnectBalanceExpiryScheduler scheduler;

    @BeforeEach
    void setUp() {
        repository = mock(SecureConnectCallSessionRepository.class);
        callService = mock(SecureConnectCallService.class);

        scheduler = new SecureConnectBalanceExpiryScheduler(
                repository,
                callService
        );
    }

    @Test
    void processesConnectedCalls() {
        UUID first = UUID.randomUUID();
        UUID second = UUID.randomUUID();

        when(repository.findIdsByStatusAndConnectedAtIsNotNull(
                CallStatus.ACCEPTED
        )).thenReturn(List.of(first, second));

        when(callService.endIfBalanceExhausted(first))
                .thenReturn(true);

        when(callService.endIfBalanceExhausted(second))
                .thenReturn(false);

        scheduler.expireConnectedCalls();

        verify(callService).endIfBalanceExhausted(first);
        verify(callService).endIfBalanceExhausted(second);
    }

    @Test
    void continuesWhenOneCallFails() {
        UUID first = UUID.randomUUID();
        UUID second = UUID.randomUUID();

        when(repository.findIdsByStatusAndConnectedAtIsNotNull(
                CallStatus.ACCEPTED
        )).thenReturn(List.of(first, second));

        when(callService.endIfBalanceExhausted(first))
                .thenThrow(new IllegalStateException("Test failure"));

        assertDoesNotThrow(scheduler::expireConnectedCalls);

        verify(callService).endIfBalanceExhausted(second);
    }

    @Test
    void handlesCandidateQueryFailure() {
        when(repository.findIdsByStatusAndConnectedAtIsNotNull(
                CallStatus.ACCEPTED
        )).thenThrow(new IllegalStateException("Test database failure"));

        assertDoesNotThrow(scheduler::expireConnectedCalls);

        verifyNoInteractions(callService);
    }

    @Test
    void doesNothingWhenNoCallsAreConnected() {
        when(repository.findIdsByStatusAndConnectedAtIsNotNull(
                CallStatus.ACCEPTED
        )).thenReturn(List.of());

        scheduler.expireConnectedCalls();

        verifyNoInteractions(callService);
    }
}
