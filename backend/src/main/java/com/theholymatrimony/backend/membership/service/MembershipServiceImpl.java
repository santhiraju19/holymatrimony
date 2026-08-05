package com.theholymatrimony.backend.membership.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.membership.dto.ActivateMembershipRequest;
import com.theholymatrimony.backend.membership.dto.MembershipResponse;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;

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

    @Override
    public MembershipResponse getMembership(
            UUID userId
    ) {
        User user =
                findUser(userId);

        Membership activeMembership =
                membershipRepository
                        .findFirstByUserAndStatusOrderByStartDateDesc(
                                user,
                                MembershipStatus.ACTIVE
                        )
                        .orElse(null);

        if (activeMembership == null) {
            return createFreeMembershipResponse();
        }

        if (isExpired(activeMembership)) {
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

    @Override
    @Transactional
    public MembershipResponse activateWaivedMembership(
            UUID userId,
            ActivateMembershipRequest request
    ) {
        User user =
                findUser(userId);

        validateHoly100Request(request);

        LocalDateTime now =
                LocalDateTime.now();

        /*
         * End any existing active membership before
         * activating the newly selected monthly plan.
         */
        membershipRepository
                .findAllByUser(user)
                .stream()
                .filter(
                        membership ->
                                membership.getStatus()
                                        == MembershipStatus.ACTIVE
                )
                .forEach(membership -> {
                    membership.setStatus(
                            MembershipStatus.CANCELLED
                    );

                    if (
                            membership.getExpiryDate() == null
                                    || membership
                                    .getExpiryDate()
                                    .isAfter(now)
                    ) {
                        membership.setExpiryDate(now);
                    }

                    membershipRepository.save(
                            membership
                    );
                });

        Membership membership =
                Membership.builder()
                        .user(user)
                        .plan(request.plan())
                        .billingCycle(
                                BillingCycle.MONTHLY
                        )
                        .startDate(now)
                        .expiryDate(
                                now.plusMonths(1)
                        )
                        .status(
                                MembershipStatus.ACTIVE
                        )
                        .payment(null)
                        .autoRenew(false)
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

    private void validateHoly100Request(
            ActivateMembershipRequest request
    ) {
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
                !HOLY100_ELIGIBLE_PLANS.contains(
                        request.plan()
                )
        ) {
            throw new IllegalArgumentException(
                    "HOLY100 is valid only for Silver, Gold, and Platinum plans."
            );
        }
    }

    private String normalizeCoupon(
            String couponCode
    ) {
        if (
                couponCode == null
                        || couponCode.isBlank()
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

    private User findUser(
            UUID userId
    ) {
        return userRepository
                .findById(userId)
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "User was not found."
                                )
                );
    }

    private boolean isExpired(
            Membership membership
    ) {
        return membership.getExpiryDate() == null
                || !membership
                .getExpiryDate()
                .isAfter(
                        LocalDateTime.now()
                );
    }

    private MembershipResponse
    createFreeMembershipResponse() {
        return MembershipResponse.builder()
                .membershipId(null)
                .plan(
                        MembershipPlan.FREE
                )
                .billingCycle(null)
                .status(
                        MembershipStatus.ACTIVE
                )
                .startDate(null)
                .expiryDate(null)
                .daysRemaining(0L)
                .autoRenew(false)
                .build();
    }

    private MembershipResponse toResponse(
            Membership membership,
            MembershipStatus effectiveStatus
    ) {
        return MembershipResponse.builder()
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

    private long calculateDaysRemaining(
            LocalDateTime expiryDate,
            MembershipStatus status
    ) {
        if (
                expiryDate == null
                        || status
                        != MembershipStatus.ACTIVE
        ) {
            return 0L;
        }

        long days =
                ChronoUnit.DAYS.between(
                        LocalDateTime.now(),
                        expiryDate
                );

        /*
         * A newly activated membership may show
         * 30 or 31 days depending on the month.
         */
        return Math.max(
                0L,
                days
        );
    }
}