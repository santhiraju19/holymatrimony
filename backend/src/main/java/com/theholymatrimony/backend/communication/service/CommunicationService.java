package com.theholymatrimony.backend.communication.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.communication.dto.ConversationPageResponse;
import com.theholymatrimony.backend.communication.dto.ConversationResponse;
import com.theholymatrimony.backend.communication.dto.MessagePageResponse;
import com.theholymatrimony.backend.communication.dto.MessageResponse;
import com.theholymatrimony.backend.communication.dto.SendMessageRequest;
import com.theholymatrimony.backend.communication.dto.UnreadMessageCountResponse;
import com.theholymatrimony.backend.communication.entity.ChatMessage;
import com.theholymatrimony.backend.communication.entity.Conversation;
import com.theholymatrimony.backend.communication.enums.MessageStatus;
import com.theholymatrimony.backend.communication.enums.MessageType;
import com.theholymatrimony.backend.communication.mapper.CommunicationMapper;
import com.theholymatrimony.backend.communication.repository.ChatMessageRepository;
import com.theholymatrimony.backend.communication.repository.ConversationRepository;
import com.theholymatrimony.backend.communication.validator.CommunicationValidator;
import com.theholymatrimony.backend.notification.service.NotificationFactory;
import com.theholymatrimony.backend.safety.service.SafetyService;
import com.theholymatrimony.backend.communication.entity.ChatMessageReaction;
import com.theholymatrimony.backend.communication.repository.ChatMessageReactionRepository;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.dao.DataIntegrityViolationException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.security.access.AccessDeniedException;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommunicationService {

    private static final int DEFAULT_PAGE_SIZE = 20;

    private static final int MAX_PAGE_SIZE = 100;

    private final UserRepository userRepository;

    private final ConversationRepository conversationRepository;

    private final ChatMessageRepository chatMessageRepository;

    private final CommunicationValidator communicationValidator;

    private final CommunicationMapper communicationMapper;

    private final NotificationFactory notificationFactory;

    private final ChatMessageReactionRepository
        chatMessageReactionRepository;

    private final SafetyService safetyService;


    /*
     * ============================================================
     * SEND MESSAGE
     * ============================================================
     */

    @Transactional
    public MessageResponse sendMessage(
            String authenticatedEmail,
            SendMessageRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Message request is required"
            );
        }

        User sender =
                getUserByEmail(
                        authenticatedEmail
                );

        User receiver =
                getUserById(
                        request.getReceiverUserId()
                );

        communicationValidator
                .validateDifferentUsers(
                        sender.getId(),
                        receiver.getId()
                );

        /*
         * ============================================================
         * SAFETY / BLOCK CHECK
         * ============================================================
         *
         * Messaging is unavailable when either participant has
         * blocked the other. This shared service protects both
         * REST and WebSocket message sends.
         */

        safetyService
                .validateMessagingAllowed(
                        sender.getId(),
                        receiver.getId()
                );

        communicationValidator
                .validateAcceptedInterest(
                        sender.getId(),
                        receiver.getId()
                );

        MessageType messageType =
                request.getMessageType() == null
                        ? MessageType.TEXT
                        : request.getMessageType();

        String content =
                normalizeText(
                        request.getContent()
                );

        String mediaUrl =
                normalizeText(
                        request.getMediaUrl()
                );

        communicationValidator
                .validateMessage(
                        messageType,
                        content,
                        mediaUrl
                );

        Conversation conversation =
                getOrCreateConversation(
                        sender,
                        receiver
                );

        /*
         * ========================================================
         * REPLY TO MESSAGE
         * ========================================================
         */

        ChatMessage replyToMessage =
                resolveReplyToMessage(
                        request.getReplyToMessageId(),
                        conversation,
                        sender,
                        receiver
                );

        /*
         * ========================================================
         * CREATE MESSAGE
         * ========================================================
         */

        ChatMessage message =
                ChatMessage.builder()
                        .conversation(
                                conversation
                        )
                        .sender(
                                sender
                        )
                        .receiver(
                                receiver
                        )
                        .replyToMessage(
                                replyToMessage
                        )
                        .content(
                                content
                        )
                        .mediaUrl(
                                mediaUrl
                        )
                        .messageType(
                                messageType
                        )
                        .status(
                                MessageStatus.SENT
                        )
                        .createdAt(
                                LocalDateTime.now()
                        )
                        .build();

        ChatMessage savedMessage =
                chatMessageRepository
                        .save(
                                message
                        );

        updateConversationPreview(
                conversation,
                savedMessage
        );

        createNewMessageNotificationSafely(
                sender,
                receiver,
                conversation
        );

        return communicationMapper
                .toMessageResponse(
                        savedMessage
                );
    }


    /*
     * ============================================================
     * RESOLVE REPLY MESSAGE
     * ============================================================
     */

    private ChatMessage resolveReplyToMessage(
            UUID replyToMessageId,
            Conversation conversation,
            User sender,
            User receiver
    ) {

        if (replyToMessageId == null) {

            return null;
        }

        ChatMessage replyMessage =
                getMessageById(
                        replyToMessageId
                );

        /*
         * Reply must belong to the same conversation.
         */
        if (
                replyMessage.getConversation() == null
                        ||
                !replyMessage
                        .getConversation()
                        .getId()
                        .equals(
                                conversation.getId()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Reply message must belong to the same conversation"
            );
        }

        UUID originalSenderId =
                replyMessage
                        .getSender()
                        .getId();

        UUID originalReceiverId =
                replyMessage
                        .getReceiver()
                        .getId();

        boolean correctParticipants =
                (
                        originalSenderId.equals(
                                sender.getId()
                        )
                                &&
                        originalReceiverId.equals(
                                receiver.getId()
                        )
                )
                        ||
                (
                        originalSenderId.equals(
                                receiver.getId()
                        )
                                &&
                        originalReceiverId.equals(
                                sender.getId()
                        )
                );

        if (!correctParticipants) {

            throw new AccessDeniedException(
                    "Reply message does not belong to these participants"
            );
        }

        /*
         * New replies cannot be created against
         * an already deleted message.
         *
         * Existing replies remain linked if the
         * original message is deleted afterwards.
         */
        if (
                Boolean.TRUE.equals(
                        replyMessage
                                .getDeletedForEveryone()
                )
        ) {

            throw new IllegalArgumentException(
                    "Cannot reply to a deleted message"
            );
        }

        return replyMessage;
    }


    /*
     * ============================================================
     * NEW MESSAGE NOTIFICATION
     * ============================================================
     */

    private void createNewMessageNotificationSafely(
            User sender,
            User receiver,
            Conversation conversation
    ) {

        try {

            if (
                    sender == null
                            ||
                    receiver == null
                            ||
                    conversation == null
            ) {

                return;
            }

            if (
                    !StringUtils.hasText(
                            receiver.getEmail()
                    )
            ) {

                return;
            }

            if (
                    sender.getId() != null
                            &&
                    sender.getId()
                            .equals(
                                    receiver.getId()
                            )
            ) {

                return;
            }

            notificationFactory
                    .newMessage(
                            receiver
                                    .getEmail()
                                    .trim(),

                            resolveNotificationSenderName(
                                    sender
                            ),

                            conversation
                                    .getId()
                                    .toString(),

                            null
                    );

        } catch (
                RuntimeException exception
        ) {

            /*
             * Notification failure must never
             * roll back a successfully saved message.
             */
            System.err.println(
                    "Failed to create new-message notification: "
                            +
                    exception.getMessage()
            );
        }
    }


    private String resolveNotificationSenderName(
            User sender
    ) {

        if (sender == null) {

            return "A member";
        }

        if (
                StringUtils.hasText(
                        sender.getFullName()
                )
        ) {

            return sender
                    .getFullName()
                    .trim();
        }

        if (
                StringUtils.hasText(
                        sender.getEmail()
                )
        ) {

            return sender
                    .getEmail()
                    .trim();
        }

        return "A member";
    }


    /*
     * ============================================================
     * GET USER EMAIL FOR REALTIME DELIVERY
     * ============================================================
     */

    @Transactional(readOnly = true)
    public String getUserEmail(
            UUID userId
    ) {

        User user =
                getUserById(
                        userId
                );

        if (
                !StringUtils.hasText(
                        user.getEmail()
                )
        ) {

            throw new IllegalStateException(
                    "User email is unavailable"
            );
        }

        return user
                .getEmail()
                .trim();
    }


    /*
     * ============================================================
     * GET CONVERSATIONS
     * ============================================================
     */

    @Transactional(readOnly = true)
    public ConversationPageResponse
    getConversations(
            String authenticatedEmail,
            int page,
            int size
    ) {

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        Pageable pageable =
                PageRequest.of(
                        validatePage(
                                page
                        ),
                        validateSize(
                                size
                        ),
                        Sort.by(
                                Sort.Order.desc(
                                        "lastMessageAt"
                                ),
                                Sort.Order.desc(
                                        "createdAt"
                                )
                        )
                );

      Page<Conversation> conversationPage =
        conversationRepository
                .findVisibleConversationsForUser(
                        currentUser.getId(),
                        pageable
                );

        List<ConversationResponse> responses =
                conversationPage
                        .getContent()
                        .stream()
                        .map(
                                conversation ->
                                        communicationMapper
                                                .toConversationResponse(
                                                        conversation,
                                                        currentUser
                                                )
                        )
                        .toList();

        return ConversationPageResponse
                .builder()
                .conversations(
                        responses
                )
                .page(
                        conversationPage
                                .getNumber()
                )
                .size(
                        conversationPage
                                .getSize()
                )
                .totalElements(
                        conversationPage
                                .getTotalElements()
                )
                .totalPages(
                        conversationPage
                                .getTotalPages()
                )
                .first(
                        conversationPage
                                .isFirst()
                )
                .last(
                        conversationPage
                                .isLast()
                )
                .hasNext(
                        conversationPage
                                .hasNext()
                )
                .hasPrevious(
                        conversationPage
                                .hasPrevious()
                )
                .build();
    }


    /*
     * ============================================================
     * GET MESSAGES
     * ============================================================
     */

    @Transactional(readOnly = true)
    public MessagePageResponse getMessages(
            String authenticatedEmail,
            UUID conversationId,
            int page,
            int size
    ) {

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        Conversation conversation =
                getConversationById(
                        conversationId
                );

        communicationValidator
                .validateConversationParticipant(
                        conversation,
                        currentUser.getId()
                );

        Pageable pageable =
                PageRequest.of(
                        validatePage(
                                page
                        ),
                        validateSize(
                                size
                        )
                );

        Page<ChatMessage> messagePage =
                chatMessageRepository
                        .findAllByConversationIdOrderByCreatedAtDesc(
                                conversationId,
                                pageable
                        );

        List<MessageResponse> responses =
                messagePage
                        .getContent()
                        .stream()
                        .map(
                                communicationMapper
                                        ::toMessageResponse
                        )
                        .toList();

        return MessagePageResponse
                .builder()
                .messages(
                        responses
                )
                .page(
                        messagePage
                                .getNumber()
                )
                .size(
                        messagePage
                                .getSize()
                )
                .totalElements(
                        messagePage
                                .getTotalElements()
                )
                .totalPages(
                        messagePage
                                .getTotalPages()
                )
                .first(
                        messagePage
                                .isFirst()
                )
                .last(
                        messagePage
                                .isLast()
                )
                .hasNext(
                        messagePage
                                .hasNext()
                )
                .hasPrevious(
                        messagePage
                                .hasPrevious()
                )
                .build();
    }


    /*
     * ============================================================
     * EDIT MESSAGE
     * ============================================================
     *
     * IMPORTANT:
     * This signature matches your existing
     * CommunicationController.
     * ============================================================
     */

    @Transactional
    public MessageResponse editMessage(
            String authenticatedEmail,
            UUID messageId,
            String newContent
    ) {

        String content =
                normalizeText(
                        newContent
                );

        if (
                !StringUtils.hasText(
                        content
                )
        ) {

            throw new IllegalArgumentException(
                    "Message cannot be empty"
            );
        }

        if (
                content.length()
                        > 2000
        ) {

            throw new IllegalArgumentException(
                    "Message cannot exceed 2000 characters"
            );
        }

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        ChatMessage message =
                getMessageById(
                        messageId
                );

        validateMessageSender(
                message,
                currentUser
        );

        if (
                Boolean.TRUE.equals(
                        message
                                .getDeletedForEveryone()
                )
        ) {

            throw new IllegalStateException(
                    "Deleted messages cannot be edited"
            );
        }

        if (
                message.getMessageType()
                        != MessageType.TEXT
        ) {

            throw new IllegalArgumentException(
                    "Only text messages can be edited"
            );
        }

        message.setContent(
                content
        );

        message.setEditedAt(
                LocalDateTime.now()
        );

        ChatMessage savedMessage =
                chatMessageRepository
                        .save(
                                message
                        );

        updateConversationPreviewAfterMutation(
                savedMessage
        );

        return communicationMapper
                .toMessageResponse(
                        savedMessage
                );
    }


    /*
     * ============================================================
     * DELETE MESSAGE FOR EVERYONE
     * ============================================================
     *
     * IMPORTANT:
     * Method name matches your existing controller.
     * ============================================================
     */

    @Transactional
    public MessageResponse deleteMessageForEveryone(
            String authenticatedEmail,
            UUID messageId
    ) {

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        ChatMessage message =
                getMessageById(
                        messageId
                );

        validateMessageSender(
                message,
                currentUser
        );

        /*
         * Idempotent delete.
         */
        if (
                Boolean.TRUE.equals(
                        message
                                .getDeletedForEveryone()
                )
        ) {

            return communicationMapper
                    .toMessageResponse(
                            message
                    );
        }

        LocalDateTime now =
                LocalDateTime.now();

        message.setDeletedForEveryone(
                true
        );

        message.setDeletedAt(
                now
        );

        /*
         * Preserve the database row because other
         * messages may reference it as replyToMessage.
         */
        message.setContent(
                null
        );

        message.setMediaUrl(
                null
        );

        ChatMessage savedMessage =
                chatMessageRepository
                        .save(
                                message
                        );

        updateConversationPreviewAfterMutation(
                savedMessage
        );

        return communicationMapper
                .toMessageResponse(
                        savedMessage
                );
    }

    /*
 * ============================================================
 * MESSAGE REACTIONS
 * ============================================================
 */

