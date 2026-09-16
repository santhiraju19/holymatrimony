package com.theholymatrimony.backend.secureconnect.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.secureconnect.enums.BalanceSource;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.LedgerTransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "secure_connect_ledger")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecureConnectLedgerEntry {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "call_session_id")
    private SecureConnectCallSession callSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id")
    private Membership membership;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 10)
    private CallMediaType mediaType;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private LedgerTransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "balance_source", nullable = false, length = 10)
    private BalanceSource balanceSource;

    @Column(nullable = false)
    private long seconds;

    @Column(name = "idempotency_key", length = 150)
    private String idempotencyKey;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
