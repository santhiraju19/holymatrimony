package com.theholymatrimony.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    /*
     * ============================================================
     * USERS
     * ============================================================
     */

    private long totalUsers;

    private long usersToday;

    private long usersLast7Days;

    private long usersThisMonth;

    /*
     * ============================================================
     * PROFILES
     * ============================================================
     */

    private long totalProfiles;

    private long completedProfiles;

    private long incompleteProfiles;

    private long browseVisibleProfiles;

    private BigDecimal profileCompletionRate;

    /*
     * ============================================================
     * MEMBERSHIPS
     * ============================================================
     */

    private long totalMemberships;

    private long activePaidMemberships;

    private long activeSilverMemberships;

    private long activeGoldMemberships;

    private long activePlatinumMemberships;

    private long membershipsExpiringIn7Days;

    /*
     * ============================================================
     * PAYMENTS
     * ============================================================
     */

    private long totalPayments;

    private long successfulPayments;

    private long pendingPayments;

    private long failedPayments;

    /*
     * ============================================================
     * REVENUE
     * ============================================================
     */

    private BigDecimal revenueToday;

    private BigDecimal revenueThisMonth;

    private BigDecimal totalRevenue;

    /*
     * ============================================================
     * MATCHMAKING ACTIVITY
     * ============================================================
     */

    private long totalInterests;

    private long totalMessages;

    /*
     * ============================================================
     * CONVERSION
     * ============================================================
     */

    private BigDecimal registrationToProfileRate;

    private BigDecimal registrationToPaidRate;
}
