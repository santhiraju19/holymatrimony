package com.theholymatrimony.backend.communication.validator;

import com.theholymatrimony.backend.communication.entity.Conversation;
import com.theholymatrimony.backend.communication.enums.MessageType;
import com.theholymatrimony.backend.interest.enums.InterestStatus;
import com.theholymatrimony.backend.interest.repository.InterestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CommunicationValidator {

    private final InterestRepository interestRepository;

    public void validateDifferentUsers(
            UUID senderId,
            UUID receiverId
    ) {

        if (senderId == null || receiverId == null) {
            throw new IllegalArgumentException(
                    "Sender and receiver IDs are required"
            );
        }

        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException(
                    "You cannot send a message to yourself"
            );
        }
    }

    public void validateAcceptedInterest(
            UUID firstUserId,
            UUID secondUserId
    ) {

        boolean acceptedDirect =
                interestRepository
                        .existsBySenderIdAndReceiverIdAndStatus(
                                firstUserId,
                                secondUserId,
                                InterestStatus.ACCEPTED
                        );

        boolean acceptedReverse =
                interestRepository
                        .existsBySenderIdAndReceiverIdAndStatus(
                                secondUserId,
                                firstUserId,
                                InterestStatus.ACCEPTED
                        );

        if (!acceptedDirect && !acceptedReverse) {
            throw new AccessDeniedException(
                    "Messaging is allowed only after an interest has been accepted"
            );
        }
    }

    public void validateConversationParticipant(
            Conversation conversation,
            UUID userId
    ) {

        if (conversation == null || userId == null) {
            throw new AccessDeniedException(
                    "Conversation access is not allowed"
            );
        }

        boolean participantOne =
                conversation.getParticipantOne()
                        .getId()
                        .equals(userId);

        boolean participantTwo =
                conversation.getParticipantTwo()
                        .getId()
                        .equals(userId);

        if (!participantOne && !participantTwo) {
            throw new AccessDeniedException(
                    "You are not authorized to access this conversation"
            );
        }
    }

    public void validateMessage(
            MessageType messageType,
            String content,
            String mediaUrl
    ) {

        if (messageType == null) {
            throw new IllegalArgumentException(
                    "Message type is required"
            );
        }

        switch (messageType) {

            case TEXT -> validateTextMessage(content);

            case SYSTEM -> validateSystemMessage(content);

            case IMAGE,
                 VIDEO,
                 AUDIO,
                 VOICE_NOTE,
                 FILE,
                 LOCATION -> validateMediaMessage(
                    messageType,
                    mediaUrl
            );
        }
    }

    private void validateTextMessage(
            String content
    ) {

        if (!StringUtils.hasText(content)) {
            throw new IllegalArgumentException(
                    "Message content is required"
            );
        }

        if (content.trim().length() > 2000) {
            throw new IllegalArgumentException(
                    "Message cannot exceed 2000 characters"
            );
        }
    }

    private void validateSystemMessage(
            String content
    ) {

        if (!StringUtils.hasText(content)) {
            throw new IllegalArgumentException(
                    "System message content is required"
            );
        }

        if (content.trim().length() > 2000) {
            throw new IllegalArgumentException(
                    "System message cannot exceed 2000 characters"
            );
        }
    }

    private void validateMediaMessage(
            MessageType messageType,
            String mediaUrl
    ) {

        if (!StringUtils.hasText(mediaUrl)) {
            throw new IllegalArgumentException(
                    "Media URL is required for "
                            + messageType
                            + " messages"
            );
        }

        if (mediaUrl.trim().length() > 1000) {
            throw new IllegalArgumentException(
                    "Media URL cannot exceed 1000 characters"
            );
        }
    }
}