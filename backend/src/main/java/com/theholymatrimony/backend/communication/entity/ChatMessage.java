package com.theholymatrimony.backend.communication.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.communication.enums.MessageStatus;
import com.theholymatrimony.backend.communication.enums.MessageType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "chat_messages",
        indexes = {
                @Index(
                        name = "idx_chat_message_conversation",
                        columnList = "conversation_id"
                ),
                @Index(
                        name = "idx_chat_message_sender",
                        columnList = "sender_id"
                ),
                @Index(
                        name = "idx_chat_message_receiver",
                        columnList = "receiver_id"
                ),
                @Index(
                        name = "idx_chat_message_created_at",
                        columnList = "created_at"
                ),
                @Index(
                        name = "idx_chat_message_receiver_status",
                        columnList = "receiver_id,status"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "conversation_id",
            nullable = false
    )
    private Conversation conversation;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "sender_id",
            nullable = false
    )
    private User sender;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "receiver_id",
            nullable = false
    )
    private User receiver;

    @Column(
            name = "content",
            length = 2000
    )
    private String content;

    @Column(
            name = "media_url",
            length = 1000
    )
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "message_type",
            nullable = false,
            length = 30
    )
    @Builder.Default
    private MessageType messageType =
            MessageType.TEXT;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private MessageStatus status =
            MessageStatus.SENT;

    @Builder.Default
    @Column(
            name = "deleted_by_sender",
            nullable = false
    )
    private Boolean deletedBySender = false;

    @Builder.Default
    @Column(
            name = "deleted_by_receiver",
            nullable = false
    )
    private Boolean deletedByReceiver = false;

    @Column(
            name = "read_at"
    )
    private LocalDateTime readAt;

    @Column(
            name = "delivered_at"
    )
    private LocalDateTime deliveredAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    @Builder.Default
    private LocalDateTime createdAt =
            LocalDateTime.now();

    @Column(
            name = "updated_at"
    )
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (messageType == null) {
            messageType = MessageType.TEXT;
        }

        if (status == null) {
            status = MessageStatus.SENT;
        }

        if (deletedBySender == null) {
            deletedBySender = false;
        }

        if (deletedByReceiver == null) {
            deletedByReceiver = false;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}