package com.theholymatrimony.backend.membership.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.membership.dto.MembershipResponse;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipServiceImpl
        implements MembershipService {

    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Override
    public MembershipResponse getMembership(UUID userId) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User was not found."
                        )
                );

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

    private boolean isExpired(
            Membership membership
    ) {
        return membership.getExpiryDate() == null
                || !membership.getExpiryDate()
                        .isAfter(LocalDateTime.now());
    }

    private MembershipResponse createFreeMembershipResponse() {

        return MembershipResponse.builder()
                .membershipId(null)
                .plan(MembershipPlan.FREE)
                .billingCycle(null)
                .status(MembershipStatus.ACTIVE)
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
                        || status != MembershipStatus.ACTIVE
        ) {
            return 0L;
        }

        long days = ChronoUnit.DAYS.between(
                LocalDateTime.now(),
                expiryDate
        );

        return Math.max(0L, days);
    }
}