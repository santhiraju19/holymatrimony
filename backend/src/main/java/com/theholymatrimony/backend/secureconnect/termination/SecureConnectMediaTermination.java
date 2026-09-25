package com.theholymatrimony.backend.secureconnect.termination;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "secure_connect_media_terminations",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_sc_media_termination_call",
                columnNames = "call_session_id"
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecureConnectMediaTermination {

    @Id
    private UUID id;

    @Column(name = "call_session_id", nullable = false)
    private UUID callSessionId;

    @Column(nullable = false, length = 30)
    private String provider;

    @Column(
            name = "provider_room_id",
            nullable = false,
            length = 255
    )
    private String providerRoomId;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "claim_token")
    private UUID claimToken;

    @Column(name = "lease_expires_at")
    private LocalDateTime leaseExpiresAt;

    @Column(name = "next_attempt_at", nullable = false)
    private LocalDateTime nextAttemptAt;

    @Column(name = "last_error", length = 1000)
    private String lastError;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public static SecureConnectMediaTermination pending(
            UUID callSessionId,
            String provider,
            String providerRoomId
    ) {
        LocalDateTime now = LocalDateTime.now();

        return SecureConnectMediaTermination.builder()
                .id(UUID.randomUUID())
                .callSessionId(callSessionId)
                .provider(provider)
                .providerRoomId(providerRoomId)
                .status("PENDING")
                .attemptCount(0)
                .nextAttemptAt(now)
                .createdAt(now)
                .build();
    }
}
