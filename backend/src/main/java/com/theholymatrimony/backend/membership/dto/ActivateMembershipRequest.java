package com.theholymatrimony.backend.membership.dto;

import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ActivateMembershipRequest(

        @NotNull(message = "Membership plan is required.")
        MembershipPlan plan,

        @NotNull(message = "Billing cycle is required.")
        BillingCycle billingCycle,

        @NotBlank(message = "Coupon code is required.")
        String couponCode

) {
}