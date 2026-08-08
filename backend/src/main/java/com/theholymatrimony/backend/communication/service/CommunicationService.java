package com.theholymatrimony.backend.communication.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.communication.dto.*;
import com.theholymatrimony.backend.communication.entity.ChatMessage;
import com.theholymatrimony.backend.communication.entity.Conversation;
import com.theholymatrimony.backend.communication.enums.MessageStatus;
import com.theholymatrimony.backend.communication.enums.MessageType;
import com.theholymatrimony.backend.communication.mapper.CommunicationMapper;
import com.theholymatrimony.backend.communication.repository.ChatMessageRepository;
import com.theholymatrimony.backend.communication.repository.ConversationRepository;
import com.theholymatrimony.backend.communication.validator.CommunicationValidator;
import com.theholymatrimony.backend.notification.service.NotificationFactory;
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
                getUserByEmail(authenticatedEmail);

        User receiver =
                getUserById(
                        request.getReceiverUserId()
                );

        communicationValidator.validateDifferentUsers(
                sender.getId(),
                receiver.getId()
        );

        communicationValidator.validateAcceptedInterest(
                sender.getId(),
                receiver.getId()
        );

        MessageType messageType =
                request.getMessageType() == null
                        ? MessageType.TEXT
                        : request.getMessageType();

        String content =
                normalizeText(request.getContent());

        String mediaUrl =
                normalizeText(request.getMediaUrl());

        communicationValidator.validateMessage(
                messageType,
                content,
                mediaUrl
        );

        Conversation conversation =
                getOrCreateConversation(
                        sender,
                        receiver
                );

        ChatMessage message =
                ChatMessage.builder()
                        .conversation(conversation)
                        .sender(sender)
                        .receiver(receiver)
                        .content(content)
                        .mediaUrl(mediaUrl)
                        .messageType(messageType)
                        .status(MessageStatus.SENT)
                        .createdAt(LocalDateTime.now())
                        .build();

        ChatMessage savedMessage =
                chatMessageRepository.save(message);

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
                .toMessageResponse(savedMessage);
    }

    private void createNewMessageNotificationSafely(
            User sender,
            User receiver,
            Conversation conversation
    ) {

        try {

            if (sender == null || receiver == null || conversation == null) {
                return;
            }

            if (!StringUtils.hasText(receiver.getEmail())) {
                return;
            }

            if (sender.getId() != null && sender.getId().equals(receiver.getId())) {
                return;
            }

            notificationFactory.newMessage(
                    receiver.getEmail().trim(),
                    resolveNotificationSenderName(sender),
                    conversation.getId().toString(),
                    null
            );

        } catch (RuntimeException exception) {
            System.err.println(
                    "Failed to create new-message notification: "
                            + exception.getMessage()
            );
        }
    }

    private String resolveNotificationSenderName(
            User sender
    ) {

        if (sender == null) {
            return "A member";
        }

        if (StringUtils.hasText(sender.getEmail())) {
            return sender.getEmail().trim();
        }

        return "A member";
    }

    /*
 * ============================================================
 * GET USER EMAIL FOR REAL-TIME DELIVERY
 * ============================================================
 */

