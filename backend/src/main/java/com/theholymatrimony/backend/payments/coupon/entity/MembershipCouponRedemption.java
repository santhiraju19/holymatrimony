package com.theholymatrimony.backend.payments.coupon.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.entity.Payment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "membership_coupon_redemptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipCouponRedemption {

    @Id
    @Builder.Default
    @Column(nullable = false, updatable = false)
    private UUID id = UUID.randomUUID();

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "coupon_id",
            nullable = false
    )
    private MembershipCoupon coupon;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "payment_id",
            nullable = false
    )
    private Payment payment;

    @Column(
            name = "coupon_code",
            nullable = false,
            length = 50
    )
    private String couponCode;

    @Column(
            name = "discount_percent",
            nullable = false
    )
    private Integer discountPercent;

    @Column(
            name = "original_amount",
            nullable = false
    )
    private Integer originalAmount;

    @Column(
            name = "discount_amount",
            nullable = false
    )
    private Integer discountAmount;

    @Column(
            name = "final_amount",
            nullable = false
    )
    private Integer finalAmount;

    @Column(
            name = "redeemed_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime redeemedAt;

    @PrePersist
    public void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }

        if (redeemedAt == null) {
            redeemedAt = LocalDateTime.now();
        }
    }
}
