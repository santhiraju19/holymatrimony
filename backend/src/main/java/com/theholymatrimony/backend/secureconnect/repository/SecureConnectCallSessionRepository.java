package com.theholymatrimony.backend.secureconnect.repository;

import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SecureConnectCallSessionRepository
        extends JpaRepository<SecureConnectCallSession, UUID> {

    List<SecureConnectCallSession>
    findByCallerIdOrCalleeIdOrderByCreatedAtDesc(
            UUID callerId,
            UUID calleeId
    );

    boolean existsByCallerIdAndCalleeIdAndStatus(
            UUID callerId,
            UUID calleeId,
            CallStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select c
            from SecureConnectCallSession c
            where c.id = :callSessionId
            """)
    Optional<SecureConnectCallSession> findForUpdate(
            @Param("callSessionId") UUID callSessionId
    );
}
