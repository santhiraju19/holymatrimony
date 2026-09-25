package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.safety.repository.UserBlockRepository;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectMediaCredentials;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectUsageBalance;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectMediaBalanceResponse;
import com.theholymatrimony.backend.secureconnect.balance.service.SecureConnectBalanceService;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.provider.CallProvider;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecureConnectMediaServiceImplTests {

    private UserRepository userRepository;
    private SecureConnectCallSessionRepository callRepository;
    private UserBlockRepository userBlockRepository;
    private CallProvider callProvider;

    private SecureConnectUsageService usageService;

    private MembershipRepository membershipRepository;

    private SecureConnectBalanceService balanceService;

    private SecureConnectMediaServiceImpl service;

    private UUID callId;
    private User caller;
    private User callee;
    private User outsider;
    private SecureConnectCallSession call;

    @BeforeEach
    void setUp() {
        userRepository =
                mock(UserRepository.class);

        callRepository =
                mock(SecureConnectCallSessionRepository.class);

        userBlockRepository =
                mock(UserBlockRepository.class);

        callProvider =
                mock(CallProvider.class);

        usageService =
                mock(SecureConnectUsageService.class);

        membershipRepository =
                mock(MembershipRepository.class);

        balanceService =
                mock(SecureConnectBalanceService.class);

        service =
                new SecureConnectMediaServiceImpl(
                        userRepository,
                        callRepository,
                        userBlockRepository,
                        callProvider,
                        usageService,
                        membershipRepository,
                        balanceService
                );

        callId = UUID.randomUUID();

        caller =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Caller")
                        .email("caller@example.com")
                        .password("password")
                        .build();

        callee =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Callee")
                        .email("callee@example.com")
                        .password("password")
                        .build();

        outsider =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Outsider")
                        .email("outsider@example.com")
                        .password("password")
                        .build();

        call =
                SecureConnectCallSession.builder()
                        .id(callId)
                        .caller(caller)
                        .callee(callee)
                        .mediaType(CallMediaType.AUDIO)
                        .status(CallStatus.ACCEPTED)
                        .durationSeconds(0L)
                        .build();

        Membership activeMembership =
                Membership.builder()
                        .id(UUID.randomUUID())
                        .user(caller)
                        .plan(MembershipPlan.GOLD)
                        .status(MembershipStatus.ACTIVE)
                        .startDate(LocalDateTime.now().minusDays(1))
                        .expiryDate(LocalDateTime.now().plusDays(1))
                        .build();

        lenient().when(
                membershipRepository
                        .findFirstByUserIdAndStatusOrderByStartDateDesc(
                                caller.getId(),
                                MembershipStatus.ACTIVE
                        )
        ).thenReturn(Optional.of(activeMembership));

        SecureConnectMediaBalanceResponse audioBalance =
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

        SecureConnectMediaBalanceResponse videoBalance =
                new SecureConnectMediaBalanceResponse(
                        CallMediaType.VIDEO,
                        true,
                        false,
                        3600L,
                        0L,
                        3600L,
                        0L,
                        3600L
                );


        lenient().when(
                userRepository.findForUpdate(caller.getId())
        ).thenReturn(Optional.of(caller));

        lenient().when(
                balanceService.getLockedBalanceForMembership(
                        eq(caller),
                        any(Membership.class),
                        eq(CallMediaType.AUDIO)
                )
        ).thenReturn(audioBalance);

        lenient().when(
                balanceService.getLockedBalanceForMembership(
                        eq(caller),
                        any(Membership.class),
                        eq(CallMediaType.VIDEO)
                )
        ).thenReturn(videoBalance);

        when(callProvider.providerName())
                .thenReturn("LIVEKIT");

        when(callProvider.roomName(call))
                .thenReturn("sc_" + callId);
    }

    @Test
    void exhaustedConnectedCallCannotReceiveCredentials() {
        call.setConnectedAt(
                LocalDateTime.now().minusSeconds(90)
        );

        call.setConnectedMembership(
                Membership.builder()
                        .id(UUID.randomUUID())
                        .user(caller)
                        .plan(MembershipPlan.GOLD)
                        .expiryDate(LocalDateTime.now().plusDays(1))
                        .build()
        );

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(usageService.getRemainingBalance(callId))
                .thenReturn(new SecureConnectUsageBalance(
                        callId,
                        caller.getId(),
                        CallMediaType.AUDIO,
                        false,
                        60L,
                        0L,
                        60L
                ));

        assertThrows(
                IllegalStateException.class,
                () -> service.createCredentials(
                        caller.getEmail(),
                        callId
                )
        );

        verify(callProvider, never())
                .createParticipantCredentials(any(), any(), any());
    }

    @Test
    void expiredConnectedMembershipCannotReceiveCredentials() {
        call.setConnectedAt(
                LocalDateTime.now().minusMinutes(5)
        );

        call.setConnectedMembership(
                Membership.builder()
                        .id(UUID.randomUUID())
                        .user(caller)
                        .plan(MembershipPlan.PLATINUM)
                        .expiryDate(LocalDateTime.now().minusSeconds(1))
                        .build()
        );

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(usageService.getRemainingBalance(callId))
                .thenReturn(new SecureConnectUsageBalance(
                        callId,
                        caller.getId(),
                        CallMediaType.AUDIO,
                        true,
                        0L,
                        0L,
                        0L
                ));

        assertThrows(
                IllegalStateException.class,
                () -> service.createCredentials(
                        caller.getEmail(),
                        callId
                )
        );

        verify(callProvider, never())
                .createParticipantCredentials(any(), any(), any());
    }

    @Test
    void missingMembershipPreventsUnconnectedCredentials() {
        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        caller.getId(),
                        MembershipStatus.ACTIVE
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalStateException.class,
                () -> service.createCredentials(
                        caller.getEmail(),
                        callId
                )
        );

        verify(callProvider, never())
                .createParticipantCredentials(any(), any(), any());
    }

    @Test
    void expiredMembershipPreventsUnconnectedCredentials() {
        Membership expired = Membership.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .plan(MembershipPlan.GOLD)
                .status(MembershipStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusDays(30))
                .expiryDate(LocalDateTime.now().minusSeconds(1))
                .build();

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        caller.getId(),
                        MembershipStatus.ACTIVE
                ))
                .thenReturn(Optional.of(expired));

        assertThrows(
                IllegalStateException.class,
                () -> service.createCredentials(
                        caller.getEmail(),
                        callId
                )
        );

        verify(callProvider, never())
                .createParticipantCredentials(any(), any(), any());
    }

    @Test
    void silverCannotReceiveUnconnectedVideoCredentials() {
        call.setMediaType(CallMediaType.VIDEO);

        Membership silver = Membership.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .plan(MembershipPlan.SILVER)
                .status(MembershipStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusDays(1))
                .expiryDate(LocalDateTime.now().plusDays(1))
                .build();

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        caller.getId(),
                        MembershipStatus.ACTIVE
                ))
                .thenReturn(Optional.of(silver));

        assertThrows(
                IllegalStateException.class,
                () -> service.createCredentials(
                        caller.getEmail(),
                        callId
                )
        );

        verify(callProvider, never())
                .createParticipantCredentials(any(), any(), any());
    }

    @Test
    void calleeCannotBypassExpiredCallerMembership() {
        Membership expired = Membership.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .plan(MembershipPlan.GOLD)
                .status(MembershipStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusDays(30))
                .expiryDate(LocalDateTime.now().minusSeconds(1))
                .build();

        when(userRepository.findByEmail(callee.getEmail()))
                .thenReturn(Optional.of(callee));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        caller.getId(),
                        MembershipStatus.ACTIVE
                ))
                .thenReturn(Optional.of(expired));

        assertThrows(
                IllegalStateException.class,
                () -> service.createCredentials(
                        callee.getEmail(),
                        callId
                )
        );

        verify(callProvider, never())
                .createParticipantCredentials(any(), any(), any());
    }

    @Test
    void zeroBalancePreventsCredentials() {
        SecureConnectMediaBalanceResponse emptyAudio =
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



        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(balanceService.getLockedBalanceForMembership(
                eq(caller),
                any(Membership.class),
                eq(CallMediaType.AUDIO)
        )).thenReturn(emptyAudio);

        assertThrows(
                IllegalStateException.class,
                () -> service.createCredentials(
                        caller.getEmail(),
                        callId
                )
        );

        verify(callProvider, never())
                .createParticipantCredentials(any(), any(), any());

        verify(usageService, never())
                .finalizeUsage(any(), anyLong());
    }

    @Test
    void calleeCannotBypassExhaustedCallerBalance() {
        SecureConnectMediaBalanceResponse emptyAudio =
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



        when(userRepository.findByEmail(callee.getEmail()))
                .thenReturn(Optional.of(callee));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(balanceService.getLockedBalanceForMembership(
                eq(caller),
                any(Membership.class),
                eq(CallMediaType.AUDIO)
        )).thenReturn(emptyAudio);

        assertThrows(
                IllegalStateException.class,
                () -> service.createCredentials(
                        callee.getEmail(),
                        callId
                )
        );

        verify(callProvider, never())
                .createParticipantCredentials(any(), any(), any());

        verify(usageService, never())
                .finalizeUsage(any(), anyLong());
    }

    @Test
    void balanceCheckDoesNotConsumeMinutes() {
        SecureConnectMediaCredentials expected =
                new SecureConnectMediaCredentials(
                        "wss://example.livekit.cloud",
                        "token",
                        "sc_" + callId,
                        "scu_" + caller.getId(),
                        CallMediaType.AUDIO
                );

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(callProvider.createParticipantCredentials(
                eq(call),
                eq(caller.getId()),
                any()
        )).thenReturn(expected);

        assertSame(
                expected,
                service.createCredentials(
                        caller.getEmail(),
                        callId
                )
        );

        verify(balanceService)
                .getLockedBalanceForMembership(
                        eq(caller),
                        any(Membership.class),
                        eq(CallMediaType.AUDIO)
                );

        verify(usageService, never())
                .finalizeUsage(any(), anyLong());
    }

    @Test
    void acceptedCallerReceivesCredentials() {
        SecureConnectMediaCredentials expected =
                new SecureConnectMediaCredentials(
                        "wss://example.livekit.cloud",
                        "token",
                        "sc_" + callId,
                        "scu_" + caller.getId(),
                        CallMediaType.AUDIO
                );

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(
                callProvider.createParticipantCredentials(
                        eq(call),
                        eq(caller.getId()),
                        any()
                )
        ).thenReturn(expected);

        SecureConnectMediaCredentials result =
                service.createCredentials(
                        caller.getEmail(),
                        callId
                );

        assertSame(expected, result);
        assertEquals("LIVEKIT", call.getProvider());
        assertEquals(
                "sc_" + callId,
                call.getProviderRoomId()
        );

        verify(callRepository).save(call);

        verify(callProvider)
                .createParticipantCredentials(
                        eq(call),
                        eq(caller.getId()),
                        any()
                );
    }

    @Test
    void acceptedCalleeReceivesCredentials() {
        SecureConnectMediaCredentials expected =
                new SecureConnectMediaCredentials(
                        "wss://example.livekit.cloud",
                        "token",
                        "sc_" + callId,
                        "scu_" + callee.getId(),
                        CallMediaType.AUDIO
                );

        when(userRepository.findByEmail(callee.getEmail()))
                .thenReturn(Optional.of(callee));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(
                callProvider.createParticipantCredentials(
                        eq(call),
                        eq(callee.getId()),
                        any()
                )
        ).thenReturn(expected);

        SecureConnectMediaCredentials result =
                service.createCredentials(
                        callee.getEmail(),
                        callId
                );

        assertSame(expected, result);

        verify(callProvider)
                .createParticipantCredentials(
                        eq(call),
                        eq(callee.getId()),
                        any()
                );
    }


    @Test
    void unconnectedTokenDeadlineMatchesMembershipExpiry() {
        LocalDateTime membershipExpiry =
                LocalDateTime.now().plusHours(2).withNano(0);

        Membership membership = Membership.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .plan(MembershipPlan.GOLD)
                .status(MembershipStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusDays(1))
                .expiryDate(membershipExpiry)
                .build();

        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        caller.getId(),
                        MembershipStatus.ACTIVE
                ))
                .thenReturn(Optional.of(membership));

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        service.createCredentials(caller.getEmail(), callId);

        org.mockito.ArgumentCaptor<java.time.Instant> deadline =
                org.mockito.ArgumentCaptor.forClass(
                        java.time.Instant.class
                );

        verify(callProvider).createParticipantCredentials(
                eq(call),
                eq(caller.getId()),
                deadline.capture()
        );

        assertEquals(
                membershipExpiry
                        .atZone(java.time.ZoneId.systemDefault())
                        .toInstant(),
                deadline.getValue()
        );
    }

    @Test
    void connectedTokenDeadlineMatchesEarlierPaidBoundary() {
        LocalDateTime connectedAt =
                LocalDateTime.now().minusSeconds(10).withNano(0);

        LocalDateTime membershipExpiry =
                LocalDateTime.now().plusHours(2).withNano(0);

        Membership membership = Membership.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .plan(MembershipPlan.GOLD)
                .status(MembershipStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusDays(1))
                .expiryDate(membershipExpiry)
                .build();

        call.setConnectedAt(connectedAt);
        call.setConnectedMembership(membership);

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(usageService.getRemainingBalance(callId))
                .thenReturn(new SecureConnectUsageBalance(
                        callId,
                        caller.getId(),
                        CallMediaType.AUDIO,
                        false,
                        120L,
                        0L,
                        120L
                ));

        service.createCredentials(caller.getEmail(), callId);

        org.mockito.ArgumentCaptor<java.time.Instant> deadline =
                org.mockito.ArgumentCaptor.forClass(
                        java.time.Instant.class
                );

        verify(callProvider).createParticipantCredentials(
                eq(call),
                eq(caller.getId()),
                deadline.capture()
        );

        assertEquals(
                connectedAt.plusSeconds(120)
                        .atZone(java.time.ZoneId.systemDefault())
                        .toInstant(),
                deadline.getValue()
        );
    }

    @Test
    void outsiderCannotReceiveCredentials() {
        when(userRepository.findByEmail(outsider.getEmail()))
                .thenReturn(Optional.of(outsider));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.createCredentials(
                                        outsider.getEmail(),
                                        callId
                                )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Only call participants")
        );

        verify(
                callProvider,
                never()
        ).createParticipantCredentials(
                any(),
                any()
        );
    }

    @Test
    void ringingCallCannotReceiveCredentials() {
        call.setStatus(CallStatus.RINGING);

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        assertThrows(
                IllegalStateException.class,
                () ->
                        service.createCredentials(
                                caller.getEmail(),
                                callId
                        )
        );

        verify(
                callProvider,
                never()
        ).createParticipantCredentials(
                any(),
                any()
        );
    }

    @Test
    void endedCallCannotReceiveCredentials() {
        call.setStatus(CallStatus.ENDED);

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        assertThrows(
                IllegalStateException.class,
                () ->
                        service.createCredentials(
                                caller.getEmail(),
                                callId
                        )
        );

        verify(
                callProvider,
                never()
        ).createParticipantCredentials(
                any(),
                any()
        );
    }

    @Test
    void existingProviderCannotChange() {
        call.setProvider("OTHER_PROVIDER");

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.createCredentials(
                                        caller.getEmail(),
                                        callId
                                )
                );

        assertTrue(
                exception.getMessage()
                        .contains("provider cannot be changed")
        );

        verify(
                callProvider,
                never()
        ).createParticipantCredentials(
                any(),
                any()
        );
    }

    @Test
    void existingRoomCannotChange() {
        call.setProvider("LIVEKIT");
        call.setProviderRoomId("different-room");

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.createCredentials(
                                        caller.getEmail(),
                                        callId
                                )
                );

        assertTrue(
                exception.getMessage()
                        .contains("room cannot be changed")
        );

        verify(
                callProvider,
                never()
        ).createParticipantCredentials(
                any(),
                any()
        );
    }

    @Test
    void missingCallIsRejected() {
        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.createCredentials(
                                caller.getEmail(),
                                callId
                        )
        );
    }

    @Test
    void inactiveCallerCannotReceiveCredentials() {
        caller.setEnabled(false);

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.createCredentials(
                                        caller.getEmail(),
                                        callId
                                )
                );

        assertTrue(
                exception.getMessage()
                        .contains("participant account is inactive")
        );

        verify(
                callProvider,
                never()
        ).createParticipantCredentials(
                any(),
                any()
        );
    }

    @Test
    void inactiveCalleePreventsMediaCredentials() {
        callee.setEnabled(false);

        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.createCredentials(
                                        caller.getEmail(),
                                        callId
                                )
                );

        assertTrue(
                exception.getMessage()
                        .contains("participant account is inactive")
        );

        verify(
                callProvider,
                never()
        ).createParticipantCredentials(
                any(),
                any()
        );
    }

    @Test
    void blockBetweenParticipantsPreventsMediaCredentials() {
        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        when(
                userBlockRepository
                        .existsByBlockerIdAndBlockedUserIdOrBlockerIdAndBlockedUserId(
                                caller.getId(),
                                callee.getId(),
                                callee.getId(),
                                caller.getId()
                        )
        ).thenReturn(true);

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.createCredentials(
                                        caller.getEmail(),
                                        callId
                                )
                );

        assertTrue(
                exception.getMessage()
                        .contains(
                                "Secure Connect is unavailable"
                        )
        );

        verify(
                callProvider,
                never()
        ).createParticipantCredentials(
                any(),
                any()
        );
    }


    @Test
    void unconnectedCredentialsFollowAuthorizationLockOrder() {
        when(userRepository.findByEmail(caller.getEmail()))
                .thenReturn(Optional.of(caller));

        when(callRepository.findForUpdate(callId))
                .thenReturn(Optional.of(call));

        service.createCredentials(caller.getEmail(), callId);

        org.mockito.InOrder order = inOrder(
                callRepository,
                userRepository,
                membershipRepository,
                balanceService
        );

        order.verify(callRepository)
                .findForUpdate(callId);

        order.verify(userRepository)
                .findForUpdate(caller.getId());

        order.verify(membershipRepository)
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        caller.getId(),
                        MembershipStatus.ACTIVE
                );

        order.verify(balanceService)
                .getLockedBalanceForMembership(
                        eq(caller),
                        any(Membership.class),
                        eq(CallMediaType.AUDIO)
                );

        verify(balanceService, never())
                .getBalance(anyString());
    }


}
