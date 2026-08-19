package com.theholymatrimony.backend.membership.entitlement;

import com.theholymatrimony.backend.payments.enums.MembershipPlan;

import lombok.Getter;

@Getter
public class MembershipFeatureRequiredException
        extends RuntimeException {

    private final MembershipFeature feature;

    private final MembershipPlan currentPlan;

    public MembershipFeatureRequiredException(
            MembershipFeature feature,
            MembershipPlan currentPlan
    ) {

        super(
                buildMessage(
                        feature
                )
        );

        this.feature =
                feature;

        this.currentPlan =
                currentPlan;
    }

    private static String buildMessage(
            MembershipFeature feature
    ) {

        return switch (feature) {

            case CHAT ->
                    "Upgrade your membership to access chat.";

            case VIEW_CONTACT_DETAILS ->
                    "Upgrade your membership to view contact details.";

            case ADVANCED_SEARCH ->
                    "Upgrade your membership to use advanced search.";

            case UNLIMITED_INTERESTS ->
                    "Upgrade your membership for unlimited interests.";

            case UNLIMITED_PROFILE_VIEWS ->
                    "Upgrade your membership for unlimited profile views.";

            case PRIORITY_SEARCH ->
                    "Upgrade your membership to access priority search.";

            case WHO_VIEWED_ME ->
                    "Upgrade your membership to see who viewed your profile.";

            case COMPATIBILITY_SCORE ->
                    "Upgrade your membership to access compatibility scores.";

            case HIGHLIGHTED_PROFILE ->
                    "Upgrade your membership to highlight your profile.";

            case PRIORITY_SUPPORT ->
                    "Upgrade your membership to access priority support.";

            case RELATIONSHIP_MANAGER ->
                    "Upgrade to Platinum to access a dedicated relationship manager.";

            case TOP_SEARCH_PLACEMENT ->
                    "Upgrade to Platinum for top search placement.";

            case VERIFIED_PREMIUM_BADGE ->
                    "Upgrade to Platinum to access the premium badge.";

            case PRIORITY_CHURCH_VERIFICATION ->
                    "Upgrade to Platinum for priority church verification.";

            case EARLY_ACCESS ->
                    "Upgrade to Platinum for early access to new features.";
        };
    }
}
