package com.theholymatrimony.backend.admin.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {

    private LocalDate from;
    private LocalDate to;

    /*
     * USERS
     */

    private long registeredUsers;
    private long totalUsers;

    /*
     * PROFILES
     */

    private long profilesCreated;
    private long completedProfiles;
    private long incompleteProfiles;
    private long browseVisibleProfiles;

    /*
     * MEMBERSHIP SALES
     */

    private long paidMemberships;
    private long silverMemberships;
    private long goldMemberships;
    private long platinumMemberships;

    /*
     * PAYMENTS
     */

    private long successfulPayments;
    private long pendingPayments;
    private long failedPayments;

    /*
     * REVENUE - RUPEES
     */

    private BigDecimal periodRevenue;
    private BigDecimal lifetimeRevenue;

    /*
     * CONVERSION
     */

    private BigDecimal registrationToProfileRate;
    private BigDecimal registrationToPaidRate;
}
