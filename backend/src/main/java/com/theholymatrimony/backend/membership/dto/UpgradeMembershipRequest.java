package com.theholymatrimony.backend.membership.dto;

import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpgradeMembershipRequest {

    @NotNull
    private MembershipPlan plan;

    @NotNull
    private BillingCycle billingCycle;
}