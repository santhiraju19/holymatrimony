package com.theholymatrimony.backend.membership.entitlement;

public enum MembershipFeature {

    UNLIMITED_PROFILE_VIEWS,
    UNLIMITED_INTERESTS,
    ADVANCED_SEARCH,
    CHAT,
    VIEW_CONTACT_DETAILS,
    PRIORITY_SEARCH,
    HIGHLIGHTED_PROFILE,
    PROFILE_BOOST,
    WHO_VIEWED_ME,
    COMPATIBILITY_SCORE,
    PRIORITY_SUPPORT,
    RELATIONSHIP_MANAGER,
    TOP_SEARCH_PLACEMENT,
    VERIFIED_PREMIUM_BADGE,
    PRIORITY_CHURCH_VERIFICATION,
    EARLY_ACCESS,

    /*
     * ============================================================
     * SECURE CONNECT
     * ============================================================
     *
     * AUDIO_CALL
     *   SILVER, GOLD and PLATINUM may initiate secure audio calls.
     *
     * VIDEO_CALL
     *   GOLD and PLATINUM may initiate secure video calls.
     *
     * UNLIMITED_SECURE_CONNECT
     *   PLATINUM calls do not consume plan allowance or purchased
     *   top-up minutes.
     *
     * Minute allowances and purchased top-up balances are handled
     * separately by the Secure Connect usage/wallet subsystem.
     */
    AUDIO_CALL,
    VIDEO_CALL,
    UNLIMITED_SECURE_CONNECT
}
