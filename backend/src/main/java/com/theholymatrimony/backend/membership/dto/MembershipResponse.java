package com.theholymatrimony.backend.membership.dto;

import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MembershipResponse {

    private MembershipPlan plan;

    private BillingCycle billingCycle;

    private MembershipStatus status;

    private LocalDateTime startDate;

    private LocalDateTime expiryDate;
}