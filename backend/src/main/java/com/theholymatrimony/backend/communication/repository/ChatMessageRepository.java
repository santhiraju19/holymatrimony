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

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.Collection;
import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, UUID> {

    @Override
    @EntityGraph(
            attributePaths = {
                    "conversation",
                    "sender",
                    "receiver"
            }
    )
    Optional<ChatMessage> findById(
            UUID messageId
    );

    @EntityGraph(
            attributePaths = {
                    "conversation",
                    "sender",
                    "receiver"
            }
    )
    Page<ChatMessage>
    findAllByConversationIdOrderByCreatedAtDesc(
            UUID conversationId,
            Pageable pageable
    );

    long countByReceiverIdAndStatus(
            UUID receiverId,
            MessageStatus status
    );

    long countByConversationIdAndReceiverIdAndStatus(
            UUID conversationId,
            UUID receiverId,
            MessageStatus status
    );

    boolean existsByConversationIdAndReceiverIdAndStatus(
            UUID conversationId,
            UUID receiverId,
            MessageStatus status
    );

    @Modifying
    @Query("""
            update ChatMessage message
               set message.status = :readStatus,
                   message.readAt = :readAt
             where message.conversation.id = :conversationId
               and message.receiver.id = :receiverId
               and message.status <> :readStatus
               and message.deletedByReceiver = false
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
     * MESSAGE DELIVERY RECEIPTS
     * ============================================================
     */

    @Modifying
    @Query("""
            update ChatMessage message
               set message.status = :deliveredStatus,
                   message.deliveredAt = :deliveredAt
             where message.id = :messageId
               and message.receiver.id = :receiverId
               and message.status = :sentStatus
               and message.deletedByReceiver = false
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
     * SENT and DELIVERED are both unread.
     *
     * READ is the only normal message state that
     * should disappear from the unread counter.
     */

    long countByReceiverIdAndStatusIn(
            UUID receiverId,
            Collection<MessageStatus> statuses
    );


    long countByConversationIdAndReceiverIdAndStatusIn(
            UUID conversationId,
            UUID receiverId,
            Collection<MessageStatus> statuses
    );

        /*
     * ============================================================
     * FIND UNREAD MESSAGES FOR READ RECEIPTS
     * ============================================================
     */

    @EntityGraph(
            attributePaths = {
                    "conversation",
                    "sender",
                    "receiver"
            }
    )
    List<ChatMessage>
    findAllByConversationIdAndReceiverIdAndStatusInOrderByCreatedAtAsc(
            UUID conversationId,
            UUID receiverId,
            Collection<MessageStatus> statuses
    );
}


