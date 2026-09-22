package com.theholymatrimony.backend.payments.coupon.repository;

import com.theholymatrimony.backend.payments.coupon.entity.MembershipCoupon;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface MembershipCouponRepository
        extends JpaRepository<MembershipCoupon, UUID> {

    Optional<MembershipCoupon> findByCodeIgnoreCase(
            String code
    );

    /*
     * Serialize successful redemption processing for a coupon.
     *
     * This prevents concurrent webhook deliveries from racing
     * while updating redemption_count.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select c
            from MembershipCoupon c
            where upper(c.code) = upper(:code)
            """)
    Optional<MembershipCoupon> findByCodeForUpdate(
            @Param("code") String code
    );
}
