package com.theholymatrimony.backend.communication.repository;

import com.theholymatrimony.backend.communication.entity.ChatMessage;
import com.theholymatrimony.backend.communication.enums.MessageStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository
        extends JpaRepository<
        ChatMessage,
        UUID
        > {

    /*
     * ============================================================
     * MESSAGE HISTORY
     * ============================================================
     *
     * Reply relationships are fetched together with
     * the message so MessageResponse can safely map the
     * quoted-message snapshot.
     */

    @EntityGraph(
            attributePaths = {
                    "conversation",
                    "sender",
                    "receiver",
                    "replyToMessage",
                    "replyToMessage.sender"
            }
    )
    Page<ChatMessage>
    findAllByConversationIdOrderByCreatedAtDesc(
            UUID conversationId,
            Pageable pageable
    );


    /*
     * ============================================================
     * FIND MESSAGE BY ID
     * ============================================================
     *
     * Used by:
     *
     * - edit
     * - delete
     * - delivered receipts
     * - reply validation
     */

    @Override
    @EntityGraph(
            attributePaths = {
                    "conversation",
                    "sender",
                    "receiver",
                    "replyToMessage",
                    "replyToMessage.sender"
            }
    )
    java.util.Optional<ChatMessage> findById(
            UUID id
    );


    /*
     * ============================================================
     * TOTAL UNREAD COUNT
     * ============================================================
     *
     * Both SENT and DELIVERED are unread.
     */

    long countByReceiverIdAndStatusIn(
            UUID receiverId,
            Collection<MessageStatus> statuses
    );


    /*
     * ============================================================
     * CONVERSATION UNREAD COUNT
     * ============================================================
     */

    long countByConversationIdAndReceiverIdAndStatusIn(
            UUID conversationId,
            UUID receiverId,
            Collection<MessageStatus> statuses
    );


    /*
     * ============================================================
     * LEGACY COUNT METHODS
     * ============================================================
     *
     * Keeping these temporarily avoids breaking any
     * older code that may still reference them.
     */

    long countByReceiverIdAndStatus(
            UUID receiverId,
            MessageStatus status
    );


    long countByConversationIdAndReceiverIdAndStatus(
            UUID conversationId,
            UUID receiverId,
            MessageStatus status
    );


    /*
     * ============================================================
     * MARK ONE MESSAGE DELIVERED
     * ============================================================
     */

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
            update ChatMessage message
               set message.status = :deliveredStatus,
                   message.deliveredAt = :deliveredAt
             where message.id = :messageId
               and message.receiver.id = :receiverId
               and message.status = :sentStatus
               and message.deletedByReceiver = false
               and message.deletedForEveryone = false
            """)
    int markMessageAsDelivered(

            @Param("messageId")
            UUID messageId,

            @Param("receiverId")
            UUID receiverId,

            @Param("sentStatus")
            MessageStatus sentStatus,

            @Param("deliveredStatus")
            MessageStatus deliveredStatus,

            @Param("deliveredAt")
            LocalDateTime deliveredAt
    );


    /*
     * ============================================================
     * FIND UNREAD MESSAGES FOR READ RECEIPTS
     * ============================================================
     *
     * We fetch reply relationships too because these
     * messages are converted to MessageResponse after
     * becoming READ and sent over WebSocket.
     */

    @EntityGraph(
            attributePaths = {
                    "conversation",
                    "sender",
                    "receiver",
                    "replyToMessage",
                    "replyToMessage.sender"
            }
    )
    List<ChatMessage>
    findAllByConversationIdAndReceiverIdAndStatusInOrderByCreatedAtAsc(
            UUID conversationId,
            UUID receiverId,
            Collection<MessageStatus> statuses
    );


    /*
     * ============================================================
     * LEGACY BULK READ UPDATE
     * ============================================================
     *
     * The newer CommunicationService now loads the actual
     * messages and saves them individually so realtime READ
     * receipts can be broadcast.
     *
     * We keep this method for compatibility with older code.
     */

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
            update ChatMessage message
               set message.status = :readStatus,
                   message.readAt = :readAt
             where message.conversation.id = :conversationId
               and message.receiver.id = :receiverId
               and message.status <> :readStatus
               and message.deletedByReceiver = false
               and message.deletedForEveryone = false
            """)
    int markConversationMessagesAsRead(

            @Param("conversationId")
            UUID conversationId,

            @Param("receiverId")
            UUID receiverId,

            @Param("readStatus")
            MessageStatus readStatus,

            @Param("readAt")
            LocalDateTime readAt
    );


    /*
     * ============================================================
     * CONVERSATION MESSAGE COUNT
     * ============================================================
     */

    long countByConversationId(
            UUID conversationId
    );


    /*
     * ============================================================
     * DELETE SUPPORT / MESSAGE VISIBILITY
     * ============================================================
     */

    @EntityGraph(
            attributePaths = {
                    "conversation",
                    "sender",
                    "receiver",
                    "replyToMessage",
                    "replyToMessage.sender"
            }
    )
    List<ChatMessage>
    findAllByConversationIdOrderByCreatedAtAsc(
            UUID conversationId
    );
}