package com.theholymatrimony.backend.communication.entity;

import com.theholymatrimony.backend.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "conversations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_conversation_participants",
                        columnNames = {
                                "participant_one_id",
                                "participant_two_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_conversation_participant_one",
                        columnList = "participant_one_id"
                ),
                @Index(
                        name = "idx_conversation_participant_two",
                        columnList = "participant_two_id"
                ),
                @Index(
                        name = "idx_conversation_last_message_at",
                        columnList = "last_message_at"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "participant_one_id",
            nullable = false
    )
    private User participantOne;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "participant_two_id",
            nullable = false
    )
    private User participantTwo;

    @Column(
            name = "last_message",
            length = 500
    )
    private String lastMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "last_message_sender_id"
    )
    private User lastMessageSender;

    @Column(
            name = "last_message_at"
    )
    private LocalDateTime lastMessageAt;

    @Builder.Default
    @Column(
            name = "active",
            nullable = false
    )
    private Boolean active = true;

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

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}