@Transactional(readOnly = true)
public String getUserEmail(
        UUID userId
) {
    User user = getUserById(userId);

    if (!StringUtils.hasText(user.getEmail())) {
        throw new IllegalStateException(
                "User email is unavailable"
        );
    }

    return user.getEmail().trim();
}

    /*
     * ============================================================
     * GET CONVERSATIONS
     * ============================================================
     */

    @Transactional(readOnly = true)
    public ConversationPageResponse getConversations(
            String authenticatedEmail,
            int page,
            int size
    ) {

        User currentUser =
                getUserByEmail(authenticatedEmail);

        Pageable pageable =
                PageRequest.of(
                        validatePage(page),
                        validateSize(size),
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
                        .findAllByParticipantOneIdOrParticipantTwoId(
                                currentUser.getId(),
                                currentUser.getId(),
                                pageable
                        );

        List<ConversationResponse> responses =
                conversationPage.getContent()
                        .stream()
                        .map(conversation ->
                                communicationMapper
                                        .toConversationResponse(
                                                conversation,
                                                currentUser
                                        )
                        )
                        .toList();

        return ConversationPageResponse.builder()
                .conversations(responses)
                .page(conversationPage.getNumber())
                .size(conversationPage.getSize())
                .totalElements(
                        conversationPage.getTotalElements()
                )
                .totalPages(
                        conversationPage.getTotalPages()
                )
                .first(conversationPage.isFirst())
                .last(conversationPage.isLast())
                .hasNext(conversationPage.hasNext())
                .hasPrevious(
                        conversationPage.hasPrevious()
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
                getUserByEmail(authenticatedEmail);

        Conversation conversation =
                getConversationById(conversationId);

        communicationValidator
                .validateConversationParticipant(
                        conversation,
                        currentUser.getId()
                );

        Pageable pageable =
                PageRequest.of(
                        validatePage(page),
                        validateSize(size)
                );

        Page<ChatMessage> messagePage =
                chatMessageRepository
                        .findAllByConversationIdOrderByCreatedAtDesc(
                                conversationId,
                                pageable
                        );

        List<MessageResponse> responses =
                messagePage.getContent()
                        .stream()
                        .map(
                                communicationMapper
                                        ::toMessageResponse
                        )
                        .toList();

        return MessagePageResponse.builder()
                .messages(responses)
                .page(messagePage.getNumber())
                .size(messagePage.getSize())
                .totalElements(
                        messagePage.getTotalElements()
                )
                .totalPages(
                        messagePage.getTotalPages()
                )
                .first(messagePage.isFirst())
                .last(messagePage.isLast())
                .hasNext(messagePage.hasNext())
                .hasPrevious(
                        messagePage.hasPrevious()
                )
                .build();
    }

    /*
     * ============================================================
     * MARK CONVERSATION AS READ
     * ============================================================
     */

    @Transactional
    public int markConversationAsRead(
            String authenticatedEmail,
            UUID conversationId
    ) {

        User currentUser =
                getUserByEmail(authenticatedEmail);

        Conversation conversation =
                getConversationById(conversationId);

        communicationValidator
                .validateConversationParticipant(
                        conversation,
                        currentUser.getId()
                );

        return chatMessageRepository
                .markConversationMessagesAsRead(
                        conversationId,
                        currentUser.getId(),
                        MessageStatus.READ,
                        LocalDateTime.now()
                );
    }

    /*
     * ============================================================
     * TOTAL UNREAD COUNT
     * ============================================================
     */

    @Transactional(readOnly = true)
    public UnreadMessageCountResponse getUnreadCount(
            String authenticatedEmail
    ) {

        User currentUser =
                getUserByEmail(authenticatedEmail);

        long unreadCount =
                chatMessageRepository
                        .countByReceiverIdAndStatus(
                                currentUser.getId(),
                                MessageStatus.SENT
                        );

        return UnreadMessageCountResponse.builder()
                .unreadCount(unreadCount)
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
                getUserByEmail(authenticatedEmail);

        Conversation conversation =
                getConversationById(conversationId);

        communicationValidator
                .validateConversationParticipant(
                        conversation,
                        currentUser.getId()
                );

        long unreadCount =
                chatMessageRepository
                        .countByConversationIdAndReceiverIdAndStatus(
                                conversationId,
                                currentUser.getId(),
                                MessageStatus.SENT
                        );

        return UnreadMessageCountResponse.builder()
                .unreadCount(unreadCount)
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
            getUserById(firstUserId);

    User secondUser =
            getUserById(secondUserId);

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

    return conversation.getId();
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
                        participants.participantOne().getId(),
                        participants.participantTwo().getId()
                )
                .orElseGet(() ->
                        createConversationSafely(
                                participants.participantOne(),
                                participants.participantTwo()
                        )
                );
    }

    private Conversation createConversationSafely(
            User participantOne,
            User participantTwo
    ) {

        try {

            Conversation conversation =
                    Conversation.builder()
                            .participantOne(participantOne)
                            .participantTwo(participantTwo)
                            .active(true)
                            .createdAt(LocalDateTime.now())
                            .build();

            return conversationRepository
                    .saveAndFlush(conversation);

        } catch (DataIntegrityViolationException exception) {

            return conversationRepository
                    .findByParticipantOneIdAndParticipantTwoId(
                            participantOne.getId(),
                            participantTwo.getId()
                    )
                    .orElseThrow(() -> exception);
        }
    }

    private OrderedParticipants orderParticipants(
            User firstUser,
            User secondUser
    ) {

        if (compareUuid(
                firstUser.getId(),
                secondUser.getId()
        ) <= 0) {

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

        conversation.setLastMessage(
                buildMessagePreview(message)
        );

        conversation.setLastMessageSender(
                message.getSender()
        );

        conversation.setLastMessageAt(
                message.getCreatedAt()
        );

        conversation.setActive(true);

        conversationRepository.save(conversation);
    }

    private String buildMessagePreview(
            ChatMessage message
    ) {

        return switch (message.getMessageType()) {

            case TEXT ->
                    truncate(message.getContent(), 500);

            case IMAGE ->
                    "📷 Image";

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
                    truncate(message.getContent(), 500);
        };
    }

    /*
     * ============================================================
     * ENTITY LOOKUPS
     * ============================================================
     */

    private User getUserByEmail(
            String email
    ) {

        if (!StringUtils.hasText(email)) {
            throw new AccessDeniedException(
                    "Authenticated user is required"
            );
        }

        return userRepository
                .findByEmail(email.trim())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Authenticated user was not found"
                        )
                );
    }

    private User getUserById(
            UUID userId
    ) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "Receiver user ID is required"
            );
        }

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Receiver user was not found"
                        )
                );
    }

    private Conversation getConversationById(
            UUID conversationId
    ) {

        if (conversationId == null) {
            throw new IllegalArgumentException(
                    "Conversation ID is required"
            );
        }

        return conversationRepository
                .findById(conversationId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Conversation was not found"
                        )
                );
    }

    /*
     * ============================================================
     * UTILITIES
     * ============================================================
     */

    private int validatePage(
            int page
    ) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        return page;
    }

    private int validateSize(
            int size
    ) {

        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }

        return Math.min(
                size,
                MAX_PAGE_SIZE
        );
    }

    private String normalizeText(
            String value
    ) {

        if (!StringUtils.hasText(value)) {
            return null;
        }

        return value.trim();
    }

    private String truncate(
            String value,
            int maximumLength
    ) {

        if (value == null) {
            return null;
        }

        if (value.length() <= maximumLength) {
            return value;
        }

        return value.substring(
                0,
                maximumLength
        );
    }

    private int compareUuid(
            UUID first,
            UUID second
    ) {

        int mostSignificantComparison =
                Long.compareUnsigned(
                        first.getMostSignificantBits(),
                        second.getMostSignificantBits()
                );

        if (mostSignificantComparison != 0) {
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