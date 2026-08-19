package com.theholymatrimony.backend.membership.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import com.theholymatrimony.backend.membership.dto.ActivateMembershipRequest;
import com.theholymatrimony.backend.membership.dto.MembershipResponse;

import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.entity.Payment;

import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;

import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipServiceImpl
        implements MembershipService {

    private static final String HOLY100 =
            "HOLY100";

    private static final List<MembershipPlan>
            HOLY100_ELIGIBLE_PLANS =
            List.of(
                    MembershipPlan.SILVER,
                    MembershipPlan.GOLD,
                    MembershipPlan.PLATINUM
            );

    private final MembershipRepository
            membershipRepository;

    private final UserRepository
            userRepository;

    private final PaymentRepository
            paymentRepository;

    /*
     * ============================================================
     * CURRENT MEMBERSHIP
     * ============================================================
     */

    @Override
    public MembershipResponse getMembership(
            UUID userId
    ) {

        User user =
                findUser(
                        userId
                );

        Membership activeMembership =
                membershipRepository
                        .findFirstByUserAndStatusOrderByStartDateDesc(
                                user,
                                MembershipStatus.ACTIVE
                        )
                        .orElse(
                                null
                        );

        if (
                activeMembership == null
        ) {
            return createFreeMembershipResponse();
        }

        if (
                isExpired(
                        activeMembership
                )
        ) {
            return toResponse(
                    activeMembership,
                    MembershipStatus.EXPIRED
            );
        }

        return toResponse(
                activeMembership,
                MembershipStatus.ACTIVE
        );
    }

    /*
     * ============================================================
     * HOLY100 MEMBERSHIP ACTIVATION
     * ============================================================
     *
     * HOLY100 is not treated as "no transaction".
     *
     * Every successful coupon activation creates:
     *
     * 1. A SUCCESS Payment transaction
     * 2. amount = 0 paise
     * 3. paymentSource = COUPON
     * 4. paymentMethod = COUPON
     * 5. couponCode = HOLY100
     * 6. A Membership linked to that transaction
     *
     * This makes coupon activations visible in:
     *
     * - Payment History
     * - Admin payment records
     * - Membership history
     * - Downloadable receipts
     */

    @Override
    @Transactional
    public MembershipResponse activateWaivedMembership(
            UUID userId,
            ActivateMembershipRequest request
    ) {

        User user =
                findUser(
                        userId
                );

        validateHoly100Request(
                request
        );

        LocalDateTime now =
                LocalDateTime.now();

        /*
         * ========================================================
         * END EXISTING ACTIVE MEMBERSHIP
         * ========================================================
         *
         * Keep existing behavior:
         *
         * Any ACTIVE membership is cancelled before the
         * newly selected HOLY100 monthly membership begins.
         */

        membershipRepository
                .findAllByUser(
                        user
                )
                .stream()
                .filter(
                        membership ->
                                membership.getStatus()
                                        == MembershipStatus.ACTIVE
                )
                .forEach(
                        membership -> {

                            membership.setStatus(
                                    MembershipStatus.CANCELLED
                            );

                            /*
                             * Prevent the old membership from appearing
                             * active beyond the new activation time.
                             */
                            if (
                                    membership.getExpiryDate() == null ||
                                    membership
                                            .getExpiryDate()
                                            .isAfter(
                                                    now
                                            )
                            ) {
                                membership.setExpiryDate(
                                        now
                                );
                            }

                            membershipRepository.save(
                                    membership
                            );
                        }
                );

        /*
         * ========================================================
         * CREATE COUPON TRANSACTION
         * ========================================================
         *
         * We use the existing payments table as the unified
         * membership transaction ledger.
         */

        Payment couponPayment =
                Payment.builder()
                        .user(
                                user
                        )
                        .plan(
                                request
                                        .plan()
                                        .name()
                        )
                        .billingCycle(
                                BillingCycle
                                        .MONTHLY
                                        .name()
                        )
                        .customerName(
                                resolveCustomerName(
                                        user
                                )
                        )
                        .email(
                                resolveEmail(
                                        user
                                )
                        )
                        .phone(
                                normalizeNullable(
                                        user.getMobile()
                                )
                        )
                        .amount(
                                0
                        )
                        .currency(
                                "INR"
                        )
                        .status(
                                PaymentStatus.SUCCESS
                        )
                        .paymentSource(
                                PaymentSource.COUPON
                        )
                        .paymentMethod(
                                "COUPON"
                        )
                        .couponCode(
                                HOLY100
                        )
                        .paidAt(
                                now
                        )
                        .build();

        Payment savedCouponPayment =
                paymentRepository.save(
                        couponPayment
                );

        /*
         * ========================================================
         * CREATE MEMBERSHIP
         * ========================================================
         *
         * The membership now references the coupon transaction.
         *
         * This is the key difference from the old implementation,
         * which used payment(null).
         */

        Membership membership =
                Membership.builder()
                        .user(
                                user
                        )
                        .plan(
                                request.plan()
                        )
                        .billingCycle(
                                BillingCycle.MONTHLY
                        )
                        .startDate(
                                now
                        )
                        .expiryDate(
                                now.plusMonths(
                                        1
                                )
                        )
                        .status(
                                MembershipStatus.ACTIVE
                        )
                        .payment(
                                savedCouponPayment
                        )
                        .autoRenew(
                                false
                        )
                        .build();

        Membership savedMembership =
                membershipRepository.save(
                        membership
                );

        return toResponse(
                savedMembership,
                MembershipStatus.ACTIVE
        );
    }

    /*
     * ============================================================
     * HOLY100 VALIDATION
     * ============================================================
     */

    private void validateHoly100Request(
            ActivateMembershipRequest request
    ) {

        if (
                request == null
        ) {
            throw new IllegalArgumentException(
                    "Membership activation request is required."
            );
        }

        String normalizedCoupon =
                normalizeCoupon(
                        request.couponCode()
                );

        if (
                !HOLY100.equals(
                        normalizedCoupon
                )
        ) {
            throw new IllegalArgumentException(
                    "The coupon code is invalid."
            );
        }

        if (
                request.billingCycle()
                        != BillingCycle.MONTHLY
        ) {
            throw new IllegalArgumentException(
                    "HOLY100 is valid only for monthly memberships."
            );
        }

        if (
                request.plan() == null ||
                !HOLY100_ELIGIBLE_PLANS.contains(
                        request.plan()
                )
        ) {
            throw new IllegalArgumentException(
                    "HOLY100 is valid only for Silver, Gold, and Platinum plans."
            );
        }
    }

    /*
     * ============================================================
     * COUPON NORMALIZATION
     * ============================================================
     */

    private String normalizeCoupon(
            String couponCode
    ) {

        if (
                couponCode == null ||
                couponCode.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Coupon code is required."
            );
        }

        return couponCode
                .trim()
                .toUpperCase(
                        Locale.ROOT
                );
    }

    /*
     * ============================================================
     * USER LOOKUP
     * ============================================================
     */

    private User findUser(
            UUID userId
    ) {

        if (
                userId == null
        ) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        return userRepository
                .findById(
                        userId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "User was not found."
                                )
                );
    }

    /*
     * ============================================================
     * CUSTOMER NAME
     * ============================================================
     */

    private String resolveCustomerName(
            User user
    ) {

        if (
                user.getFullName() != null &&
                !user.getFullName().isBlank()
        ) {
            return user
                    .getFullName()
                    .trim();
        }

        String email =
                resolveEmail(
                        user
                );

        /*
         * customer_name is NOT NULL in the payments table.
         *
         * Email gives us a stable fallback for older accounts
         * that may not yet have a populated full name.
         */
        return email;
    }

    /*
     * ============================================================
     * USER EMAIL
     * ============================================================
     */

    private String resolveEmail(
            User user
    ) {

        if (
                user.getEmail() == null ||
                user.getEmail().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "User email was not found."
            );
        }

        return user
                .getEmail()
                .trim();
    }

    /*
     * ============================================================
     * NULLABLE STRING
     * ============================================================
     */

    private String normalizeNullable(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    /*
     * ============================================================
     * EXPIRY CHECK
     * ============================================================
     */

    private boolean isExpired(
            Membership membership
    ) {

        return membership
                .getExpiryDate()
                == null
                ||
                !membership
                        .getExpiryDate()
                        .isAfter(
                                LocalDateTime.now()
                        );
    }

    /*
     * ============================================================
     * FREE MEMBERSHIP RESPONSE
     * ============================================================
     */

    private MembershipResponse
    createFreeMembershipResponse() {

        return MembershipResponse
                .builder()
                .membershipId(
                        null
                )
                .plan(
                        MembershipPlan.FREE
                )
                .billingCycle(
                        null
                )
                .status(
                        MembershipStatus.ACTIVE
                )
                .startDate(
                        null
                )
                .expiryDate(
                        null
                )
                .daysRemaining(
                        0L
                )
                .autoRenew(
                        false
                )
                .build();
    }

    /*
     * ============================================================
     * RESPONSE MAPPING
     * ============================================================
     */

    private MembershipResponse toResponse(
            Membership membership,
            MembershipStatus effectiveStatus
    ) {

        return MembershipResponse
                .builder()
                .membershipId(
                        membership.getId()
                )
                .plan(
                        membership.getPlan()
                )
                .billingCycle(
                        membership.getBillingCycle()
                )
                .status(
                        effectiveStatus
                )
                .startDate(
                        membership.getStartDate()
                )
                .expiryDate(
                        membership.getExpiryDate()
                )
                .daysRemaining(
                        calculateDaysRemaining(
                                membership.getExpiryDate(),
                                effectiveStatus
                        )
                )
                .autoRenew(
                        Boolean.TRUE.equals(
                                membership.getAutoRenew()
                        )
                )
                .build();
    }

    /*
     * ============================================================
     * DAYS REMAINING
     * ============================================================
     */

    private long calculateDaysRemaining(
            LocalDateTime expiryDate,
            MembershipStatus status
    ) {

        if (
                expiryDate == null ||
                status !=
                        MembershipStatus.ACTIVE
        ) {
            return 0L;
        }

        long days =
                ChronoUnit.DAYS
                        .between(
                                LocalDateTime.now(),
                                expiryDate
                        );

        /*
         * A newly activated membership may display
         * 30 or 31 days depending on the month.
         */
        return Math.max(
                0L,
                days
        );
    }
}
