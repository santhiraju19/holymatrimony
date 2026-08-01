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
}