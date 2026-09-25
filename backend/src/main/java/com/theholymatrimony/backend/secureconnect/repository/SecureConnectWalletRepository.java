package com.theholymatrimony.backend.secureconnect.repository;

import com.theholymatrimony.backend.secureconnect.entity.SecureConnectWallet;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
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

    /*
     * Atomically creates or increments a purchased-minute wallet.
     *
     * Existing call-usage code continues to use findForUpdate()
     * when consuming wallet seconds.
     */
    @Modifying
    @Query(
            value = """
                    INSERT INTO secure_connect_wallets (
                        id,
                        user_id,
                        media_type,
                        balance_seconds,
                        created_at,
                        updated_at
                    )
                    VALUES (
                        CAST(:walletId AS uuid),
                        CAST(:userId AS uuid),
                        :mediaType,
                        :seconds,
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (user_id, media_type)
                    DO UPDATE SET
                        balance_seconds =
                            secure_connect_wallets.balance_seconds
                            + EXCLUDED.balance_seconds,
                        updated_at = CURRENT_TIMESTAMP
                    """,
            nativeQuery = true
    )
    int creditTopUpSeconds(
            @Param("walletId") UUID walletId,
            @Param("userId") UUID userId,
            @Param("mediaType") String mediaType,
            @Param("seconds") long seconds
    );
}
