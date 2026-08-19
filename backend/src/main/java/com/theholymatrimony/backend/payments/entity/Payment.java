package com.theholymatrimony.backend.payments.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @Builder.Default
    @Column(nullable = false, updatable = false)
    private UUID id =
            UUID.randomUUID();

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    /*
     * ============================================================
     * RAZORPAY IDENTIFIERS
     * ============================================================
     */

    @Column(
            name = "razorpay_order_id",
            unique = true
    )
    private String razorpayOrderId;

    @Column(
            name = "razorpay_payment_id",
            unique = true
    )
    private String razorpayPaymentId;

    @Column(
            name = "razorpay_signature",
            length = 500
    )
    private String razorpaySignature;

    /*
     * ============================================================
     * MEMBERSHIP
     * ============================================================
     */

    @Column(
            nullable = false,
            length = 30
    )
    private String plan;

    @Column(
            name = "billing_cycle",
            nullable = false,
            length = 20
    )
    private String billingCycle;

    /*
     * ============================================================
     * CUSTOMER
     * ============================================================
     */

    @Column(
            name = "customer_name",
            nullable = false
    )
    private String customerName;

    @Column(
            nullable = false
    )
    private String email;

    private String phone;

    /*
     * ============================================================
     * AMOUNT
     * ============================================================
     *
     * Amount is stored in paise.
     *
     * Example:
     *
     * ₹499.00 -> 49900
     * ₹0.00 coupon activation -> 0
     */

    @Column(
            nullable = false
    )
    private Integer amount;

    @Builder.Default
    @Column(
            nullable = false,
            length = 10
    )
    private String currency =
            "INR";

    /*
     * ============================================================
     * STATUS
     * ============================================================
     */

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 30
    )
    private PaymentStatus status;

    /*
     * ============================================================
     * PAYMENT SOURCE
     * ============================================================
     *
     * RAZORPAY
     * COUPON
     */

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "payment_source",
            length = 30
    )
    private PaymentSource paymentSource;

    /*
     * ============================================================
     * PAYMENT METHOD
     * ============================================================
     *
     * Examples:
     *
     * UPI
     * CARD
     * NETBANKING
     * WALLET
     * COUPON
     *
     * Razorpay payment method will be populated from the
     * payment.captured webhook.
     */

    @Column(
            name = "payment_method",
            length = 50
    )
    private String paymentMethod;

    /*
     * ============================================================
     * COUPON
     * ============================================================
     *
     * Example:
     *
     * HOLY100
     */

    @Column(
            name = "coupon_code",
            length = 100
    )
    private String couponCode;

    /*
     * ============================================================
     * DATES
     * ============================================================
     */

    @Column(
            name = "paid_at"
    )
    private LocalDateTime paidAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at"
    )
    private LocalDateTime updatedAt;

    /*
     * ============================================================
     * CREATE
     * ============================================================
     */

    @PrePersist
    public void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (
                id == null
        ) {
            id =
                    UUID.randomUUID();
        }

        if (
                createdAt == null
        ) {
            createdAt =
                    now;
        }

        updatedAt =
                now;

        if (
                status == null
        ) {
            status =
                    PaymentStatus.PENDING;
        }

        if (
                currency == null ||
                currency.isBlank()
        ) {
            currency =
                    "INR";
        }

        /*
         * Backward-compatible default.
         *
         * Normal checkout transactions historically did not
         * explicitly specify a source.
         */
        if (
                paymentSource == null
        ) {
            paymentSource =
                    PaymentSource.RAZORPAY;
        }
    }

    /*
     * ============================================================
     * UPDATE
     * ============================================================
     */

    @PreUpdate
    public void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }
}
