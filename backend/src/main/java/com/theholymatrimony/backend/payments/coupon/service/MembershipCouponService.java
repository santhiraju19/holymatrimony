package com.theholymatrimony.backend.payments.coupon.service;

import com.theholymatrimony.backend.payments.coupon.dto.CouponCalculation;
import com.theholymatrimony.backend.payments.coupon.entity.MembershipCoupon;
import com.theholymatrimony.backend.payments.coupon.entity.MembershipCouponRedemption;
import com.theholymatrimony.backend.payments.coupon.repository.MembershipCouponRedemptionRepository;
import com.theholymatrimony.backend.payments.coupon.repository.MembershipCouponRepository;
import com.theholymatrimony.backend.payments.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MembershipCouponService {

    private final MembershipCouponRepository couponRepository;
    private final MembershipCouponRedemptionRepository redemptionRepository;

    /*
     * ============================================================
     * CALCULATE COUPON
     * ============================================================
     *
     * The backend owns the price and discount calculation.
     * The browser supplies only an optional coupon code.
     */
    @Transactional(readOnly = true)
    public CouponCalculation calculate(
            String rawCouponCode,
            int originalAmount
    ) {
        if (originalAmount < 0) {
            throw new IllegalArgumentException(
                    "Original payment amount cannot be negative."
            );
        }

        String code =
                normalizeCouponCode(
                        rawCouponCode
                );

        if (code == null) {
            return null;
        }

        MembershipCoupon coupon =
                couponRepository
                        .findByCodeIgnoreCase(code)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Invalid coupon code."
                                        )
                        );

        validateCoupon(
                coupon
        );

        int discountPercent =
                coupon.getDiscountPercent();

        /*
         * Payment values are stored in paise.
         *
         * Adding 50 before integer division implements
         * nearest-paise rounding for percentage / 100.
         */
        long numerator =
                (long) originalAmount
                        * discountPercent;

        int discountAmount =
                (int) (
                        (numerator + 50L)
                                / 100L
                );

        if (
                discountAmount >
                        originalAmount
        ) {
            discountAmount =
                    originalAmount;
        }

        int finalAmount =
                originalAmount
                        - discountAmount;

        return new CouponCalculation(
                coupon,
                coupon.getCode(),
                discountPercent,
                originalAmount,
                discountAmount,
                finalAmount
        );
    }

    /*
     * ============================================================
     * RECORD SUCCESSFUL REDEMPTION
     * ============================================================
     *
     * The Payment row is the immutable pricing snapshot used
     * when checkout was created.
     *
     * This method must only be called after the payment has been
     * successfully finalized.
     *
     * The unique payment_id constraint in the redemption table
     * plus existsByPayment_Id makes webhook retries idempotent.
     */
    @Transactional
    public void recordSuccessfulRedemption(
            Payment payment
    ) {
        if (payment == null) {
            throw new IllegalArgumentException(
                    "Payment is required."
            );
        }

        if (payment.getId() == null) {
            throw new IllegalArgumentException(
                    "Payment ID is required."
            );
        }

        String couponCode =
                normalizeCouponCode(
                        payment.getCouponCode()
                );

        /*
         * Normal non-coupon payment.
         */
        if (couponCode == null) {
            return;
        }

        if (
                redemptionRepository
                        .existsByPayment_Id(
                                payment.getId()
                        )
        ) {
            return;
        }

        if (payment.getUser() == null) {
            throw new IllegalArgumentException(
                    "Coupon payment user is required."
            );
        }

        Integer originalAmount =
                payment.getOriginalAmount();

        Integer discountAmount =
                payment.getDiscountAmount();

        Integer discountPercent =
                payment.getDiscountPercent();

        Integer finalAmount =
                payment.getAmount();

        if (
                originalAmount == null ||
                discountAmount == null ||
                discountPercent == null ||
                finalAmount == null
        ) {
            throw new IllegalStateException(
                    "Coupon payment pricing snapshot is incomplete."
            );
        }

        if (
                originalAmount < 0 ||
                discountAmount < 0 ||
                finalAmount < 0 ||
                discountAmount >
                        originalAmount ||
                finalAmount !=
                        originalAmount
                                - discountAmount
        ) {
            throw new IllegalStateException(
                    "Coupon payment pricing snapshot is invalid."
            );
        }

        if (
                discountPercent < 1 ||
                discountPercent > 100
        ) {
            throw new IllegalStateException(
                    "Coupon payment discount percentage is invalid."
            );
        }

        /*
         * Lock the coupon before the final idempotency check.
         *
         * Concurrent Razorpay webhook deliveries for the same
         * coupon are serialized here. This protects both the
         * redemption insert and redemption_count increment.
         */
        MembershipCoupon coupon =
                couponRepository
                        .findByCodeForUpdate(
                                couponCode
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "Coupon used by the payment no longer exists."
                                        )
                        );

        /*
         * Another transaction may have completed this payment's
         * redemption while this transaction was waiting for the
         * coupon lock.
         */
        if (
                redemptionRepository
                        .existsByPayment_Id(
                                payment.getId()
                        )
        ) {
            return;
        }

        /*
         * Do not recalculate the historical discount here.
         *
         * The Payment row contains the authoritative snapshot
         * that was used when checkout was created.
         *
         * We do, however, require the coupon itself to still
         * exist so the redemption can reference its FK.
         */
        MembershipCouponRedemption redemption =
                MembershipCouponRedemption
                        .builder()
                        .coupon(
                                coupon
                        )
                        .user(
                                payment.getUser()
                        )
                        .payment(
                                payment
                        )
                        .couponCode(
                                couponCode
                        )
                        .discountPercent(
                                discountPercent
                        )
                        .originalAmount(
                                originalAmount
                        )
                        .discountAmount(
                                discountAmount
                        )
                        .finalAmount(
                                finalAmount
                        )
                        .build();

        redemptionRepository.saveAndFlush(
                redemption
        );

        int currentCount =
                coupon.getRedemptionCount() == null
                        ? 0
                        : coupon.getRedemptionCount();

        coupon.setRedemptionCount(
                currentCount + 1
        );

        couponRepository.save(
                coupon
        );
    }

    /*
     * ============================================================
     * VALIDATE ACTIVE COUPON
     * ============================================================
     */
    private void validateCoupon(
            MembershipCoupon coupon
    ) {
        if (
                coupon.getActive() == null ||
                !coupon.getActive()
        ) {
            throw new IllegalArgumentException(
                    "This coupon is no longer active."
            );
        }

        Integer discountPercent =
                coupon.getDiscountPercent();

        if (
                discountPercent == null ||
                discountPercent < 1 ||
                discountPercent > 100
        ) {
            throw new IllegalArgumentException(
                    "Coupon discount configuration is invalid."
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        if (
                coupon.getValidFrom() != null &&
                now.isBefore(
                        coupon.getValidFrom()
                )
        ) {
            throw new IllegalArgumentException(
                    "This coupon is not active yet."
            );
        }

        if (
                coupon.getValidUntil() != null &&
                now.isAfter(
                        coupon.getValidUntil()
                )
        ) {
            throw new IllegalArgumentException(
                    "This coupon has expired."
            );
        }

        Integer maxRedemptions =
                coupon.getMaxRedemptions();

        int redemptionCount =
                coupon.getRedemptionCount() == null
                        ? 0
                        : coupon.getRedemptionCount();

        if (
                maxRedemptions != null &&
                redemptionCount >=
                        maxRedemptions
        ) {
            throw new IllegalArgumentException(
                    "This coupon has reached its redemption limit."
            );
        }
    }

    /*
     * ============================================================
     * NORMALIZE
     * ============================================================
     */
    private String normalizeCouponCode(
            String value
    ) {
        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
        }

        return value
                .trim()
                .toUpperCase(
                        Locale.ROOT
                );
    }
}
