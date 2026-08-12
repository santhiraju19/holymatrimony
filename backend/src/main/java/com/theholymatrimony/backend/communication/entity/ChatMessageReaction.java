
package com.theholymatrimony.backend.communication.entity;

import com.theholymatrimony.backend.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "chat_message_reactions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_chat_message_reaction_user",
                        columnNames = {
                                "message_id",
                                "user_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_chat_message_reaction_message",
                        columnList = "message_id"
                ),
                @Index(
                        name = "idx_chat_message_reaction_user",
                        columnList = "user_id"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageReaction {

    @Id
    @GeneratedValue
    private UUID id;

    /*
     * ============================================================
     * MESSAGE
     * ============================================================
     *
     * The chat message receiving the reaction.
     *
     * Database migration uses ON DELETE CASCADE, so reactions
     * disappear automatically if the message is physically removed.
     */

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "message_id",
            nullable = false
    )
    private ChatMessage message;

    /*
     * ============================================================
     * USER
     * ============================================================
     *
     * User who reacted to the message.
     *
     * The database unique constraint on:
     *
     *     message_id + user_id
     *
     * guarantees that a user has at most one reaction
     * on a particular message.
     */

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    /*
     * ============================================================
     * REACTION
     * ============================================================
     *
     * Examples:
     *
     * 👍
     * ❤️
     * 😂
     * 🙏
     * 😮
     * 😢
     *
     * We intentionally store the reaction as a String instead
     * of a Java enum so the reaction set can evolve without
     * requiring a database enum migration.
     */

    @Column(
            name = "reaction",
            nullable = false,
            length = 20
    )
    private String reaction;

    /*
     * ============================================================
     * TIMESTAMPS
     * ============================================================
     */

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at"
    )
    private LocalDateTime updatedAt;

    /*
     * ============================================================
     * ENTITY LIFECYCLE
     * ============================================================
     */

    @PrePersist
    protected void onCreate() {
        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt =
                LocalDateTime.now();
    }
}