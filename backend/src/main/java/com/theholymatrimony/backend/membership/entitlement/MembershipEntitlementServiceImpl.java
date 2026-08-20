package com.theholymatrimony.backend.membership.entitlement;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipEntitlementServiceImpl
        implements MembershipEntitlementService {

    private final MembershipRepository membershipRepository;

    private final UserRepository userRepository;

    /*
     * ============================================================
     * PLAN FEATURE DEFINITIONS
     * ============================================================
     *
     * These sets are the backend source of truth for membership
     * capabilities.
     *
     * Business services should ask:
     *
     *     hasFeature(userId, MembershipFeature.CHAT)
     *
     * instead of checking SILVER / GOLD / PLATINUM directly.
     */

    private static final Set<MembershipFeature>
            FREE_FEATURES =
            Collections.emptySet();

    private static final Set<MembershipFeature>
            SILVER_FEATURES =
            Collections.unmodifiableSet(
                    EnumSet.of(
                            MembershipFeature.UNLIMITED_PROFILE_VIEWS,
                            MembershipFeature.UNLIMITED_INTERESTS,
                            MembershipFeature.ADVANCED_SEARCH,
                            MembershipFeature.CHAT,
                            MembershipFeature.VIEW_CONTACT_DETAILS,
                            MembershipFeature.PRIORITY_SEARCH
                    )
            );

    private static final Set<MembershipFeature>
            GOLD_FEATURES =
            Collections.unmodifiableSet(
                    EnumSet.of(
                            MembershipFeature.UNLIMITED_PROFILE_VIEWS,
                            MembershipFeature.UNLIMITED_INTERESTS,
                            MembershipFeature.PROFILE_BOOST,
                            MembershipFeature.HIGHLIGHTED_PROFILE,
                            MembershipFeature.PROFILE_BOOST,
                            MembershipFeature.ADVANCED_SEARCH,
                            MembershipFeature.CHAT,
                            MembershipFeature.VIEW_CONTACT_DETAILS,
                            MembershipFeature.PRIORITY_SEARCH,
                            MembershipFeature.HIGHLIGHTED_PROFILE,
                            MembershipFeature.WHO_VIEWED_ME,
                            MembershipFeature.COMPATIBILITY_SCORE,
                            MembershipFeature.PRIORITY_SUPPORT
                    )
            );

    private static final Set<MembershipFeature>
            PLATINUM_FEATURES =
            Collections.unmodifiableSet(
                    EnumSet.of(
                            MembershipFeature.UNLIMITED_PROFILE_VIEWS,
                            MembershipFeature.UNLIMITED_INTERESTS,
                            MembershipFeature.ADVANCED_SEARCH,
                            MembershipFeature.PROFILE_BOOST,
                            MembershipFeature.HIGHLIGHTED_PROFILE,
                            MembershipFeature.PROFILE_BOOST,
                            MembershipFeature.CHAT,
                            MembershipFeature.VIEW_CONTACT_DETAILS,
                            MembershipFeature.PRIORITY_SEARCH,
                            MembershipFeature.HIGHLIGHTED_PROFILE,
                            MembershipFeature.WHO_VIEWED_ME,
                            MembershipFeature.COMPATIBILITY_SCORE,
                            MembershipFeature.PRIORITY_SUPPORT,
                            MembershipFeature.RELATIONSHIP_MANAGER,
                            MembershipFeature.TOP_SEARCH_PLACEMENT,
                            MembershipFeature.VERIFIED_PREMIUM_BADGE,
                            MembershipFeature.PRIORITY_CHURCH_VERIFICATION,
                            MembershipFeature.EARLY_ACCESS
                    )
            );

    /*
     * ============================================================
     * EFFECTIVE PLAN
     * ============================================================
     *
     * No membership, cancelled membership, or expired membership
     * behaves as FREE.
     */

    @Override
    public MembershipPlan getEffectivePlan(
            UUID userId
    ) {

        User user =
                findUser(
                        userId
                );

        Membership membership =
                membershipRepository
                        .findFirstByUserAndStatusOrderByStartDateDesc(
                                user,
                                MembershipStatus.ACTIVE
                        )
                        .orElse(
                                null
                        );

        if (
                membership == null
        ) {
            return MembershipPlan.FREE;
        }

        if (
                membership.getExpiryDate() == null
                ||
                !membership
                        .getExpiryDate()
                        .isAfter(
                                LocalDateTime.now()
                        )
        ) {
            return MembershipPlan.FREE;
        }

        MembershipPlan plan =
                membership.getPlan();

        if (
                plan == null
        ) {
            return MembershipPlan.FREE;
        }

        return plan;
    }

    /*
     * ============================================================
     * FEATURES
     * ============================================================
     */

    @Override
    public Set<MembershipFeature> getFeatures(
            UUID userId
    ) {

        MembershipPlan plan =
                getEffectivePlan(
                        userId
                );

        return switch (plan) {

            case SILVER ->
                    SILVER_FEATURES;

            case GOLD ->
                    GOLD_FEATURES;

            case PLATINUM ->
                    PLATINUM_FEATURES;

            case FREE ->
                    FREE_FEATURES;
        };
    }

    /*
     * ============================================================
     * FEATURE CHECK
     * ============================================================
     */

    @Override
    public boolean hasFeature(
            UUID userId,
            MembershipFeature feature
    ) {

        if (
                feature == null
        ) {
            return false;
        }

        return getFeatures(
                userId
        ).contains(
                feature
        );
    }

    /*
     * ============================================================
     * REQUIRE FEATURE
     * ============================================================
     */

    @Override
    public void requireFeature(
            UUID userId,
            MembershipFeature feature
    ) {

        if (
                feature == null
        ) {
            throw new IllegalArgumentException(
                    "Membership feature is required."
            );
        }

        if (
                hasFeature(
                        userId,
                        feature
                )
        ) {
            return;
        }

        MembershipPlan effectivePlan =
                getEffectivePlan(
                        userId
                );

        throw new MembershipFeatureRequiredException(
                feature,
                effectivePlan
        );
    }

    /*
     * ============================================================
     * USER LOOKUP
     * ============================================================
     */

    private User findUser(
            UUID userId
    ) {

        if (
                userId == null
        ) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        return userRepository
                .findById(
                        userId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "User was not found."
                                )
                );
    }
}
