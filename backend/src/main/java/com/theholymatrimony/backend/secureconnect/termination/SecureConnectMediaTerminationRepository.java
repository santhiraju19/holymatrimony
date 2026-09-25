package com.theholymatrimony.backend.secureconnect.termination;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SecureConnectMediaTerminationRepository
        extends JpaRepository<SecureConnectMediaTermination, UUID> {

    Optional<SecureConnectMediaTermination>
    findByCallSessionId(UUID callSessionId);

    @Query("""
            SELECT termination.id
            FROM SecureConnectMediaTermination termination
            WHERE termination.status = 'PENDING'
              AND termination.nextAttemptAt <= :now
            ORDER BY termination.createdAt ASC
            """)
    List<UUID> findPendingIds(
            LocalDateTime now,
            org.springframework.data.domain.Pageable pageable
    );

    @Modifying
    @Query(value = """
            INSERT INTO secure_connect_media_terminations (
                id,
                call_session_id,
                provider,
                provider_room_id,
                status,
                attempt_count,
                next_attempt_at,
                created_at
            )
            VALUES (
                :id,
                :callId,
                :provider,
                :roomId,
                'PENDING',
                0,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
            ON CONFLICT (call_session_id) DO NOTHING
            """, nativeQuery = true)
    int enqueueIfAbsent(
            @Param("id") UUID id,
            @Param("callId") UUID callId,
            @Param("provider") String provider,
            @Param("roomId") String roomId
    );


    /**
     * Atomically claims pending requests or expired leases.
     * SKIP LOCKED prevents competing workers from claiming
     * the same rows.
     */
    @Query(value = """
            WITH candidates AS (
                SELECT id
                FROM secure_connect_media_terminations
                WHERE (
                    status = 'PENDING'
                    AND next_attempt_at <= CURRENT_TIMESTAMP
                )
                OR (
                    status = 'PROCESSING'
                    AND lease_expires_at <= CURRENT_TIMESTAMP
                )
                ORDER BY created_at ASC
                LIMIT :batchSize
                FOR UPDATE SKIP LOCKED
            )
            UPDATE secure_connect_media_terminations t
            SET status = 'PROCESSING',
                claim_token = :claimToken,
                lease_expires_at =
                    CURRENT_TIMESTAMP + INTERVAL '30 seconds'
            FROM candidates
            WHERE t.id = candidates.id
            RETURNING t.id
            """, nativeQuery = true)
    List<UUID> claimNextBatch(
            @Param("claimToken") UUID claimToken,
            @Param("batchSize") int batchSize
    );

    @Modifying
    @Query(value = """
            UPDATE secure_connect_media_terminations
            SET status = 'COMPLETED',
                completed_at = CURRENT_TIMESTAMP,
                claim_token = NULL,
                lease_expires_at = NULL,
                last_error = NULL
            WHERE id = :id
              AND status = 'PROCESSING'
              AND claim_token = :claimToken
            """, nativeQuery = true)
    int completeClaim(
            @Param("id") UUID id,
            @Param("claimToken") UUID claimToken
    );

    @Modifying
    @Query(value = """
            UPDATE secure_connect_media_terminations
            SET status = 'PENDING',
                attempt_count = LEAST(attempt_count + 1, 30),
                next_attempt_at =
                    CURRENT_TIMESTAMP
                    + LEAST(
                        300,
                        POWER(
                            2,
                            LEAST(attempt_count + 1, 8)
                        )
                    ) * INTERVAL '1 second',
                claim_token = NULL,
                lease_expires_at = NULL,
                last_error =
                    'LiveKit termination failed; retry scheduled.'
            WHERE id = :id
              AND status = 'PROCESSING'
              AND claim_token = :claimToken
            """, nativeQuery = true)
    int retryClaim(
            @Param("id") UUID id,
            @Param("claimToken") UUID claimToken
    );

}
