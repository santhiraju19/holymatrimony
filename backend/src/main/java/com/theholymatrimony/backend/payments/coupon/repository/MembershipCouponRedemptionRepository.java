package com.theholymatrimony.backend.payments.coupon.repository;

import com.theholymatrimony.backend.payments.coupon.entity.MembershipCouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MembershipCouponRedemptionRepository
        extends JpaRepository<
                MembershipCouponRedemption,
                UUID
        > {

    boolean existsByPayment_Id(UUID paymentId);
}
