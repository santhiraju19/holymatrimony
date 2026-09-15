package com.theholymatrimony.backend.secureconnect.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "secure_connect_plan_allowances",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_secure_connect_allowance_cycle_media",
                columnNames = {"membership_id", "media_type"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecureConnectPlanAllowance {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "membership_id", nullable = false)
    private Membership membership;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 10)
    private CallMediaType mediaType;

    @Column(name = "allowance_seconds", nullable = false)
    private long allowanceSeconds;

    @Column(name = "consumed_seconds", nullable = false)
    private long consumedSeconds;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        if (id == null) {
            id = UUID.randomUUID();
        }

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public long getRemainingSeconds() {
        return Math.max(0L, allowanceSeconds - consumedSeconds);
    }
}
