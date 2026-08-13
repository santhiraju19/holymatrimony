
package com.theholymatrimony.backend.safety.entity;

import com.theholymatrimony.backend.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "user_blocks",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_user_block_pair",
                        columnNames = {
                                "blocker_id",
                                "blocked_user_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_user_block_blocker",
                        columnList = "blocker_id"
                ),
                @Index(
                        name = "idx_user_block_blocked_user",
                        columnList = "blocked_user_id"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBlock {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "blocker_id",
            nullable = false
    )
    private User blocker;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "blocked_user_id",
            nullable = false
    )
    private User blockedUser;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt =
                    LocalDateTime.now();
        }
    }
}