package com.theholymatrimony.backend.payments.coupon.dto;

import com.theholymatrimony.backend.payments.coupon.entity.MembershipCoupon;

public record CouponCalculation(
        MembershipCoupon coupon,
        String code,
        int discountPercent,
        int originalAmount,
        int discountAmount,
        int finalAmount
) {

    public boolean isFree() {
        return finalAmount == 0;
    }
}
