package com.theholymatrimony.backend.admin.analytics.service;

import com.theholymatrimony.backend.admin.analytics.dto.AdminAnalyticsResponse;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final MembershipRepository membershipRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public AdminAnalyticsResponse getAnalytics(
            LocalDate from,
            LocalDate to
    ) {

        LocalDate resolvedTo =
                to != null
                        ? to
                        : LocalDate.now();

        LocalDate resolvedFrom =
                from != null
                        ? from
                        : resolvedTo.withDayOfMonth(1);

        if (
                resolvedFrom.isAfter(
                        resolvedTo
                )
        ) {
            throw new IllegalArgumentException(
                    "From date cannot be after to date."
            );
        }

        LocalDateTime start =
                resolvedFrom.atStartOfDay();

        LocalDateTime end =
                resolvedTo
                        .plusDays(1)
                        .atStartOfDay();

        /*
         * USERS
         */

        long registeredUsers =
                userRepository
                        .countByCreatedAtBetween(
                                start,
                                end
                        );

        long totalUsers =
                userRepository.count();

        /*
         * PROFILES
         */

        long profilesCreated =
                profileRepository
                        .countByCreatedAtBetween(
                                start,
                                end
                        );

        long completedProfiles =
                profileRepository
                        .countByProfileCompletedTrueAndCreatedAtBetween(
                                start,
                                end
                        );

        long incompleteProfiles =
                Math.max(
                        0,
                        profilesCreated
                                - completedProfiles
                );

        long browseVisibleProfiles =
                completedProfiles;

        /*
         * MEMBERSHIPS
         *
         * Operational membership creation counts.
         */

        long paidMemberships =
                membershipRepository
                        .countSuccessfulPaidMembershipsBetween(
                                MembershipPlan.FREE,
                                start,
                                end
                        );

        long silverMemberships =
                membershipRepository
                        .countSuccessfulPaidMembershipsByPlanBetween(
                                MembershipPlan.SILVER,
                                start,
                                end
                        );

        long goldMemberships =
                membershipRepository
                        .countSuccessfulPaidMembershipsByPlanBetween(
                                MembershipPlan.GOLD,
                                start,
                                end
                        );

        long platinumMemberships =
                membershipRepository
                        .countSuccessfulPaidMembershipsByPlanBetween(
                                MembershipPlan.PLATINUM,
                                start,
                                end
                        );

        /*
         * PAYMENTS
         */

        long successfulPayments =
                paymentRepository
                        .countByStatusAndPaidAtBetween(
                                PaymentStatus.SUCCESS,
                                start,
                                end
                        );

        long pendingPayments =
                paymentRepository
                        .countByStatusAndCreatedAtBetween(
                                PaymentStatus.PENDING,
                                start,
                                end
                        );

        long failedPayments =
                paymentRepository
                        .countByStatusAndCreatedAtBetween(
                                PaymentStatus.FAILED,
                                start,
                                end
                        );

        /*
         * REVENUE
         */

        BigDecimal periodRevenue =
                paiseToRupees(
                        paymentRepository
                                .sumAmountByStatusAndPaidAtBetween(
                                        PaymentStatus.SUCCESS,
                                        start,
                                        end
                                )
                );

        BigDecimal lifetimeRevenue =
                paiseToRupees(
                        paymentRepository
                                .sumAmountByStatus(
                                        PaymentStatus.SUCCESS
                                )
                );

        /*
         * CONVERSION
         *
         * Period registrations are used as denominator
         * for the selected reporting window.
         */

        BigDecimal registrationToProfileRate =
                percentage(
                        completedProfiles,
                        registeredUsers
                );

        BigDecimal registrationToPaidRate =
                percentage(
                        paidMemberships,
                        registeredUsers
                );

        return AdminAnalyticsResponse
                .builder()

                .from(resolvedFrom)
                .to(resolvedTo)

                .registeredUsers(
                        registeredUsers
                )
                .totalUsers(
                        totalUsers
                )

                .profilesCreated(
                        profilesCreated
                )
                .completedProfiles(
                        completedProfiles
                )
                .incompleteProfiles(
                        incompleteProfiles
                )
                .browseVisibleProfiles(
                        browseVisibleProfiles
                )

                .paidMemberships(
                        paidMemberships
                )
                .silverMemberships(
                        silverMemberships
                )
                .goldMemberships(
                        goldMemberships
                )
                .platinumMemberships(
                        platinumMemberships
                )

                .successfulPayments(
                        successfulPayments
                )
                .pendingPayments(
                        pendingPayments
                )
                .failedPayments(
                        failedPayments
                )

                .periodRevenue(
                        periodRevenue
                )
                .lifetimeRevenue(
                        lifetimeRevenue
                )

                .registrationToProfileRate(
                        registrationToProfileRate
                )
                .registrationToPaidRate(
                        registrationToPaidRate
                )

                .build();
    }

    private BigDecimal percentage(
            long numerator,
            long denominator
    ) {

        if (denominator <= 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal
                .valueOf(numerator)
                .multiply(
                        BigDecimal.valueOf(100)
                )
                .divide(
                        BigDecimal.valueOf(denominator),
                        1,
                        RoundingMode.HALF_UP
                );
    }

    private BigDecimal paiseToRupees(
            BigDecimal amountInPaise
    ) {

        if (amountInPaise == null) {
            return BigDecimal.ZERO;
        }

        return amountInPaise
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );
    }
}
