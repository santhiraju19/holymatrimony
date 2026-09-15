package com.theholymatrimony.backend.secureconnect.realtime;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecureConnectRealtimePublisherImplTests {

    private static final String DESTINATION =
            "/queue/secure-connect";

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ProfileRepository profileRepository;

    private SecureConnectRealtimePublisherImpl publisher;

    private User caller;

    private User callee;

    private Profile callerProfile;

    private Profile calleeProfile;

    private SecureConnectCallSession call;

    @BeforeEach
    void setUp() {
        publisher =
                new SecureConnectRealtimePublisherImpl(
                        messagingTemplate,
                        profileRepository
                );

        caller =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("  Caller Member  ")
                        .email("CALLER@Example.com")
                        .mobile("9000000001")
                        .password("unused")
                        .build();

        callee =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("  Recipient Member  ")
                        .email("CALLEE@Example.com")
                        .mobile("9000000002")
                        .password("unused")
                        .build();

        callerProfile =
                Profile.builder()
                        .id(UUID.randomUUID())
                        .user(caller)
                        .memberId("  HM-000101  ")
                        .build();

        calleeProfile =
                Profile.builder()
                        .id(UUID.randomUUID())
                        .user(callee)
                        .memberId("  HM-000202  ")
                        .build();

        call =
                SecureConnectCallSession.builder()
                        .id(UUID.randomUUID())
                        .caller(caller)
                        .callee(callee)
                        .mediaType(CallMediaType.VIDEO)
                        .status(CallStatus.RINGING)
                        .initiatedAt(LocalDateTime.now())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
    }

    @Test
    void incomingCallIsSentOnlyToCalleeWithCallerIdentity() {
        when(profileRepository.findByUserId(caller.getId()))
                .thenReturn(Optional.of(callerProfile));

        publisher.publishIncomingCall(call);

        SecureConnectCallEvent event =
                captureSingleEvent(
                        "callee@example.com"
                );

        assertEquals(
                SecureConnectCallEventType.CALL_INCOMING,
                event.eventType()
        );
        assertEquals(call.getId(), event.callId());
        assertEquals(CallMediaType.VIDEO, event.mediaType());
        assertEquals(CallStatus.RINGING, event.status());

        assertMember(
                event.otherMember(),
                caller.getId(),
                "HM-000101",
                "Caller Member"
        );

        assertNotNull(event.occurredAt());

        verify(profileRepository)
                .findByUserId(caller.getId());

        verifyNoMoreInteractions(messagingTemplate);
    }

    @Test
    void acceptedCallIsSentToCallerWithCalleeIdentity() {
        call.setStatus(CallStatus.ACCEPTED);

        when(profileRepository.findByUserId(callee.getId()))
                .thenReturn(Optional.of(calleeProfile));

        publisher.publishAcceptedCall(call);

        SecureConnectCallEvent event =
                captureSingleEvent(
                        "caller@example.com"
                );

        assertEquals(
                SecureConnectCallEventType.CALL_ACCEPTED,
                event.eventType()
        );
        assertEquals(CallStatus.ACCEPTED, event.status());

        assertMember(
                event.otherMember(),
                callee.getId(),
                "HM-000202",
                "Recipient Member"
        );
    }

    @Test
    void declinedCallIsSentToCaller() {
        call.setStatus(CallStatus.DECLINED);

        when(profileRepository.findByUserId(callee.getId()))
                .thenReturn(Optional.of(calleeProfile));

        publisher.publishDeclinedCall(call);

        SecureConnectCallEvent event =
                captureSingleEvent(
                        "caller@example.com"
                );

        assertEquals(
                SecureConnectCallEventType.CALL_DECLINED,
                event.eventType()
        );
        assertEquals(CallStatus.DECLINED, event.status());

        assertMember(
                event.otherMember(),
                callee.getId(),
                "HM-000202",
                "Recipient Member"
        );
    }

    @Test
    void cancelledCallIsSentToCallee() {
        call.setStatus(CallStatus.CANCELLED);

        when(profileRepository.findByUserId(caller.getId()))
                .thenReturn(Optional.of(callerProfile));

        publisher.publishCancelledCall(call);

        SecureConnectCallEvent event =
                captureSingleEvent(
                        "callee@example.com"
                );

        assertEquals(
                SecureConnectCallEventType.CALL_CANCELLED,
                event.eventType()
        );
        assertEquals(CallStatus.CANCELLED, event.status());

        assertMember(
                event.otherMember(),
                caller.getId(),
                "HM-000101",
                "Caller Member"
        );
    }

    @Test
    void missedCallIsSentToBothParticipants() {
        call.setStatus(CallStatus.MISSED);

        when(profileRepository.findByUserId(callee.getId()))
                .thenReturn(Optional.of(calleeProfile));

        when(profileRepository.findByUserId(caller.getId()))
                .thenReturn(Optional.of(callerProfile));

        publisher.publishMissedCall(call);

        ArgumentCaptor<SecureConnectCallEvent> eventCaptor =
                ArgumentCaptor.forClass(
                        SecureConnectCallEvent.class
                );

        verify(messagingTemplate).convertAndSendToUser(
                eq("caller@example.com"),
                eq(DESTINATION),
                eventCaptor.capture()
        );

        SecureConnectCallEvent callerEvent =
                eventCaptor.getValue();

        assertEquals(
                SecureConnectCallEventType.CALL_MISSED,
                callerEvent.eventType()
        );

        assertMember(
                callerEvent.otherMember(),
                callee.getId(),
                "HM-000202",
                "Recipient Member"
        );

        verify(messagingTemplate).convertAndSendToUser(
                eq("callee@example.com"),
                eq(DESTINATION),
                eventCaptor.capture()
        );

        SecureConnectCallEvent calleeEvent =
                eventCaptor.getValue();

        assertEquals(
                SecureConnectCallEventType.CALL_MISSED,
                calleeEvent.eventType()
        );

        assertMember(
                calleeEvent.otherMember(),
                caller.getId(),
                "HM-000101",
                "Caller Member"
        );

        verifyNoMoreInteractions(messagingTemplate);
    }

    @Test
    void failedCallIsSentToBothParticipants() {
        call.setStatus(CallStatus.FAILED);

        when(profileRepository.findByUserId(callee.getId()))
                .thenReturn(Optional.of(calleeProfile));

        when(profileRepository.findByUserId(caller.getId()))
                .thenReturn(Optional.of(callerProfile));

        publisher.publishFailedCall(call);

        ArgumentCaptor<SecureConnectCallEvent> eventCaptor =
                ArgumentCaptor.forClass(
                        SecureConnectCallEvent.class
                );

        verify(messagingTemplate).convertAndSendToUser(
                eq("caller@example.com"),
                eq(DESTINATION),
                eventCaptor.capture()
        );

        assertEquals(
                SecureConnectCallEventType.CALL_FAILED,
                eventCaptor.getValue().eventType()
        );

        assertMember(
                eventCaptor.getValue().otherMember(),
                callee.getId(),
                "HM-000202",
                "Recipient Member"
        );

        verify(messagingTemplate).convertAndSendToUser(
                eq("callee@example.com"),
                eq(DESTINATION),
                eventCaptor.capture()
        );

        assertEquals(
                SecureConnectCallEventType.CALL_FAILED,
                eventCaptor.getValue().eventType()
        );

        assertMember(
                eventCaptor.getValue().otherMember(),
                caller.getId(),
                "HM-000101",
                "Caller Member"
        );

        verifyNoMoreInteractions(messagingTemplate);
    }

    @Test
    void callerEndingCallNotifiesCallee() {
        call.setStatus(CallStatus.ENDED);

        when(profileRepository.findByUserId(caller.getId()))
                .thenReturn(Optional.of(callerProfile));

        publisher.publishEndedCall(
                call,
                caller
        );

        SecureConnectCallEvent event =
                captureSingleEvent(
                        "callee@example.com"
                );

        assertEquals(
                SecureConnectCallEventType.CALL_ENDED,
                event.eventType()
        );
        assertEquals(CallStatus.ENDED, event.status());

        assertMember(
                event.otherMember(),
                caller.getId(),
                "HM-000101",
                "Caller Member"
        );
    }

    @Test
    void calleeEndingCallNotifiesCaller() {
        call.setStatus(CallStatus.ENDED);

        when(profileRepository.findByUserId(callee.getId()))
                .thenReturn(Optional.of(calleeProfile));

        publisher.publishEndedCall(
                call,
                callee
        );

        SecureConnectCallEvent event =
                captureSingleEvent(
                        "caller@example.com"
                );

        assertEquals(
                SecureConnectCallEventType.CALL_ENDED,
                event.eventType()
        );

        assertMember(
                event.otherMember(),
                callee.getId(),
                "HM-000202",
                "Recipient Member"
        );
    }

    @Test
    void missingProfileProducesNullMemberIdButStillPublishes() {
        when(profileRepository.findByUserId(caller.getId()))
                .thenReturn(Optional.empty());

        publisher.publishIncomingCall(call);

        SecureConnectCallEvent event =
                captureSingleEvent(
                        "callee@example.com"
                );

        assertEquals(caller.getId(), event.otherMember().userId());
        assertNull(event.otherMember().memberId());
        assertEquals(
                "Caller Member",
                event.otherMember().displayName()
        );
    }

    @Test
    void blankRecipientEmailDoesNotPublish() {
        callee.setEmail("   ");

        publisher.publishIncomingCall(call);

        verifyNoInteractions(messagingTemplate);
        verifyNoInteractions(profileRepository);
    }

    @Test
    void outsiderCannotTriggerEndedEvent() {
        User outsider =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Outsider")
                        .email("outsider@example.com")
                        .password("unused")
                        .build();

        call.setStatus(CallStatus.ENDED);

        publisher.publishEndedCall(
                call,
                outsider
        );

        verifyNoInteractions(messagingTemplate);
        verifyNoInteractions(profileRepository);
    }

    @Test
    void nullEndedArgumentsAreIgnored() {
        publisher.publishEndedCall(
                null,
                caller
        );

        publisher.publishEndedCall(
                call,
                null
        );

        verifyNoInteractions(messagingTemplate);
        verifyNoInteractions(profileRepository);
    }

    private SecureConnectCallEvent captureSingleEvent(
            String recipientEmail
    ) {
        ArgumentCaptor<SecureConnectCallEvent> captor =
                ArgumentCaptor.forClass(
                        SecureConnectCallEvent.class
                );

        verify(messagingTemplate)
                .convertAndSendToUser(
                        eq(recipientEmail),
                        eq(DESTINATION),
                        captor.capture()
                );

        return captor.getValue();
    }

    private void assertMember(
            SecureConnectCallMember member,
            UUID expectedUserId,
            String expectedMemberId,
            String expectedDisplayName
    ) {
        assertNotNull(member);
        assertEquals(expectedUserId, member.userId());
        assertEquals(expectedMemberId, member.memberId());
        assertEquals(
                expectedDisplayName,
                member.displayName()
        );
    }
}
