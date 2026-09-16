package com.theholymatrimony.backend.secureconnect.repository;

import com.theholymatrimony.backend.secureconnect.entity.SecureConnectLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SecureConnectLedgerRepository
        extends JpaRepository<SecureConnectLedgerEntry, UUID> {

    Optional<SecureConnectLedgerEntry>
    findByIdempotencyKey(String idempotencyKey);

    boolean existsByIdempotencyKey(String idempotencyKey);

    List<SecureConnectLedgerEntry>
    findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<SecureConnectLedgerEntry>
    findByCallSessionIdOrderByCreatedAtAsc(UUID callSessionId);
}
