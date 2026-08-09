package com.theholymatrimony.backend.payments.service;

import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentFinalizationService {

    private final PaymentRepository paymentRepository;
    private final MembershipRepository membershipRepository;

    @Transactional
    public Payment finalizeSuccessfulPayment(
            Payment payment,
            String razorpayPaymentId,
            String razorpaySignature
    ) {

        /*
         * Idempotency:
         *
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

    private void activateMembership(
            Payment payment
    ) {

        /*
         * Additional idempotency protection.
         *
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

        membershipRepository.save(
                membership
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