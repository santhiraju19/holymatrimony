package com.theholymatrimony.backend.secureconnect.termination;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecureConnectMediaTerminationProcessorTests {

    @Mock
    private SecureConnectMediaTerminationRepository repository;

    @Mock
    private SecureConnectCallSessionRepository callRepository;

    @Mock
    private LiveKitRoomTerminationClient liveKitClient;

    @InjectMocks
    private SecureConnectMediaTerminationProcessor processor;

    private UUID callId;
    private UUID callerId;
    private UUID calleeId;
    private String room;

    @BeforeEach
    void setUp() {
        callId = UUID.randomUUID();
        callerId = UUID.randomUUID();
        calleeId = UUID.randomUUID();
        room = "sc_" + callId;
    }

    private void stubCall() {
        User caller = mock(User.class);
        User callee = mock(User.class);

        when(caller.getId()).thenReturn(callerId);
        when(callee.getId()).thenReturn(calleeId);

        SecureConnectCallSession call =
                SecureConnectCallSession.builder()
                        .id(callId)
                        .caller(caller)
                        .callee(callee)
                        .provider("LIVEKIT")
                        .providerRoomId(room)
                        .build();

        when(callRepository.findById(callId))
                .thenReturn(Optional.of(call));
    }

    @Test
    void removesBothParticipantsBeforeDeletingRoom() {
        stubCall();

        processor.terminateRoom(room);

        InOrder order = inOrder(liveKitClient);
        order.verify(liveKitClient)
                .removeParticipant(room, callerId);
        order.verify(liveKitClient)
                .removeParticipant(room, calleeId);
        order.verify(liveKitClient)
                .deleteRoom(room);

        verifyNoMoreInteractions(liveKitClient);
    }

    @Test
    void removalFailurePreventsPrematureRoomDeletion() {
        stubCall();

        doThrow(new IllegalStateException(
                "Temporary LiveKit failure"
        )).when(liveKitClient)
                .removeParticipant(room, callerId);

        assertThrows(
                IllegalStateException.class,
                () -> processor.terminateRoom(room)
        );

        verify(liveKitClient)
                .removeParticipant(room, callerId);
        verify(liveKitClient, never())
                .removeParticipant(room, calleeId);
        verify(liveKitClient, never())
                .deleteRoom(anyString());
    }

    @Test
    void missingCallPreventsLiveKitRequests() {
        when(callRepository.findById(callId))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalStateException.class,
                () -> processor.terminateRoom(room)
        );

        verifyNoInteractions(liveKitClient);
    }

    @Test
    void invalidRoomPreventsDatabaseAndLiveKitRequests() {
        assertThrows(
                IllegalArgumentException.class,
                () -> processor.terminateRoom("../invalid")
        );

        verifyNoInteractions(
                callRepository,
                liveKitClient
        );
    }
}
