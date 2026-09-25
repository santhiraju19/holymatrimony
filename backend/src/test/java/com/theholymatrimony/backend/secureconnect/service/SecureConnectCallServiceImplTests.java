package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.secureconnect.dto.SecureConnectUsageBalance;
import com.theholymatrimony.backend.secureconnect.balance.service.SecureConnectBalanceService;
import com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectMediaBalanceResponse;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectAuthorizationResponse;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectUsageResult;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import com.theholymatrimony.backend.secureconnect.realtime.SecureConnectRealtimePublisher;
import com.theholymatrimony.backend.secureconnect.termination.SecureConnectMediaTerminationQueue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SecureConnectCallServiceImplTests {

    @Test
    void balanceExpiryLeavesCallRunningWhileBalanceRemains() {
        call.setStatus(CallStatus.ACCEPTED);

        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(30);

        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        60L,
                        0L,
                        60L
                )
        );

        boolean ended =
                service.endIfBalanceExhausted(
                        call.getId()
                );

        assertFalse(ended);
        assertEquals(
                CallStatus.ACCEPTED,
                call.getStatus()
        );

        assertNull(call.getEndedAt());

        verify(usageService, never())
                .finalizeUsage(any(), anyLong());

        verify(realtimePublisher, never())
                .publishServerEndedCall(any());
    }

    @Test
    void balanceExpiryEndsAtExactPaidBoundary() {
        call.setStatus(CallStatus.ACCEPTED);

        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(90);

        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        40L,
                        20L,
                        60L
                )
        );

        when(usageService.finalizeUsage(
                call.getId(),
                60L
        )).thenReturn(null);

        boolean ended =
                service.endIfBalanceExhausted(
                        call.getId()
                );

        assertTrue(ended);

        assertEquals(
                CallStatus.ENDED,
                call.getStatus()
        );

        assertEquals(
                60L,
                call.getDurationSeconds()
        );

        assertEquals(
                connectedAt.plusSeconds(60L),
                call.getEndedAt()
        );

        verify(usageService).finalizeUsage(
                call.getId(),
                60L
        );

        verify(realtimePublisher)
                .publishServerEndedCall(call);
    }

    @Test
    void zeroBalanceEndsImmediatelyWithoutCharging() {
        call.setStatus(CallStatus.ACCEPTED);

        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(5);

        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        0L,
                        0L,
                        0L
                )
        );

        boolean ended =
                service.endIfBalanceExhausted(
                        call.getId()
                );

        assertTrue(ended);

        assertEquals(
                CallStatus.ENDED,
                call.getStatus()
        );

        assertEquals(
                0L,
                call.getDurationSeconds()
        );

        assertEquals(
                connectedAt,
                call.getEndedAt()
        );

        verify(usageService, never())
                .finalizeUsage(any(), anyLong());

        verify(realtimePublisher)
                .publishServerEndedCall(call);
    }

    @Test
    void platinumCallNeverExpiresForBalance() {
        call.setStatus(CallStatus.ACCEPTED);

        call.setConnectedAt(
                LocalDateTime.now().minusHours(3)
        );
        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        true,
                        0L,
                        0L,
                        Long.MAX_VALUE
                )
        );

        boolean ended =
                service.endIfBalanceExhausted(
                        call.getId()
                );

        assertFalse(ended);

        assertEquals(
                CallStatus.ACCEPTED,
                call.getStatus()
        );

        verify(usageService, never())
                .finalizeUsage(any(), anyLong());

        verify(realtimePublisher, never())
                .publishServerEndedCall(any());
    }

    @Test
    void membershipExpiryTerminatesPlatinumCall() {
        call.setStatus(CallStatus.ACCEPTED);

        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(120);

        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        membership.setPlan(MembershipPlan.PLATINUM);
        membership.setExpiryDate(
                connectedAt.plusSeconds(60)
        );

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        true,
                        0L,
                        0L,
                        Long.MAX_VALUE
                )
        );

        assertTrue(
                service.endIfBalanceExhausted(call.getId())
        );

        assertEquals(
                connectedAt.plusSeconds(60),
                call.getEndedAt()
        );
        assertEquals(
                60L,
                call.getDurationSeconds()
        );

        verify(usageService).finalizeUsage(
                call.getId(),
                60L
        );
    }

    @Test
    void membershipExpiryPrecedesRemainingBalance() {
        call.setStatus(CallStatus.ACCEPTED);

        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(120);

        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        membership.setExpiryDate(
                connectedAt.plusSeconds(45)
        );

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        120L,
                        0L,
                        120L
                )
        );

        assertTrue(
                service.endIfBalanceExhausted(call.getId())
        );

        assertEquals(
                connectedAt.plusSeconds(45),
                call.getEndedAt()
        );
        assertEquals(
                45L,
                call.getDurationSeconds()
        );

        verify(usageService).finalizeUsage(
                call.getId(),
                45L
        );
    }

    @Test
    void alreadyEndedCallIsIgnoredByBalanceExpiry() {
        call.setStatus(CallStatus.ENDED);

        call.setConnectedAt(
                LocalDateTime.now().minusSeconds(60)
        );

        call.setEndedAt(
                LocalDateTime.now()
        );

        call.setDurationSeconds(60L);

        boolean ended =
                service.endIfBalanceExhausted(
                        call.getId()
                );

        assertFalse(ended);

        verifyNoInteractions(usageService);

        verify(realtimePublisher, never())
                .publishServerEndedCall(any());
    }

    @Test
    void acceptedButNotConnectedCallIsIgnoredByBalanceExpiry() {
        call.setStatus(CallStatus.ACCEPTED);
        call.setConnectedAt(null);

        boolean ended =
                service.endIfBalanceExhausted(
                        call.getId()
                );

        assertFalse(ended);

        verifyNoInteractions(usageService);

        verify(realtimePublisher, never())
                .publishServerEndedCall(any());
    }

    private UserRepository userRepository;
    private SecureConnectCallSessionRepository callSessionRepository;
    private SecureConnectAuthorizationService authorizationService;
    private SecureConnectUsageService usageService;
    private SecureConnectRealtimePublisher realtimePublisher;
    private SecureConnectMediaTerminationQueue terminationQueue;

    private MembershipRepository membershipRepository;
    private SecureConnectBalanceService balanceService;

    private SecureConnectCallServiceImpl service;

    private UUID callerId;
    private UUID calleeId;
    private UUID outsiderId;

    private User caller;
    private User callee;
    private User outsider;

    private SecureConnectCallSession call;

    private Membership membership;

    @BeforeEach
    void setUp() {
        userRepository =
                mock(UserRepository.class);

        callSessionRepository =
                mock(SecureConnectCallSessionRepository.class);

        authorizationService =
                mock(SecureConnectAuthorizationService.class);

        usageService =
                mock(SecureConnectUsageService.class);

        realtimePublisher =
                mock(SecureConnectRealtimePublisher.class);

        terminationQueue =
                mock(SecureConnectMediaTerminationQueue.class);

        membershipRepository =
                mock(MembershipRepository.class);

        balanceService = mock(SecureConnectBalanceService.class);

        service =
                new SecureConnectCallServiceImpl(
                        userRepository,
                        callSessionRepository,
                        authorizationService,
                        usageService,
                        realtimePublisher,
                        terminationQueue,
                        membershipRepository,
                        balanceService
                );

        callerId = UUID.randomUUID();
        calleeId = UUID.randomUUID();
        outsiderId = UUID.randomUUID();

        caller = User.builder()
                .id(callerId)
                .fullName("Caller")
                .email("caller@example.com")
                .password("password")
                .enabled(true)
                .build();

        lenient().when(
                userRepository.findForUpdate(callerId)
        ).thenReturn(Optional.of(caller));

        callee = User.builder()
                .id(calleeId)
                .fullName("Callee")
                .email("callee@example.com")
                .password("password")
                .enabled(true)
                .build();

        outsider = User.builder()
                .id(outsiderId)
                .fullName("Outsider")
                .email("outsider@example.com")
                .password("password")
                .enabled(true)
                .build();

        membership = Membership.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .plan(MembershipPlan.GOLD)
                .status(MembershipStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusDays(1))
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build();

        SecureConnectMediaBalanceResponse availableBalance =
                new SecureConnectMediaBalanceResponse(
                        CallMediaType.AUDIO,
                        true,
                        false,
                        3600L,
                        0L,
                        3600L,
                        0L,
                        3600L
                );

        lenient().when(
                balanceService.getLockedBalanceForMembership(
                        caller,
                        membership,
                        CallMediaType.AUDIO
                )
        ).thenReturn(availableBalance);

        call = SecureConnectCallSession.builder()
                .id(UUID.randomUUID())
                .caller(caller)
                .callee(callee)
                .mediaType(CallMediaType.AUDIO)
                .status(CallStatus.RINGING)
                .initiatedAt(
                        LocalDateTime.now()
                                .minusMinutes(1)
                )
                .durationSeconds(0L)
                .build();

        when(userRepository.findByEmail(
                "caller@example.com"
        )).thenReturn(
                Optional.of(caller)
        );

        when(userRepository.findByEmail(
                "callee@example.com"
        )).thenReturn(
                Optional.of(callee)
        );

        when(userRepository.findByEmail(
                "outsider@example.com"
        )).thenReturn(
                Optional.of(outsider)
        );

        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        callerId,
                        MembershipStatus.ACTIVE
                )).thenReturn(Optional.of(membership));

        when(callSessionRepository.findForUpdate(
                call.getId()
        )).thenReturn(
                Optional.of(call)
        );

        when(callSessionRepository.save(any(
                SecureConnectCallSession.class
        ))).thenAnswer(
                invocation ->
                        invocation.getArgument(0)
        );
    }


    @Test
    void decliningCallEnqueuesMediaTermination() {
        service.declineCall("callee@example.com", call.getId());

        verify(terminationQueue).enqueue(call);
        assertEquals(CallStatus.DECLINED, call.getStatus());
    }

    @Test
    void cancellingCallEnqueuesMediaTermination() {
        service.cancelCall("caller@example.com", call.getId());

        verify(terminationQueue).enqueue(call);
        assertEquals(CallStatus.CANCELLED, call.getStatus());
    }

    @Test
    void missedCallEnqueuesMediaTermination() {
        service.markMissed(call.getId());

        verify(terminationQueue).enqueue(call);
        assertEquals(CallStatus.MISSED, call.getStatus());
    }

    @Test
    void scheduledMissedCallEnqueuesMediaTermination() {
        assertTrue(
                service.markMissedIfStillRinging(call.getId())
        );

        verify(terminationQueue).enqueue(call);
        assertEquals(CallStatus.MISSED, call.getStatus());
    }

    @Test
    void failedCallEnqueuesMediaTermination() {
        service.failCall(call.getId());

        verify(terminationQueue).enqueue(call);
        assertEquals(CallStatus.FAILED, call.getStatus());
    }

    @Test
    void unconnectedEndedCallEnqueuesMediaTermination() {
        call.setStatus(CallStatus.ACCEPTED);

        service.endCall("caller@example.com", call.getId());

        verify(terminationQueue).enqueue(call);
        assertEquals(CallStatus.ENDED, call.getStatus());
        assertEquals(0L, call.getDurationSeconds());
    }

    @Test
    void activeCallDoesNotEnqueueMediaTermination() {
        call.setStatus(CallStatus.ACCEPTED);
        call.setConnectedAt(LocalDateTime.now().minusSeconds(5));
        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(call.getId()))
                .thenReturn(
                        new SecureConnectUsageBalance(
                                call.getId(),
                                callerId,
                                CallMediaType.AUDIO,
                                false,
                                60L,
                                0L,
                                60L
                        )
                );

        assertFalse(
                service.endIfBalanceExhausted(call.getId())
        );

        verify(terminationQueue, never()).enqueue(any());
    }

    @Test
    void authorizedInitiationCreatesRingingCall() {
        SecureConnectAuthorizationResponse authorization =
                new SecureConnectAuthorizationResponse(
                        true,
                        "ALLOWED",
                        "Secure Connect call is allowed.",
                        UUID.randomUUID(),
                        null,
                        CallMediaType.AUDIO,
                        false,
                        600L,
                        0L
                );

        when(authorizationService.authorizeInitiation(
                callerId,
                calleeId,
                CallMediaType.AUDIO
        )).thenReturn(authorization);

        when(userRepository.findById(calleeId))
                .thenReturn(
                        Optional.of(callee)
                );

        when(callSessionRepository
                .existsByCallerIdAndCalleeIdAndStatus(
                        callerId,
                        calleeId,
                        CallStatus.RINGING
                ))
                .thenReturn(false);

        service.initiateCall(
                "caller@example.com",
                calleeId,
                CallMediaType.AUDIO
        );

        ArgumentCaptor<SecureConnectCallSession> captor =
                ArgumentCaptor.forClass(
                        SecureConnectCallSession.class
                );

        verify(callSessionRepository)
                .save(captor.capture());

        SecureConnectCallSession saved =
                captor.getValue();

        assertEquals(
                callerId,
                saved.getCaller().getId()
        );

        assertEquals(
                calleeId,
                saved.getCallee().getId()
        );

        assertEquals(
                CallMediaType.AUDIO,
                saved.getMediaType()
        );

        assertEquals(
                CallStatus.RINGING,
                saved.getStatus()
        );

        assertNotNull(saved.getInitiatedAt());

        verifyNoInteractions(usageService);
    }

    @Test
    void deniedAuthorizationDoesNotCreateCall() {
        SecureConnectAuthorizationResponse authorization =
                new SecureConnectAuthorizationResponse(
                        false,
                        "CALL_TYPE_NOT_INCLUDED",
                        "Video calling is not included in this membership.",
                        UUID.randomUUID(),
                        null,
                        CallMediaType.VIDEO,
                        false,
                        0L,
                        0L
                );

        when(authorizationService.authorizeInitiation(
                callerId,
                calleeId,
                CallMediaType.VIDEO
        )).thenReturn(authorization);

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.initiateCall(
                                        "caller@example.com",
                                        calleeId,
                                        CallMediaType.VIDEO
                                )
                );

        assertEquals(
                authorization.message(),
                exception.getMessage()
        );

        verify(callSessionRepository, never())
                .save(any());

        verifyNoInteractions(usageService);
    }

    @Test
    void calleeCanAcceptRingingCall() {
        service.acceptCall(
                "callee@example.com",
                call.getId()
        );

        assertEquals(
                CallStatus.ACCEPTED,
                call.getStatus()
        );

        assertNotNull(call.getAnsweredAt());
        assertNull(call.getConnectedAt());

        verify(callSessionRepository)
                .save(call);

        verifyNoInteractions(usageService);

        verify(realtimePublisher)
                .publishAcceptedCall(call);
    }

    @Test
    void participantCanMarkAcceptedCallConnected() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(5)
        );

        assertNull(call.getConnectedAt());

        var response =
                service.markConnected(
                        "caller@example.com",
                        call.getId()
                );

        assertNotNull(call.getConnectedAt());
        assertSame(membership, call.getConnectedMembership());
        assertEquals(
                call.getConnectedAt(),
                response.connectedAt()
        );
        assertEquals(
                CallStatus.ACCEPTED,
                response.status()
        );
        assertEquals(
                0L,
                response.durationSeconds()
        );

        verify(callSessionRepository)
                .save(call);

        verifyNoInteractions(usageService);
        verify(userRepository, times(1))
                .findForUpdate(callerId);

    }

    @Test
    void exhaustedMinutesPreventFirstConnection() {
        call.setStatus(CallStatus.ACCEPTED);

        SecureConnectMediaBalanceResponse exhausted =
                new SecureConnectMediaBalanceResponse(
                        CallMediaType.AUDIO,
                        true,
                        false,
                        3600L,
                        3600L,
                        0L,
                        0L,
                        0L
                );

        when(balanceService.getLockedBalanceForMembership(
                caller,
                membership,
                CallMediaType.AUDIO
        )).thenReturn(exhausted);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> service.markConnected(
                        "caller@example.com",
                        call.getId()
                )
        );

        assertEquals(
                "No available Secure Connect calling minutes.",
                exception.getMessage()
        );

        assertNull(call.getConnectedAt());
        assertNull(call.getConnectedMembership());

        verify(callSessionRepository, never()).save(any());
        verifyNoInteractions(usageService);
    }

    @Test
    void availableMinutesPermitFirstConnection() {
        call.setStatus(CallStatus.ACCEPTED);

        SecureConnectMediaBalanceResponse available =
                new SecureConnectMediaBalanceResponse(
                        CallMediaType.AUDIO,
                        true,
                        false,
                        3600L,
                        3540L,
                        60L,
                        30L,
                        90L
                );

        when(balanceService.getLockedBalanceForMembership(
                caller,
                membership,
                CallMediaType.AUDIO
        )).thenReturn(available);

        service.markConnected(
                "callee@example.com",
                call.getId()
        );

        assertNotNull(call.getConnectedAt());
        assertSame(membership, call.getConnectedMembership());

        verify(balanceService).getLockedBalanceForMembership(
                caller,
                membership,
                CallMediaType.AUDIO
        );

        verify(callSessionRepository).save(call);
        verifyNoInteractions(usageService);
    }

    @Test
    void platinumConnectsWithUnlimitedBalance() {
        call.setStatus(CallStatus.ACCEPTED);
        membership.setPlan(MembershipPlan.PLATINUM);

        SecureConnectMediaBalanceResponse unlimited =
                new SecureConnectMediaBalanceResponse(
                        CallMediaType.AUDIO,
                        true,
                        true,
                        0L,
                        0L,
                        0L,
                        0L,
                        Long.MAX_VALUE
                );

        when(balanceService.getLockedBalanceForMembership(
                caller,
                membership,
                CallMediaType.AUDIO
        )).thenReturn(unlimited);

        service.markConnected(
                "caller@example.com",
                call.getId()
        );

        assertNotNull(call.getConnectedAt());
        assertSame(membership, call.getConnectedMembership());

        verify(balanceService).getLockedBalanceForMembership(
                caller,
                membership,
                CallMediaType.AUDIO
        );

        verify(callSessionRepository).save(call);
        verifyNoInteractions(usageService);
    }

    @Test
    void missingMembershipPreventsFirstConnection() {
        call.setStatus(CallStatus.ACCEPTED);

        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        callerId,
                        MembershipStatus.ACTIVE
                )).thenReturn(Optional.empty());

        assertThrows(
                IllegalStateException.class,
                () -> service.markConnected(
                        "caller@example.com",
                        call.getId()
                )
        );

        assertNull(call.getConnectedAt());
        assertNull(call.getConnectedMembership());

        verify(callSessionRepository, never()).save(any());
    }


    @Test
    void expiredMembershipPreventsFirstConnection() {
        call.setStatus(CallStatus.ACCEPTED);

        membership.setExpiryDate(
                LocalDateTime.now().minusSeconds(1)
        );

        assertThrows(
                IllegalStateException.class,
                () -> service.markConnected(
                        "caller@example.com",
                        call.getId()
                )
        );

        assertNull(call.getConnectedAt());
        assertNull(call.getConnectedMembership());

        verify(callSessionRepository, never()).save(any());
    }

    @Test
    void membershipRenewalDoesNotReplaceConnectedMembership() {
        call.setStatus(CallStatus.ACCEPTED);

        LocalDateTime originalConnectedAt =
                LocalDateTime.now().minusMinutes(5);

        call.setConnectedAt(originalConnectedAt);
        call.setConnectedMembership(membership);

        Membership renewedMembership = Membership.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .plan(MembershipPlan.PLATINUM)
                .status(MembershipStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusMinutes(1))
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build();

        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        callerId,
                        MembershipStatus.ACTIVE
                )).thenReturn(Optional.of(renewedMembership));

        service.markConnected(
                "callee@example.com",
                call.getId()
        );

        assertEquals(
                originalConnectedAt,
                call.getConnectedAt()
        );

        assertSame(
                membership,
                call.getConnectedMembership()
        );

        verifyNoInteractions(membershipRepository);

        verify(callSessionRepository, never()).save(any());
    }

    @Test
    void markConnectedIsIdempotent() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(10)
        );

        LocalDateTime originalConnectedAt =
                LocalDateTime.now()
                        .minusSeconds(5);

        call.setConnectedAt(
                originalConnectedAt
        );
        call.setConnectedMembership(membership);

        var response =
                service.markConnected(
                        "callee@example.com",
                        call.getId()
                );

        assertEquals(
                originalConnectedAt,
                call.getConnectedAt()
        );
        assertEquals(
                originalConnectedAt,
                response.connectedAt()
        );

        verify(
                callSessionRepository,
                never()
        ).save(any());

        assertSame(membership, call.getConnectedMembership());

        verifyNoInteractions(usageService);
        verifyNoInteractions(membershipRepository);
        verify(userRepository, never())
                .findForUpdate(any(UUID.class));

    }

    @Test
    void calleeCanDeclineWithoutUsage() {
        service.declineCall(
                "callee@example.com",
                call.getId()
        );

        assertEquals(
                CallStatus.DECLINED,
                call.getStatus()
        );

        assertEquals(
                0L,
                call.getDurationSeconds()
        );

        assertNotNull(call.getEndedAt());

        verifyNoInteractions(usageService);
    
        verify(realtimePublisher)
                .publishDeclinedCall(call);
    }

    @Test
    void callerCanCancelWithoutUsage() {
        service.cancelCall(
                "caller@example.com",
                call.getId()
        );

        assertEquals(
                CallStatus.CANCELLED,
                call.getStatus()
        );

        assertEquals(
                0L,
                call.getDurationSeconds()
        );

        assertNotNull(call.getEndedAt());

        verifyNoInteractions(usageService);
    
        verify(realtimePublisher)
                .publishCancelledCall(call);
    }

    @Test
    void ringingCallCanBecomeMissedWithoutUsage() {
        service.markMissed(
                call.getId()
        );

        assertEquals(
                CallStatus.MISSED,
                call.getStatus()
        );

        assertEquals(
                0L,
                call.getDurationSeconds()
        );

        assertNotNull(call.getEndedAt());

        verifyNoInteractions(usageService);
    
        verify(realtimePublisher)
                .publishMissedCall(call);
    }

    @Test
    void ringingCallCanFailWithoutUsage() {
        service.failCall(
                call.getId()
        );

        assertEquals(
                CallStatus.FAILED,
                call.getStatus()
        );

        assertEquals(
                0L,
                call.getDurationSeconds()
        );

        assertNotNull(call.getEndedAt());

        verifyNoInteractions(usageService);
    
        verify(realtimePublisher)
                .publishFailedCall(call);
    }

    @Test
    void acceptedCallCanFailBeforeMediaConnectionWithoutUsage() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(30)
        );

        assertNull(call.getConnectedAt());

        service.failCall(
                call.getId()
        );

        assertEquals(
                CallStatus.FAILED,
                call.getStatus()
        );

        assertEquals(
                0L,
                call.getDurationSeconds()
        );

        assertNotNull(call.getEndedAt());

        verifyNoInteractions(usageService);

        verify(realtimePublisher)
                .publishFailedCall(call);
    }

    @Test
    void acceptedConnectedCallFailureFinalizesUsage() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(35)
        );

        call.setConnectedAt(
                LocalDateTime.now()
                        .minusSeconds(30)
        );

        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        3600L,
                        0L,
                        3600L
                )
        );

        service.failCall(
                call.getId()
        );

        assertEquals(
                CallStatus.FAILED,
                call.getStatus()
        );

        assertTrue(
                call.getDurationSeconds() >= 29L
        );

        assertNotNull(call.getEndedAt());

        verify(usageService)
                .finalizeUsage(
                        eq(call.getId()),
                        longThat(seconds -> seconds >= 29L)
                );

        verify(realtimePublisher)
                .publishFailedCall(call);
    }


    @Test
    void delayedFailureStopsAtAvailableBalance() {
        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(120);

        call.setStatus(CallStatus.ACCEPTED);
        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        30L,
                        0L,
                        30L
                )
        );

        var response = service.failCall(call.getId());

        assertEquals(CallStatus.FAILED, response.status());
        assertEquals(30L, response.durationSeconds());
        assertEquals(
                connectedAt.plusSeconds(30),
                response.endedAt()
        );

        verify(usageService).finalizeUsage(
                call.getId(),
                30L
        );

        verify(realtimePublisher).publishFailedCall(call);
    }

    @Test
    void delayedFailureStopsAtMembershipExpiry() {
        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(120);

        membership.setExpiryDate(
                connectedAt.plusSeconds(45)
        );

        call.setStatus(CallStatus.ACCEPTED);
        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        120L,
                        0L,
                        120L
                )
        );

        var response = service.failCall(call.getId());

        assertEquals(CallStatus.FAILED, response.status());
        assertEquals(45L, response.durationSeconds());
        assertEquals(
                connectedAt.plusSeconds(45),
                response.endedAt()
        );

        verify(usageService).finalizeUsage(
                call.getId(),
                45L
        );

        verify(realtimePublisher).publishFailedCall(call);
    }

    @Test
    void zeroBalanceFailureDoesNotChargeUsage() {
        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(30);

        call.setStatus(CallStatus.ACCEPTED);
        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        0L,
                        0L,
                        0L
                )
        );

        var response = service.failCall(call.getId());

        assertEquals(CallStatus.FAILED, response.status());
        assertEquals(0L, response.durationSeconds());
        assertEquals(connectedAt, response.endedAt());

        verify(usageService, never())
                .finalizeUsage(any(), anyLong());

        verify(realtimePublisher).publishFailedCall(call);
    }

    @Test
    void acceptedCallCanEndBeforeMediaConnectionWithoutUsage() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(30)
        );

        assertNull(call.getConnectedAt());

        var response =
                service.endCall(
                        "caller@example.com",
                        call.getId()
                );

        assertEquals(
                CallStatus.ENDED,
                response.status()
        );

        assertEquals(
                0L,
                response.durationSeconds()
        );

        assertNull(
                response.connectedAt()
        );

        assertNotNull(
                response.endedAt()
        );

        verifyNoInteractions(usageService);

        verify(realtimePublisher)
                .publishEndedCall(
                        call,
                        caller
                );
    }

    @Test
    void acceptedCallEndsThroughUsageService() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(50)
        );

        call.setConnectedAt(
                LocalDateTime.now()
                        .minusSeconds(45)
        );

        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        3600L,
                        0L,
                        3600L
                )
        );

        when(usageService.finalizeUsage(
                eq(call.getId()),
                anyLong()
        )).thenAnswer(
                invocation -> {
                    long seconds =
                            invocation.getArgument(1);

                    call.setDurationSeconds(seconds);
                    call.setEndedAt(
                            LocalDateTime.now()
                    );
                    call.setStatus(
                            CallStatus.ENDED
                    );

                    return new SecureConnectUsageResult(
                            call.getId(),
                            callerId,
                            CallMediaType.AUDIO,
                            seconds,
                            seconds,
                            seconds,
                            0L,
                            false,
                            false,
                            0L,
                            0L
                    );
                }
        );

        var response =
                service.endCall(
                        "caller@example.com",
                        call.getId()
                );

        assertEquals(
                CallStatus.ENDED,
                response.status()
        );

        assertTrue(
                response.durationSeconds() >= 44L
        );

        verify(usageService)
                .finalizeUsage(
                        eq(call.getId()),
                        longThat(
                                seconds ->
                                        seconds >= 44L
                        )
                );
    
        verify(realtimePublisher)
                .publishEndedCall(
                        call,
                        caller
                );
    }


    @Test
    void delayedManualEndStopsAtAvailableBalance() {
        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(120);

        call.setStatus(CallStatus.ACCEPTED);
        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        30L,
                        0L,
                        30L
                )
        );

        var response = service.endCall(
                "caller@example.com",
                call.getId()
        );

        assertEquals(CallStatus.ENDED, response.status());
        assertEquals(30L, response.durationSeconds());
        assertEquals(
                connectedAt.plusSeconds(30),
                response.endedAt()
        );

        verify(usageService).finalizeUsage(
                call.getId(),
                30L
        );
    }

    @Test
    void delayedManualEndStopsAtMembershipExpiry() {
        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(120);

        membership.setExpiryDate(
                connectedAt.plusSeconds(45)
        );

        call.setStatus(CallStatus.ACCEPTED);
        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        120L,
                        0L,
                        120L
                )
        );

        var response = service.endCall(
                "callee@example.com",
                call.getId()
        );

        assertEquals(CallStatus.ENDED, response.status());
        assertEquals(45L, response.durationSeconds());
        assertEquals(
                connectedAt.plusSeconds(45),
                response.endedAt()
        );

        verify(usageService).finalizeUsage(
                call.getId(),
                45L
        );
    }

    @Test
    void calleeCanAlsoEndAcceptedCall() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(25)
        );

        call.setConnectedAt(
                LocalDateTime.now()
                        .minusSeconds(20)
        );

        call.setConnectedMembership(membership);

        when(usageService.getRemainingBalance(
                call.getId()
        )).thenReturn(
                new SecureConnectUsageBalance(
                        call.getId(),
                        callerId,
                        CallMediaType.AUDIO,
                        false,
                        3600L,
                        0L,
                        3600L
                )
        );

        when(usageService.finalizeUsage(
                eq(call.getId()),
                anyLong()
        )).thenAnswer(
                invocation -> {
                    long seconds =
                            invocation.getArgument(1);

                    call.setDurationSeconds(seconds);
                    call.setEndedAt(
                            LocalDateTime.now()
                    );
                    call.setStatus(
                            CallStatus.ENDED
                    );

                    return new SecureConnectUsageResult(
                            call.getId(),
                            callerId,
                            CallMediaType.AUDIO,
                            seconds,
                            seconds,
                            seconds,
                            0L,
                            false,
                            false,
                            0L,
                            0L
                    );
                }
        );

        var response =
                service.endCall(
                        "callee@example.com",
                        call.getId()
                );

        assertEquals(
                CallStatus.ENDED,
                response.status()
        );

        verify(usageService)
                .finalizeUsage(
                        eq(call.getId()),
                        anyLong()
                );
    
        verify(realtimePublisher)
                .publishEndedCall(
                        call,
                        callee
                );
    }

    @Test
    void outsiderCannotEndCall() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(20)
        );

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.endCall(
                                        "outsider@example.com",
                                        call.getId()
                                )
                );

        assertEquals(
                "Only call participants can end this call.",
                exception.getMessage()
        );

        verifyNoInteractions(usageService);
    }

    @Test
    void callerCannotAcceptOwnOutgoingCall() {
        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.acceptCall(
                                        "caller@example.com",
                                        call.getId()
                                )
                );

        assertEquals(
                "Only the recipient can accept this call.",
                exception.getMessage()
        );

        assertEquals(
                CallStatus.RINGING,
                call.getStatus()
        );

        verifyNoInteractions(usageService);
    }

    @Test
    void calleeCannotCancelCall() {
        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.cancelCall(
                                        "callee@example.com",
                                        call.getId()
                                )
                );

        assertEquals(
                "Only the caller can cancel this call.",
                exception.getMessage()
        );

        assertEquals(
                CallStatus.RINGING,
                call.getStatus()
        );

        verifyNoInteractions(usageService);
    }

    @Test
    void invalidTransitionCannotAcceptEndedCall() {
        call.setStatus(
                CallStatus.ENDED
        );

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.acceptCall(
                                        "callee@example.com",
                                        call.getId()
                                )
                );

        assertEquals(
                "Only a ringing call can be accepted.",
                exception.getMessage()
        );

        verifyNoInteractions(usageService);
    }


    @Test
    void ringingOutgoingCallBlocksAnotherRecipient() {
        assertExistingOutgoingCallBlocksInitiation(
                CallStatus.RINGING
        );
    }

    @Test
    void acceptedOutgoingCallBlocksAnotherRecipient() {
        assertExistingOutgoingCallBlocksInitiation(
                CallStatus.ACCEPTED
        );
    }

    private void assertExistingOutgoingCallBlocksInitiation(
            CallStatus existingStatus
    ) {
        SecureConnectAuthorizationResponse authorization =
                new SecureConnectAuthorizationResponse(
                        true,
                        "ALLOWED",
                        "Secure Connect call is allowed.",
                        UUID.randomUUID(),
                        null,
                        CallMediaType.AUDIO,
                        false,
                        600L,
                        0L
                );

        when(authorizationService.authorizeInitiation(
                callerId,
                calleeId,
                CallMediaType.AUDIO
        )).thenReturn(authorization);

        when(userRepository.findById(calleeId))
                .thenReturn(Optional.of(callee));

        when(callSessionRepository.existsByCallerIdAndStatusIn(
                eq(callerId),
                anyList()
        )).thenReturn(true);

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () -> service.initiateCall(
                                "caller@example.com",
                                calleeId,
                                CallMediaType.AUDIO
                        )
                );

        assertEquals(
                "You already have an active outgoing Secure Connect call.",
                exception.getMessage()
        );

        verify(callSessionRepository)
                .existsByCallerIdAndStatusIn(
                        eq(callerId),
                        argThat(statuses ->
                                statuses.contains(CallStatus.RINGING)
                                && statuses.contains(CallStatus.ACCEPTED)
                        )
                );

        verify(callSessionRepository, never())
                .save(any());

        verifyNoInteractions(usageService);
    }

    @Test
    void duplicateRingingCallIsRejected() {
        SecureConnectAuthorizationResponse authorization =
                new SecureConnectAuthorizationResponse(
                        true,
                        "ALLOWED",
                        "Secure Connect call is allowed.",
                        UUID.randomUUID(),
                        null,
                        CallMediaType.AUDIO,
                        false,
                        600L,
                        0L
                );

        when(authorizationService.authorizeInitiation(
                callerId,
                calleeId,
                CallMediaType.AUDIO
        )).thenReturn(authorization);

        when(userRepository.findById(calleeId))
                .thenReturn(
                        Optional.of(callee)
                );

        when(callSessionRepository
                .existsByCallerIdAndCalleeIdAndStatus(
                        callerId,
                        calleeId,
                        CallStatus.RINGING
                ))
                .thenReturn(true);

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.initiateCall(
                                        "caller@example.com",
                                        calleeId,
                                        CallMediaType.AUDIO
                                )
                );

        assertEquals(
                "A Secure Connect call is already ringing for this member.",
                exception.getMessage()
        );

        verify(callSessionRepository, never())
                .save(any());

        verifyNoInteractions(usageService);
    }

    @Test
    void markMissedIfStillRingingMarksRingingCallAsMissed() {
        UUID callId = UUID.randomUUID();

        SecureConnectCallSession call =
                SecureConnectCallSession.builder()
                        .id(callId)
                        .caller(caller)
                        .callee(callee)
                        .mediaType(CallMediaType.AUDIO)
                        .status(CallStatus.RINGING)
                        .initiatedAt(LocalDateTime.now().minusMinutes(1))
                        .createdAt(LocalDateTime.now().minusMinutes(1))
                        .updatedAt(LocalDateTime.now().minusMinutes(1))
                        .build();

        when(callSessionRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(callSessionRepository.save(any(SecureConnectCallSession.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        boolean result =
                service.markMissedIfStillRinging(callId);

        assertTrue(result);
        assertEquals(
                CallStatus.MISSED,
                call.getStatus()
        );
        assertNotNull(call.getEndedAt());
        assertEquals(
                0L,
                call.getDurationSeconds()
        );

        verify(callSessionRepository).save(call);
        verify(realtimePublisher)
                .publishMissedCall(call);
    }

    @Test
    void markMissedIfStillRingingDoesNothingWhenCallAlreadyAccepted() {
        UUID callId = UUID.randomUUID();

        SecureConnectCallSession call =
                SecureConnectCallSession.builder()
                        .id(callId)
                        .caller(caller)
                        .callee(callee)
                        .mediaType(CallMediaType.VIDEO)
                        .status(CallStatus.ACCEPTED)
                        .initiatedAt(LocalDateTime.now().minusMinutes(1))
                        .answeredAt(LocalDateTime.now())
                        .createdAt(LocalDateTime.now().minusMinutes(1))
                        .updatedAt(LocalDateTime.now())
                        .build();

        when(callSessionRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        boolean result =
                service.markMissedIfStillRinging(callId);

        assertFalse(result);
        assertEquals(
                CallStatus.ACCEPTED,
                call.getStatus()
        );

        verify(callSessionRepository, never())
                .save(any());

        verify(realtimePublisher, never())
                .publishMissedCall(any());
    }

    @Test
    void markMissedIfStillRingingDoesNothingWhenCallDoesNotExist() {
        UUID callId = UUID.randomUUID();

        when(callSessionRepository.findForUpdate(callId))
                .thenReturn(Optional.empty());

        boolean result =
                service.markMissedIfStillRinging(callId);

        assertFalse(result);

        verify(callSessionRepository, never())
                .save(any());

        verify(realtimePublisher, never())
                .publishMissedCall(any());
    }


}