@Transactional
public MessageResponse reactToMessage(
        String authenticatedEmail,
        UUID messageId,
        String reaction
) {

    User currentUser =
            getUserByEmail(
                    authenticatedEmail
            );

    ChatMessage message =
            getMessageById(
                    messageId
            );

    /*
     * User must be one of the two participants
     * in the conversation.
     */
    communicationValidator
            .validateConversationParticipant(
                    message
                            .getConversation(),
                    currentUser
                            .getId()
            );

    /*
     * Deleted messages cannot receive reactions.
     */
    if (
            Boolean.TRUE.equals(
                    message
                            .getDeletedForEveryone()
            )
    ) {

        throw new IllegalStateException(
                "Deleted messages cannot receive reactions"
        );
    }

    String normalizedReaction =
            normalizeReaction(
                    reaction
            );

    /*
     * A user may have only one reaction per message.
     *
     * If one already exists, update it.
     * Otherwise create a new reaction.
     */
    ChatMessageReaction messageReaction =
            chatMessageReactionRepository
                    .findByMessageIdAndUserId(
                            message.getId(),
                            currentUser.getId()
                    )
                    .orElseGet(
                            () ->
                                    ChatMessageReaction
                                            .builder()
                                            .message(
                                                    message
                                            )
                                            .user(
                                                    currentUser
                                            )
                                            .build()
                    );

    messageReaction.setReaction(
            normalizedReaction
    );

    chatMessageReactionRepository
            .save(
                    messageReaction
            );

    /*
     * Flush before mapping so the response contains
     * the newly created/updated reaction immediately.
     */
    chatMessageReactionRepository
            .flush();

    return communicationMapper
            .toMessageResponse(
                    message
            );
}


