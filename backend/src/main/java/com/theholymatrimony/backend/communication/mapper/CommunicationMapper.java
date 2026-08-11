package com.theholymatrimony.backend.communication.mapper;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.communication.dto.ConversationResponse;
import com.theholymatrimony.backend.communication.dto.ConversationUserResponse;
import com.theholymatrimony.backend.communication.dto.MessageResponse;
import com.theholymatrimony.backend.communication.entity.ChatMessage;
import com.theholymatrimony.backend.communication.entity.Conversation;
import com.theholymatrimony.backend.communication.enums.MessageStatus;
import com.theholymatrimony.backend.communication.repository.ChatMessageRepository;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CommunicationMapper {

    private final ProfileRepository profileRepository;

    private final ChatMessageRepository chatMessageRepository;

    public MessageResponse toMessageResponse(
            ChatMessage message
    ) {

        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(
                        message.getConversation().getId()
                )
                .senderId(
                        message.getSender().getId()
                )
                .receiverId(
                        message.getReceiver().getId()
                )
                .content(message.getContent())
                .mediaUrl(message.getMediaUrl())
                .messageType(message.getMessageType())
                .status(message.getStatus())
                .deliveredAt(message.getDeliveredAt())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
               .updatedAt(message.getUpdatedAt())
.editedAt(message.getEditedAt())
.deletedForEveryone(
        Boolean.TRUE.equals(
                message.getDeletedForEveryone()
        )
)
.deletedAt(message.getDeletedAt())
.build();

    }

    public ConversationResponse toConversationResponse(
            Conversation conversation,
            User currentUser
    ) {

        User otherUser =
                getOtherParticipant(
                        conversation,
                        currentUser.getId()
                );

        long unreadCount =
                chatMessageRepository
                        .countByConversationIdAndReceiverIdAndStatus(
                                conversation.getId(),
                                currentUser.getId(),
                                MessageStatus.SENT
                        );

        UUID lastMessageSenderId =
                conversation.getLastMessageSender() == null
                        ? null
                        : conversation
                                .getLastMessageSender()
                                .getId();

        return ConversationResponse.builder()
                .id(conversation.getId())
                .otherUser(
                        toConversationUserResponse(otherUser)
                )
                .lastMessage(conversation.getLastMessage())
                .lastMessageSenderId(lastMessageSenderId)
                .lastMessageAt(
                        conversation.getLastMessageAt()
                )
                .unreadCount(unreadCount)
                .active(conversation.getActive())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

    public ConversationUserResponse
    toConversationUserResponse(
            User user
    ) {

        Profile profile =
                profileRepository
                        .findByUserId(user.getId())
                        .orElse(null);

        if (profile == null) {
            return ConversationUserResponse.builder()
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .build();
        }

        return ConversationUserResponse.builder()
                .userId(user.getId())
                .profileId(profile.getId())
                .fullName(user.getFullName())
                .gender(profile.getGender())
                .age(profile.getAge())
                .denomination(
                        profile.getDenomination()
                )
                .profession(profile.getProfession())
                .city(profile.getCity())
                .state(profile.getState())
                .country(profile.getCountry())
                .primaryPhotoId(null)
                .primaryPhotoUrl(null)
                .build();
    }

    private User getOtherParticipant(
            Conversation conversation,
            UUID currentUserId
    ) {

        if (conversation.getParticipantOne()
                .getId()
                .equals(currentUserId)) {

            return conversation.getParticipantTwo();
        }

        if (conversation.getParticipantTwo()
                .getId()
                .equals(currentUserId)) {

            return conversation.getParticipantOne();
        }

        throw new AccessDeniedException(
                "You are not a participant in this conversation"
        );
    }
}