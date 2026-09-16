package com.theholymatrimony.backend.secureconnect.realtime;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SecureConnectRealtimePublisherImpl
        implements SecureConnectRealtimePublisher {

    private static final String DESTINATION =
            "/queue/secure-connect";

    private final SimpMessagingTemplate messagingTemplate;
    private final ProfileRepository profileRepository;

    @Override
    public void publishIncomingCall(
            SecureConnectCallSession call
    ) {
        publishToParticipant(
                call.getCallee(),
                call.getCaller(),
                call,
                SecureConnectCallEventType.CALL_INCOMING
        );
    }

    @Override
    public void publishAcceptedCall(
            SecureConnectCallSession call
    ) {
        publishToParticipant(
                call.getCaller(),
                call.getCallee(),
                call,
                SecureConnectCallEventType.CALL_ACCEPTED
        );
    }

    @Override
    public void publishDeclinedCall(
            SecureConnectCallSession call
    ) {
        publishToParticipant(
                call.getCaller(),
                call.getCallee(),
                call,
                SecureConnectCallEventType.CALL_DECLINED
        );
    }

    @Override
    public void publishCancelledCall(
            SecureConnectCallSession call
    ) {
        publishToParticipant(
                call.getCallee(),
                call.getCaller(),
                call,
                SecureConnectCallEventType.CALL_CANCELLED
        );
    }

    @Override
    public void publishMissedCall(
            SecureConnectCallSession call
    ) {
        publishToParticipant(
                call.getCaller(),
                call.getCallee(),
                call,
                SecureConnectCallEventType.CALL_MISSED
        );

        publishToParticipant(
                call.getCallee(),
                call.getCaller(),
                call,
                SecureConnectCallEventType.CALL_MISSED
        );
    }

    @Override
    public void publishFailedCall(
            SecureConnectCallSession call
    ) {
        publishToParticipant(
                call.getCaller(),
                call.getCallee(),
                call,
                SecureConnectCallEventType.CALL_FAILED
        );

        publishToParticipant(
                call.getCallee(),
                call.getCaller(),
                call,
                SecureConnectCallEventType.CALL_FAILED
        );
    }

    @Override
    public void publishEndedCall(
            SecureConnectCallSession call,
            User actor
    ) {
        if (call == null || actor == null) {
            return;
        }

        UUID actorId = actor.getId();

        if (actorId == null) {
            return;
        }

        User caller = call.getCaller();
        User callee = call.getCallee();

        if (caller == null || callee == null) {
            return;
        }

        User recipient;
        User otherMember;

        if (actorId.equals(caller.getId())) {
            recipient = callee;
            otherMember = caller;
        } else if (actorId.equals(callee.getId())) {
            recipient = caller;
            otherMember = callee;
        } else {
            return;
        }

        publishToParticipant(
                recipient,
                otherMember,
                call,
                SecureConnectCallEventType.CALL_ENDED
        );
    }

    private void publishToParticipant(
            User recipient,
            User otherMember,
            SecureConnectCallSession call,
            SecureConnectCallEventType eventType
    ) {
        if (recipient == null
                || otherMember == null
                || call == null
                || eventType == null
                || !StringUtils.hasText(recipient.getEmail())) {
            return;
        }

        /*
         * Build every value while the transaction/entity context is
         * still available. The afterCommit callback therefore carries
         * only immutable data and never touches JPA entities.
         */
        String recipientEmail =
                recipient
                        .getEmail()
                        .trim()
                        .toLowerCase();

        SecureConnectCallEvent event =
                new SecureConnectCallEvent(
                        eventType,
                        call.getId(),
                        call.getMediaType(),
                        call.getStatus(),
                        toMember(otherMember),
                        LocalDateTime.now()
                );

        sendAfterCommit(
                recipientEmail,
                event
        );
    }

    private void sendAfterCommit(
            String recipientEmail,
            SecureConnectCallEvent event
    ) {
        if (TransactionSynchronizationManager
                .isActualTransactionActive()
                && TransactionSynchronizationManager
                .isSynchronizationActive()) {

            TransactionSynchronizationManager
                    .registerSynchronization(
                            new TransactionSynchronization() {
                                @Override
                                public void afterCommit() {
                                    send(
                                            recipientEmail,
                                            event
                                    );
                                }
                            }
                    );

            return;
        }

        /*
         * Publisher tests, maintenance operations and any future
         * non-transactional callers still receive normal delivery.
         */
        send(
                recipientEmail,
                event
        );
    }

    private void send(
            String recipientEmail,
            SecureConnectCallEvent event
    ) {
        messagingTemplate.convertAndSendToUser(
                recipientEmail,
                DESTINATION,
                event
        );
    }

    private SecureConnectCallMember toMember(
            User user
    ) {
        String memberId =
                profileRepository
                        .findByUserId(user.getId())
                        .map(Profile::getMemberId)
                        .filter(StringUtils::hasText)
                        .map(String::trim)
                        .orElse(null);

        String displayName =
                StringUtils.hasText(
                        user.getFullName()
                )
                        ? user.getFullName().trim()
                        : null;

        return new SecureConnectCallMember(
                user.getId(),
                memberId,
                displayName
        );
    }
}
