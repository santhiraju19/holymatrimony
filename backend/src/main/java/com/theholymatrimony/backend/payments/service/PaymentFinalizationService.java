package com.theholymatrimony.backend.payments.service;

import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;
import com.theholymatrimony.backend.secureconnect.service.SecureConnectAllowanceProvisioningService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentFinalizationService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;

    private final SecureConnectAllowanceProvisioningService
            secureConnectAllowanceProvisioningService;

    /*
     * ============================================================
     * RAZORPAY SUCCESS
     * ============================================================
     */
    @Transactional
    public Payment finalizeSuccessfulPayment(
            Payment payment,
            String razorpayPaymentId,
            String razorpaySignature
    ) {
        /*
         * Browser verification and Razorpay webhook may both
         * attempt to finalize the same payment.
         */
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return payment;
        }

        if (
                razorpayPaymentId == null ||
                razorpayPaymentId.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Razorpay payment ID is required."
            );
        }

        payment.setPaymentSource(
                PaymentSource.RAZORPAY
        );

        payment.setRazorpayPaymentId(
                razorpayPaymentId
        );

        if (
                razorpaySignature != null &&
                !razorpaySignature.isBlank()
        ) {
            payment.setRazorpaySignature(
                    razorpaySignature
            );
        }

        return finalizePaymentAndMembership(
                payment
        );
    }

    /*
     * ============================================================
     * 100% COUPON SUCCESS
     * ============================================================
     *
     * A fully discounted checkout never goes to Razorpay.
     * The payment remains auditable in our own payments table
     * with amount = 0 and payment_source = COUPON.
     */
    @Transactional
    public Payment finalizeSuccessfulCouponPayment(
            Payment payment
    ) {
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return payment;
        }

        if (payment.getAmount() == null) {
            throw new IllegalArgumentException(
                    "Coupon payment amount is required."
            );
        }

        if (payment.getAmount().intValue() != 0) {
            throw new IllegalArgumentException(
                    "Direct coupon finalization is only allowed for a zero-value payment."
            );
        }

        if (
                payment.getCouponCode() == null ||
                payment.getCouponCode().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Coupon code is required for coupon payment finalization."
            );
        }

        payment.setPaymentSource(
                PaymentSource.COUPON
        );

        payment.setPaymentMethod(
                "COUPON"
        );

        /*
         * Razorpay identifiers deliberately remain null.
         */
        payment.setRazorpayOrderId(null);
        payment.setRazorpayPaymentId(null);
        payment.setRazorpaySignature(null);

        return finalizePaymentAndMembership(
                payment
        );
    }

    /*
     * ============================================================
     * COMMON FINALIZATION
     * ============================================================
     */
    private Payment finalizePaymentAndMembership(
            Payment payment
    ) {
        payment.setStatus(
                PaymentStatus.SUCCESS
        );

        payment.setPaidAt(
                LocalDateTime.now()
        );

        Payment savedPayment =
                paymentRepository.saveAndFlush(
                        payment
                );

        activateMembership(
                savedPayment
        );

        return savedPayment;
    }

    /*
     * ============================================================
     * MEMBERSHIP ACTIVATION
     * ============================================================
     */
    private void activateMembership(
            Payment payment
    ) {

        // Serialize membership activation for this user.
        userRepository.findForUpdate(payment.getUser().getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Payment user was not found."
                ));

        /*
         * If this payment already owns a membership,
         * don't create another one.
         */
        if (
                membershipRepository
                        .findByPaymentId(
                                payment.getId()
                        )
                        .isPresent()
        ) {
            return;
        }

        /*
         * Only one membership should remain ACTIVE.
         */
        membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        payment.getUser().getId(),
                        MembershipStatus.ACTIVE
                )
                .ifPresent(existing -> {
                    existing.setStatus(
                            MembershipStatus.CANCELLED
                    );

                    existing.setUpdatedAt(
                            LocalDateTime.now()
                    );

                    membershipRepository.save(
                            existing
                    );
                });

        MembershipPlan plan =
                MembershipPlan.valueOf(
                        payment.getPlan()
                );

        BillingCycle billingCycle =
                BillingCycle.valueOf(
                        payment.getBillingCycle()
                );

        LocalDateTime startDate =
                LocalDateTime.now();

        LocalDateTime expiryDate =
                calculateExpiryDate(
                        startDate,
                        billingCycle
                );

        Membership membership =
                Membership.builder()
                        .user(
                                payment.getUser()
                        )
                        .payment(
                                payment
                        )
                        .plan(
                                plan
                        )
                        .billingCycle(
                                billingCycle
                        )
                        .status(
                                MembershipStatus.ACTIVE
                        )
                        .startDate(
                                startDate
                        )
                        .expiryDate(
                                expiryDate
                        )
                        .autoRenew(false)
                        .build();

        Membership savedMembership =
                membershipRepository.save(
                        membership
                );

        secureConnectAllowanceProvisioningService
                .provisionForMembership(
                        savedMembership
                );
    }

    private LocalDateTime calculateExpiryDate(
            LocalDateTime startDate,
            BillingCycle billingCycle
    ) {
        return switch (billingCycle) {
            case MONTHLY ->
                    startDate.plusMonths(1);

            case QUARTERLY ->
                    startDate.plusMonths(3);

            case YEARLY ->
                    startDate.plusYears(1);
        };
    }
}