/*
 * ============================================================
 * REMOVE MESSAGE REACTION
 * ============================================================
 */

@Transactional
public MessageResponse removeMessageReaction(
        String authenticatedEmail,
        UUID messageId
) {

    User currentUser =
            getUserByEmail(
                    authenticatedEmail
            );

    ChatMessage message =
            getMessageById(
                    messageId
            );

    communicationValidator
            .validateConversationParticipant(
                    message
                            .getConversation(),
                    currentUser
                            .getId()
            );

    chatMessageReactionRepository
            .findByMessageIdAndUserId(
                    message.getId(),
                    currentUser.getId()
            )
            .ifPresent(
                    chatMessageReactionRepository
                            ::delete
            );

    /*
     * Make DELETE visible before the mapper queries
     * reactions again.
     */
    chatMessageReactionRepository
            .flush();

    return communicationMapper
            .toMessageResponse(
                    message
            );
}


/*
 * ============================================================
 * NORMALIZE MESSAGE REACTION
 * ============================================================
 */

private String normalizeReaction(
        String reaction
) {

    if (
            !StringUtils.hasText(
                    reaction
            )
    ) {

        throw new IllegalArgumentException(
                "Reaction is required"
        );
    }

    String normalized =
            reaction.trim();

    /*
     * Keep the first production reaction set intentionally
     * small. More reactions can be added later without
     * changing the database schema.
     */
    List<String> allowedReactions =
            List.of(
                    "👍",
                    "❤️",
                    "😂",
                    "🙏",
                    "😮",
                    "😢"
            );

    if (
            !allowedReactions.contains(
                    normalized
            )
    ) {

        throw new IllegalArgumentException(
                "Unsupported message reaction"
        );
    }

    return normalized;
}

    /*
     * ============================================================
     * VALIDATE MESSAGE OWNER
     * ============================================================
     */

    private void validateMessageSender(
            ChatMessage message,
            User currentUser
    ) {

        if (
                message == null
                        ||
                message.getSender() == null
                        ||
                currentUser == null
                        ||
                !message
                        .getSender()
                        .getId()
                        .equals(
                                currentUser.getId()
                        )
        ) {

            throw new AccessDeniedException(
                    "Only the sender can modify this message"
            );
        }
    }


    /*
     * ============================================================
     * MARK MESSAGE AS DELIVERED
     * ============================================================
     */

    @Transactional
    public MessageResponse markMessageAsDelivered(
            String authenticatedEmail,
            UUID messageId
    ) {

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        ChatMessage message =
                getMessageById(
                        messageId
                );

        if (
                !message
                        .getReceiver()
                        .getId()
                        .equals(
                                currentUser.getId()
                        )
        ) {

            throw new AccessDeniedException(
                    "Only the receiver can mark a message as delivered"
            );
        }

        if (
                message.getStatus()
                        == MessageStatus.READ
                        ||
                message.getStatus()
                        == MessageStatus.DELIVERED
        ) {

            return communicationMapper
                    .toMessageResponse(
                            message
                    );
        }

        if (
                Boolean.TRUE.equals(
                        message
                                .getDeletedForEveryone()
                )
        ) {

            return communicationMapper
                    .toMessageResponse(
                            message
                    );
        }

        LocalDateTime deliveredAt =
                LocalDateTime.now();

        chatMessageRepository
                .markMessageAsDelivered(
                        messageId,
                        currentUser.getId(),
                        MessageStatus.SENT,
                        MessageStatus.DELIVERED,
                        deliveredAt
                );

        ChatMessage updatedMessage =
                getMessageById(
                        messageId
                );

        return communicationMapper
                .toMessageResponse(
                        updatedMessage
                );
    }


    /*
     * ============================================================
     * MARK CONVERSATION AS READ
     * ============================================================
     */

    @Transactional
    public List<MessageResponse>
    markConversationAsRead(
            String authenticatedEmail,
            UUID conversationId
    ) {

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        Conversation conversation =
                getConversationById(
                        conversationId
                );

        communicationValidator
                .validateConversationParticipant(
                        conversation,
                        currentUser.getId()
                );

        List<ChatMessage> unreadMessages =
                chatMessageRepository
                        .findAllByConversationIdAndReceiverIdAndStatusInOrderByCreatedAtAsc(
                                conversationId,
                                currentUser.getId(),
                                List.of(
                                        MessageStatus.SENT,
                                        MessageStatus.DELIVERED
                                )
                        );

        if (
                unreadMessages.isEmpty()
        ) {

            return List.of();
        }

        LocalDateTime readAt =
                LocalDateTime.now();

        List<ChatMessage> messagesToSave =
                unreadMessages
                        .stream()
                        .filter(
                                message ->
                                        !Boolean.TRUE.equals(
                                                message
                                                        .getDeletedForEveryone()
                                        )
                        )
                        .peek(
                                message -> {

                                    message.setStatus(
                                            MessageStatus.READ
                                    );

                                    message.setReadAt(
                                            readAt
                                    );

                                    if (
                                            message.getDeliveredAt()
                                                    == null
                                    ) {

                                        message.setDeliveredAt(
                                                readAt
                                        );
                                    }
                                }
                        )
                        .toList();

        if (
                messagesToSave.isEmpty()
        ) {

            return List.of();
        }

        List<ChatMessage> savedMessages =
                chatMessageRepository
                        .saveAll(
                                messagesToSave
                        );

        return savedMessages
                .stream()
                .map(
                        communicationMapper
                                ::toMessageResponse
                )
                .toList();
    }


    /*
     * ============================================================
     * TOTAL UNREAD COUNT
     * ============================================================
     */

    @Transactional(readOnly = true)
    public UnreadMessageCountResponse
    getUnreadCount(
            String authenticatedEmail
    ) {

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        long unreadCount =
                chatMessageRepository
                        .countByReceiverIdAndStatusIn(
                                currentUser.getId(),
                                List.of(
                                        MessageStatus.SENT,
                                        MessageStatus.DELIVERED
                                )
                        );

        return UnreadMessageCountResponse
                .builder()
                .unreadCount(
                        unreadCount
                )
                .build();
    }


    /*
     * ============================================================
     * CONVERSATION UNREAD COUNT
     * ============================================================
     */

    @Transactional(readOnly = true)
    public UnreadMessageCountResponse
    getConversationUnreadCount(
            String authenticatedEmail,
            UUID conversationId
    ) {

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        Conversation conversation =
                getConversationById(
                        conversationId
                );

        communicationValidator
                .validateConversationParticipant(
                        conversation,
                        currentUser.getId()
                );

        long unreadCount =
                chatMessageRepository
                        .countByConversationIdAndReceiverIdAndStatusIn(
                                conversationId,
                                currentUser.getId(),
                                List.of(
                                        MessageStatus.SENT,
                                        MessageStatus.DELIVERED
                                )
                        );

        return UnreadMessageCountResponse
                .builder()
                .unreadCount(
                        unreadCount
                )
                .build();
    }


    /*
     * ============================================================
     * CREATE CONVERSATION AFTER INTEREST ACCEPTANCE
     * ============================================================
     */

    @Transactional
    public UUID ensureConversationExists(
            UUID firstUserId,
            UUID secondUserId
    ) {

        User firstUser =
                getUserById(
                        firstUserId
                );

        User secondUser =
                getUserById(
                        secondUserId
                );

        communicationValidator
                .validateDifferentUsers(
                        firstUser.getId(),
                        secondUser.getId()
                );

        communicationValidator
                .validateAcceptedInterest(
                        firstUser.getId(),
                        secondUser.getId()
                );

        Conversation conversation =
                getOrCreateConversation(
                        firstUser,
                        secondUser
                );

        return conversation
                .getId();
    }


    /*
     * ============================================================
     * GET OR CREATE CONVERSATION
     * ============================================================
     */

    private Conversation getOrCreateConversation(
            User firstUser,
            User secondUser
    ) {

        OrderedParticipants participants =
                orderParticipants(
                        firstUser,
                        secondUser
                );

        return conversationRepository
                .findByParticipantOneIdAndParticipantTwoId(
                        participants
                                .participantOne()
                                .getId(),

                        participants
                                .participantTwo()
                                .getId()
                )
                .orElseGet(
                        () ->
                                createConversationSafely(
                                        participants
                                                .participantOne(),

                                        participants
                                                .participantTwo()
                                )
                );
    }


    /*
     * ============================================================
     * CREATE CONVERSATION SAFELY
     * ============================================================
     */

    private Conversation createConversationSafely(
            User participantOne,
            User participantTwo
    ) {

        try {

            Conversation conversation =
                    Conversation.builder()
                            .participantOne(
                                    participantOne
                            )
                            .participantTwo(
                                    participantTwo
                            )
                            .active(
                                    true
                            )
                            .createdAt(
                                    LocalDateTime.now()
                            )
                            .build();

            return conversationRepository
                    .saveAndFlush(
                            conversation
                    );

        } catch (
                DataIntegrityViolationException exception
        ) {

            return conversationRepository
                    .findByParticipantOneIdAndParticipantTwoId(
                            participantOne.getId(),
                            participantTwo.getId()
                    )
                    .orElseThrow(
                            () -> exception
                    );
        }
    }


    /*
     * ============================================================
     * ORDER PARTICIPANTS
     * ============================================================
     */

    private OrderedParticipants orderParticipants(
            User firstUser,
            User secondUser
    ) {

        if (
                compareUuid(
                        firstUser.getId(),
                        secondUser.getId()
                ) <= 0
        ) {

            return new OrderedParticipants(
                    firstUser,
                    secondUser
            );
        }

        return new OrderedParticipants(
                secondUser,
                firstUser
        );
    }


    /*
     * ============================================================
     * UPDATE CONVERSATION PREVIEW
     * ============================================================
     */

    private void updateConversationPreview(
            Conversation conversation,
            ChatMessage message
    ) {
/*
 * A newly exchanged message makes the conversation
 * visible again to both participants.
 *
 * This does not restore physically deleted data because
 * nothing was physically deleted in the first place.
 */
conversation.setParticipantOneDeletedAt(
        null
);

conversation.setParticipantTwoDeletedAt(
        null
);
        conversation.setLastMessage(
                buildMessagePreview(
                        message
                )
        );

        conversation.setLastMessageSender(
                message.getSender()
        );

        conversation.setLastMessageAt(
                message.getCreatedAt()
        );

        conversation.setActive(
                true
        );

        conversationRepository
                .save(
                        conversation
                );
    }


    /*
     * ============================================================
     * UPDATE PREVIEW AFTER EDIT / DELETE
     * ============================================================
     */

    private void updateConversationPreviewAfterMutation(
            ChatMessage message
    ) {

        if (
                message == null
                        ||
                message.getConversation() == null
        ) {

            return;
        }

        Conversation conversation =
                message.getConversation();

        /*
         * Editing/deleting an old message must not
         * replace the true latest-message preview.
         */
        if (
                conversation.getLastMessageAt()
                        == null
                        ||
                message.getCreatedAt()
                        == null
                        ||
                !conversation
                        .getLastMessageAt()
                        .equals(
                                message.getCreatedAt()
                        )
        ) {

            return;
        }

        conversation.setLastMessage(
                buildMessagePreview(
                        message
                )
        );

        conversation.setLastMessageSender(
                message.getSender()
        );

        conversationRepository
                .save(
                        conversation
                );
    }


    /*
     * ============================================================
     * BUILD MESSAGE PREVIEW
     * ============================================================
     */

    private String buildMessagePreview(
            ChatMessage message
    ) {

        if (
                Boolean.TRUE.equals(
                        message
                                .getDeletedForEveryone()
                )
        ) {

            return "This message was deleted";
        }

        MessageType messageType =
                message.getMessageType();

        if (
                messageType == null
        ) {

            return truncate(
                    message.getContent(),
                    500
            );
        }

        return switch (
                messageType
        ) {

            case TEXT ->
                    truncate(
                            message.getContent(),
                            500
                    );

            case IMAGE ->
                    StringUtils.hasText(
                            message.getContent()
                    )
                            ? truncate(
                                    message.getContent(),
                                    500
                            )
                            : "📷 Image";

            case VIDEO ->
                    "🎥 Video";

            case AUDIO ->
                    "🎵 Audio";

            case VOICE_NOTE ->
                    "🎙 Voice note";

            case FILE ->
                    "📎 File";

            case LOCATION ->
                    "📍 Location";

            case SYSTEM ->
                    truncate(
                            message.getContent(),
                            500
                    );
        };
    }

    /*
 * ============================================================
 * DELETE CONVERSATION FOR CURRENT USER
 * ============================================================
 *
 * This is a soft per-user deletion.
 *
 * The shared conversation and messages remain intact.
 * The other participant is not affected.
 */
