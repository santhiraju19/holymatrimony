package com.theholymatrimony.backend.communication.mapper;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.communication.dto.ConversationResponse;
import com.theholymatrimony.backend.communication.dto.ConversationUserResponse;
import com.theholymatrimony.backend.communication.dto.MessageReactionResponse;
import com.theholymatrimony.backend.communication.dto.MessageResponse;
import com.theholymatrimony.backend.communication.entity.ChatMessage;
import com.theholymatrimony.backend.communication.entity.ChatMessageReaction;
import com.theholymatrimony.backend.communication.entity.Conversation;
import com.theholymatrimony.backend.communication.enums.MessageStatus;
import com.theholymatrimony.backend.communication.repository.ChatMessageReactionRepository;
import com.theholymatrimony.backend.communication.repository.ChatMessageRepository;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CommunicationMapper {

    private final ProfileRepository profileRepository;

    private final ChatMessageRepository chatMessageRepository;

    private final ChatMessageReactionRepository
            chatMessageReactionRepository;

    /*
     * ============================================================
     * MESSAGE RESPONSE
     * ============================================================
     */

    public MessageResponse toMessageResponse(
            ChatMessage message
    ) {

        ChatMessage replyToMessage =
                message.getReplyToMessage();

        List<MessageReactionResponse> reactions =
                chatMessageReactionRepository
                        .findAllByMessageIdOrderByCreatedAtAsc(
                                message.getId()
                        )
                        .stream()
                        .map(
                                this::toMessageReactionResponse
                        )
                        .toList();

        return MessageResponse.builder()
                .id(
                        message.getId()
                )
                .conversationId(
                        message.getConversation()
                                .getId()
                )
                .senderId(
                        message.getSender()
                                .getId()
                )
                .receiverId(
                        message.getReceiver()
                                .getId()
                )
                .content(
                        message.getContent()
                )
                .mediaUrl(
                        message.getMediaUrl()
                )
                .messageType(
                        message.getMessageType()
                )
                .status(
                        message.getStatus()
                )
                .deliveredAt(
                        message.getDeliveredAt()
                )
                .readAt(
                        message.getReadAt()
                )
                .createdAt(
                        message.getCreatedAt()
                )
                .updatedAt(
                        message.getUpdatedAt()
                )
                .editedAt(
                        message.getEditedAt()
                )
                .deletedForEveryone(
                        message.getDeletedForEveryone()
                )
                .deletedAt(
                        message.getDeletedAt()
                )

                /*
                 * ==================================================
                 * REPLY SNAPSHOT
                 * ==================================================
                 */

                .replyToMessageId(
                        replyToMessage != null
                                ? replyToMessage.getId()
                                : null
                )
                .replyToSenderId(
                        replyToMessage != null
                                && replyToMessage.getSender() != null
                                ? replyToMessage
                                        .getSender()
                                        .getId()
                                : null
                )
                .replyToContent(
                        replyToMessage != null
                                ? replyToMessage.getContent()
                                : null
                )
                .replyToMediaUrl(
                        replyToMessage != null
                                ? replyToMessage.getMediaUrl()
                                : null
                )
                .replyToMessageType(
                        replyToMessage != null
                                ? replyToMessage.getMessageType()
                                : null
                )
                .replyToDeletedForEveryone(
                        replyToMessage != null
                                ? Boolean.TRUE.equals(
                                        replyToMessage
                                                .getDeletedForEveryone()
                                )
                                : null
                )

                /*
                 * ==================================================
                 * REACTIONS
                 * ==================================================
                 */

                .reactions(
                        reactions
                )
                .build();
    }

    /*
     * ============================================================
     * MESSAGE REACTION RESPONSE
     * ============================================================
     */

    public MessageReactionResponse
    toMessageReactionResponse(
            ChatMessageReaction reaction
    ) {

        return MessageReactionResponse.builder()
                .id(
                        reaction.getId()
                )
                .messageId(
                        reaction.getMessage()
                                .getId()
                )
                .userId(
                        reaction.getUser()
                                .getId()
                )
                .reaction(
                        reaction.getReaction()
                )
                .createdAt(
                        reaction.getCreatedAt()
                )
                .updatedAt(
                        reaction.getUpdatedAt()
                )
                .build();
    }

    /*
     * ============================================================
     * CONVERSATION RESPONSE
     * ============================================================
     */

    public ConversationResponse toConversationResponse(
            Conversation conversation,
            User currentUser
    ) {

        User otherUser =
                getOtherParticipant(
                        conversation,
                        currentUser.getId()
                );

        /*
         * SENT and DELIVERED are both unread.
         *
         * READ is the state that removes a message from
         * the unread counter.
         */

        long unreadCount =
                chatMessageRepository
                        .countByConversationIdAndReceiverIdAndStatusIn(
                                conversation.getId(),
                                currentUser.getId(),
                                List.of(
                                        MessageStatus.SENT,
                                        MessageStatus.DELIVERED
                                )
                        );

        UUID lastMessageSenderId =
                conversation.getLastMessageSender() == null
                        ? null
                        : conversation
                                .getLastMessageSender()
                                .getId();

        return ConversationResponse.builder()
                .id(
                        conversation.getId()
                )
                .otherUser(
                        toConversationUserResponse(
                                otherUser
                        )
                )
                .lastMessage(
                        conversation.getLastMessage()
                )
                .lastMessageSenderId(
                        lastMessageSenderId
                )
                .lastMessageAt(
                        conversation.getLastMessageAt()
                )
                .unreadCount(
                        unreadCount
                )
                .active(
                        conversation.getActive()
                )
                .createdAt(
                        conversation.getCreatedAt()
                )
                .updatedAt(
                        conversation.getUpdatedAt()
                )
                .build();
    }

    /*
     * ============================================================
     * CONVERSATION USER RESPONSE
     * ============================================================
     */

    public ConversationUserResponse
    toConversationUserResponse(
            User user
    ) {

        Profile profile =
                profileRepository
                        .findByUserId(
                                user.getId()
                        )
                        .orElse(
                                null
                        );

        /*
         * A user may exist before their matrimony
         * profile has been completed.
         */

        if (profile == null) {

            return ConversationUserResponse.builder()
                    .userId(
                            user.getId()
                    )
                    .fullName(
                            user.getFullName()
                    )
                    .build();
        }

        return ConversationUserResponse.builder()
                .userId(
                        user.getId()
                )
                .profileId(
                        profile.getId()
                )
                .fullName(
                        user.getFullName()
                )
                .gender(
                        profile.getGender()
                )
                .age(
                        profile.getAge()
                )
                .denomination(
                        profile.getDenomination()
                )
                .profession(
                        profile.getProfession()
                )
                .city(
                        profile.getCity()
                )
                .state(
                        profile.getState()
                )
                .country(
                        profile.getCountry()
                )
                .primaryPhotoId(
                        null
                )
                .primaryPhotoUrl(
                        null
                )
                .build();
    }

    /*
     * ============================================================
     * OTHER CONVERSATION PARTICIPANT
     * ============================================================
     */

    private User getOtherParticipant(
            Conversation conversation,
            UUID currentUserId
    ) {

        if (
                conversation.getParticipantOne()
                        .getId()
                        .equals(
                                currentUserId
                        )
        ) {

            return conversation
                    .getParticipantTwo();
        }

        if (
                conversation.getParticipantTwo()
                        .getId()
                        .equals(
                                currentUserId
                        )
        ) {

            return conversation
                    .getParticipantOne();
        }

        throw new AccessDeniedException(
                "You are not a participant in this conversation"
        );
    }
}