package com.theholymatrimony.backend.secureconnect.repository;

import com.theholymatrimony.backend.secureconnect.entity.SecureConnectWallet;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SecureConnectWalletRepository
        extends JpaRepository<SecureConnectWallet, UUID> {

    Optional<SecureConnectWallet>
    findByUserIdAndMediaType(
            UUID userId,
            CallMediaType mediaType
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select w
            from SecureConnectWallet w
            where w.user.id = :userId
              and w.mediaType = :mediaType
            """)
    Optional<SecureConnectWallet>
    findForUpdate(
            @Param("userId") UUID userId,
            @Param("mediaType") CallMediaType mediaType
    );
}
