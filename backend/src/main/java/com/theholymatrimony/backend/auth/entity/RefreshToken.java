package com.theholymatrimony.backend.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "refresh_tokens",
        indexes = {
                @Index(
                        name = "idx_refresh_tokens_token_hash",
                        columnList = "token_hash",
                        unique = true
                ),
                @Index(
                        name = "idx_refresh_tokens_user_id",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_refresh_tokens_expires_at",
                        columnList = "expires_at"
                )
        }
)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "token_hash",
            nullable = false,
            unique = true,
            length = 64
    )
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_refresh_tokens_user"
            )
    )
    private User user;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private Instant expiresAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(
            name = "replaced_by_token_hash",
            length = 64
    )
    private String replacedByTokenHash;

    @Column(
            name = "created_by_ip",
            length = 45
    )
    private String createdByIp;

    @Column(
            name = "revoked_by_ip",
            length = 45
    )
    private String revokedByIp;

    @Column(
            name = "revocation_reason",
            length = 255
    )
    private String revocationReason;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public boolean isExpired() {
        return expiresAt == null ||
                expiresAt.isBefore(Instant.now());
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }

    public boolean isActive() {
        return !isExpired() && !isRevoked();
    }

    public void revoke(
            String revokedByIp,
            String reason,
            String replacementTokenHash
    ) {
        this.revokedAt = Instant.now();
        this.revokedByIp = revokedByIp;
        this.revocationReason = reason;
        this.replacedByTokenHash = replacementTokenHash;
    }
}