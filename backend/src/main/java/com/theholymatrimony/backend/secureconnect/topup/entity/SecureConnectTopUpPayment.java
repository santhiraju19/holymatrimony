package com.theholymatrimony.backend.secureconnect.topup.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "secure_connect_topup_payments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_secure_connect_topup_razorpay_order",
                        columnNames = "razorpay_order_id"
                ),
                @UniqueConstraint(
                        name = "uq_secure_connect_topup_razorpay_payment",
                        columnNames = "razorpay_payment_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecureConnectTopUpPayment {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 10)
    private CallMediaType mediaType;

    @Column(nullable = false)
    private int minutes;

    @Column(nullable = false)
    private long seconds;

    /**
     * Amount stored in paise.
     *
     * Examples:
     * ₹49  = 4900
     * ₹79  = 7900
     * ₹129 = 12900
     */
    @Column(nullable = false)
    private int amount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(
            name = "razorpay_order_id",
            nullable = false,
            length = 100
    )
    private String razorpayOrderId;

    @Column(
            name = "razorpay_payment_id",
            length = 100
    )
    private String razorpayPaymentId;

    @Column(
            name = "razorpay_signature",
            length = 255
    )
    private String razorpaySignature;

    @Column(
            name = "payment_method",
            length = 50
    )
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        if (id == null) {
            id = UUID.randomUUID();
        }

        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }

        if (status == null) {
            status = PaymentStatus.PENDING;
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
}
