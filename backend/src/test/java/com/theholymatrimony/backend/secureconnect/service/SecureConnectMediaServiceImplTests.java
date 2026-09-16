package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.safety.repository.UserBlockRepository;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectMediaCredentials;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.provider.CallProvider;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecureConnectMediaServiceImplTests {

    private UserRepository userRepository;
    private SecureConnectCallSessionRepository callRepository;
    private UserBlockRepository userBlockRepository;
    private CallProvider callProvider;

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

        service =
                new SecureConnectMediaServiceImpl(
                        userRepository,
                        callRepository,
                        userBlockRepository,
                        callProvider
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

        when(callProvider.providerName())
                .thenReturn("LIVEKIT");

        when(callProvider.roomName(call))
                .thenReturn("sc_" + callId);
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
                        call,
                        caller.getId()
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
                        call,
                        caller.getId()
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
                        call,
                        callee.getId()
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
                        call,
                        callee.getId()
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

}
