package com.theholymatrimony.backend.admin.service;

import com.theholymatrimony.backend.admin.dto.AdminDashboardResponse;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.communication.repository.ChatMessageRepository;
import com.theholymatrimony.backend.interest.repository.InterestRepository;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
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
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final InterestRepository interestRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MembershipRepository membershipRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {

        LocalDate today = LocalDate.now();

        LocalDateTime startOfToday =
                today.atStartOfDay();

        LocalDateTime startOfTomorrow =
                today.plusDays(1).atStartOfDay();

        LocalDateTime startOfMonth =
                today.withDayOfMonth(1).atStartOfDay();

        LocalDateTime startOfNextMonth =
                today.plusMonths(1)
                        .withDayOfMonth(1)
                        .atStartOfDay();

        LocalDateTime sevenDaysAgo =
                startOfToday.minusDays(6);

        LocalDateTime sevenDaysFromNow =
                startOfToday.plusDays(7);

        /*
         * ============================================================
         * USERS
         * ============================================================
         */

        long totalUsers =
                userRepository.count();

        long usersToday =
                userRepository.countByCreatedAtBetween(
                        startOfToday,
                        startOfTomorrow
                );

        long usersLast7Days =
                userRepository.countByCreatedAtGreaterThanEqual(
                        sevenDaysAgo
                );

        long usersThisMonth =
                userRepository.countByCreatedAtBetween(
                        startOfMonth,
                        startOfNextMonth
                );

        /*
         * ============================================================
         * PROFILES
         * ============================================================
         */

        long totalProfiles =
                profileRepository.count();

        long completedProfiles =
                profileRepository.countByProfileCompletedTrue();

        long incompleteProfiles =
                totalProfiles - completedProfiles;

        long browseVisibleProfiles =
                completedProfiles;

        BigDecimal profileCompletionRate =
                percentage(
                        completedProfiles,
                        totalProfiles
                );

        /*
         * ============================================================
         * MEMBERSHIPS
         * ============================================================
         */

        long totalMemberships =
                membershipRepository.count();

        long activePaidMemberships =
                membershipRepository.countByStatusAndPlanNot(
                        MembershipStatus.ACTIVE,
                        MembershipPlan.FREE
                );

        long activeSilverMemberships =
                membershipRepository.countByStatusAndPlan(
                        MembershipStatus.ACTIVE,
                        MembershipPlan.SILVER
                );

        long activeGoldMemberships =
                membershipRepository.countByStatusAndPlan(
                        MembershipStatus.ACTIVE,
                        MembershipPlan.GOLD
                );

        long activePlatinumMemberships =
                membershipRepository.countByStatusAndPlan(
                        MembershipStatus.ACTIVE,
                        MembershipPlan.PLATINUM
                );

        long membershipsExpiringIn7Days =
                membershipRepository
                        .countByStatusAndPlanNotAndExpiryDateBetween(
                                MembershipStatus.ACTIVE,
                                MembershipPlan.FREE,
                                startOfToday,
                                sevenDaysFromNow
                        );

        /*
         * ============================================================
         * PAYMENTS
         * ============================================================
         */

        long totalPayments =
                paymentRepository.count();

        long successfulPayments =
                paymentRepository.countByStatus(
                        PaymentStatus.SUCCESS
                );

        long pendingPayments =
                paymentRepository.countByStatus(
                        PaymentStatus.PENDING
                );

        long failedPayments =
                paymentRepository.countByStatus(
                        PaymentStatus.FAILED
                );

        /*
         * ============================================================
         * REVENUE
         * ============================================================
         */

        BigDecimal revenueToday =
                safeAmount(
                        paymentRepository
                                .sumAmountByStatusAndPaidAtBetween(
                                        PaymentStatus.SUCCESS,
                                        startOfToday,
                                        startOfTomorrow
                                )
                );

        BigDecimal revenueThisMonth =
                safeAmount(
                        paymentRepository
                                .sumAmountByStatusAndPaidAtBetween(
                                        PaymentStatus.SUCCESS,
                                        startOfMonth,
                                        startOfNextMonth
                                )
                );

        BigDecimal totalRevenue =
                safeAmount(
                        paymentRepository.sumAmountByStatus(
                                PaymentStatus.SUCCESS
                        )
                );

        /*
         * ============================================================
         * CONVERSION
         * ============================================================
         */

        BigDecimal registrationToProfileRate =
                percentage(
                        completedProfiles,
                        totalUsers
                );

        BigDecimal registrationToPaidRate =
                percentage(
                        activePaidMemberships,
                        totalUsers
                );

        return AdminDashboardResponse
                .builder()

                .totalUsers(totalUsers)
                .usersToday(usersToday)
                .usersLast7Days(usersLast7Days)
                .usersThisMonth(usersThisMonth)

                .totalProfiles(totalProfiles)
                .completedProfiles(completedProfiles)
                .incompleteProfiles(incompleteProfiles)
                .browseVisibleProfiles(browseVisibleProfiles)
                .profileCompletionRate(profileCompletionRate)

                .totalMemberships(totalMemberships)
                .activePaidMemberships(activePaidMemberships)
                .activeSilverMemberships(activeSilverMemberships)
                .activeGoldMemberships(activeGoldMemberships)
                .activePlatinumMemberships(activePlatinumMemberships)
                .membershipsExpiringIn7Days(
                        membershipsExpiringIn7Days
                )

                .totalPayments(totalPayments)
                .successfulPayments(successfulPayments)
                .pendingPayments(pendingPayments)
                .failedPayments(failedPayments)

                .revenueToday(revenueToday)
                .revenueThisMonth(revenueThisMonth)
                .totalRevenue(totalRevenue)

                .totalInterests(
                        interestRepository.count()
                )
                .totalMessages(
                        chatMessageRepository.count()
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

    private BigDecimal safeAmount(
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
