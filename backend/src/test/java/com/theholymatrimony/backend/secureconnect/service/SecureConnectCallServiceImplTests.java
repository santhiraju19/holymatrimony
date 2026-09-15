package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectAuthorizationResponse;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectUsageResult;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
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

    private UserRepository userRepository;
    private SecureConnectCallSessionRepository callSessionRepository;
    private SecureConnectAuthorizationService authorizationService;
    private SecureConnectUsageService usageService;

    private SecureConnectCallServiceImpl service;

    private UUID callerId;
    private UUID calleeId;
    private UUID outsiderId;

    private User caller;
    private User callee;
    private User outsider;

    private SecureConnectCallSession call;

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

        service =
                new SecureConnectCallServiceImpl(
                        userRepository,
                        callSessionRepository,
                        authorizationService,
                        usageService
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

        verify(callSessionRepository)
                .save(call);

        verifyNoInteractions(usageService);
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
    }

    @Test
    void acceptedCallCanFailWithDurationButWithoutUsageCharge() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(30)
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

        verifyNoInteractions(usageService);
    }

    @Test
    void acceptedCallEndsThroughUsageService() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(45)
        );

        when(callSessionRepository.findById(
                call.getId()
        ))
                .thenReturn(
                        Optional.of(call),
                        Optional.of(call)
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
    }

    @Test
    void calleeCanAlsoEndAcceptedCall() {
        call.setStatus(
                CallStatus.ACCEPTED
        );

        call.setAnsweredAt(
                LocalDateTime.now()
                        .minusSeconds(20)
        );

        when(callSessionRepository.findById(
                call.getId()
        ))
                .thenReturn(
                        Optional.of(call),
                        Optional.of(call)
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

        when(callSessionRepository.findById(
                call.getId()
        )).thenReturn(
                Optional.of(call)
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
}