@Transactional
public void deleteConversationForUser(
        String authenticatedEmail,
        UUID conversationId
) {

    User currentUser =
            getUserByEmail(
                    authenticatedEmail
            );

    Conversation conversation =
            getConversationById(
                    conversationId
            );

    communicationValidator
            .validateConversationParticipant(
                    conversation,
                    currentUser.getId()
            );

    LocalDateTime deletedAt =
            LocalDateTime.now();

    if (
            conversation
                    .getParticipantOne()
                    .getId()
                    .equals(
                            currentUser.getId()
                    )
    ) {

        conversation
                .setParticipantOneDeletedAt(
                        deletedAt
                );

    } else {

        conversation
                .setParticipantTwoDeletedAt(
                        deletedAt
                );
    }

    conversationRepository
            .save(
                    conversation
            );
}

    /*
     * ============================================================
     * ENTITY LOOKUPS
     * ============================================================
     */

    private User getUserByEmail(
            String email
    ) {

        if (
                !StringUtils.hasText(
                        email
                )
        ) {

            throw new AccessDeniedException(
                    "Authenticated user is required"
            );
        }

        return userRepository
                .findByEmail(
                        email.trim()
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Authenticated user was not found"
                                )
                );
    }


    private User getUserById(
            UUID userId
    ) {

        if (
                userId == null
        ) {

            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        return userRepository
                .findById(
                        userId
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "User was not found"
                                )
                );
    }


    private Conversation getConversationById(
            UUID conversationId
    ) {

        if (
                conversationId == null
        ) {

            throw new IllegalArgumentException(
                    "Conversation ID is required"
            );
        }

        return conversationRepository
                .findById(
                        conversationId
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Conversation was not found"
                                )
                );
    }


    private ChatMessage getMessageById(
            UUID messageId
    ) {

        if (
                messageId == null
        ) {

            throw new IllegalArgumentException(
                    "Message ID is required"
            );
        }

        return chatMessageRepository
                .findById(
                        messageId
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Message was not found"
                                )
                );
    }


    /*
     * ============================================================
     * PAGINATION
     * ============================================================
     */

    private int validatePage(
            int page
    ) {

        if (
                page < 0
        ) {

            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        return page;
    }


    private int validateSize(
            int size
    ) {

        if (
                size <= 0
        ) {

            return DEFAULT_PAGE_SIZE;
        }

        return Math.min(
                size,
                MAX_PAGE_SIZE
        );
    }


    /*
     * ============================================================
     * TEXT UTILITIES
     * ============================================================
     */

    private String normalizeText(
            String value
    ) {

        if (
                !StringUtils.hasText(
                        value
                )
        ) {

            return null;
        }

        return value.trim();
    }


    private String truncate(
            String value,
            int maximumLength
    ) {

        if (
                value == null
        ) {

            return null;
        }

        if (
                value.length()
                        <= maximumLength
        ) {

            return value;
        }

        return value.substring(
                0,
                maximumLength
        );
    }


    /*
     * ============================================================
     * UUID ORDERING
     * ============================================================
     */

    private int compareUuid(
            UUID first,
            UUID second
    ) {

        int mostSignificantComparison =
                Long.compareUnsigned(
                        first.getMostSignificantBits(),
                        second.getMostSignificantBits()
                );

        if (
                mostSignificantComparison
                        != 0
        ) {

            return mostSignificantComparison;
        }

        return Long.compareUnsigned(
                first.getLeastSignificantBits(),
                second.getLeastSignificantBits()
        );
    }


    private record OrderedParticipants(
            User participantOne,
            User participantTwo
    ) {
    }
}