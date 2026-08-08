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

    private long totalUsers;

    private long totalProfiles;

    private long totalInterests;

    private long totalMessages;

    private long totalMemberships;

    private long totalPayments;

    private BigDecimal totalRevenue;
}