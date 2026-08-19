package com.theholymatrimony.backend.membership.entitlement;

import com.theholymatrimony.backend.payments.enums.MembershipPlan;

import java.util.Set;
import java.util.UUID;

public interface MembershipEntitlementService {

    MembershipPlan getEffectivePlan(
            UUID userId
    );

    Set<MembershipFeature> getFeatures(
            UUID userId
    );

    boolean hasFeature(
            UUID userId,
            MembershipFeature feature
    );

    void requireFeature(
            UUID userId,
            MembershipFeature feature
    );
}
