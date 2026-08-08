package com.theholymatrimony.backend.admin.membership.dto;

import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMembershipResponse {

    private UUID membershipId;

    private UUID userId;

    private String fullName;

    private String email;

    private String mobile;

    private MembershipPlan plan;

    private BillingCycle billingCycle;

    private MembershipStatus status;

    private LocalDateTime startDate;

    private LocalDateTime expiryDate;

    private long daysRemaining;

    private boolean autoRenew;

    private UUID paymentId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
