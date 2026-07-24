package com.theholymatrimony.backend.payments.repository;

import com.theholymatrimony.backend.payments.entity.MembershipPlanEntity;
import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MembershipPlanRepository
        extends JpaRepository<MembershipPlanEntity, UUID> {

    Optional<MembershipPlanEntity> findByPlanAndBillingCycleAndActiveTrue(
            MembershipPlan plan,
            BillingCycle billingCycle
    );
}