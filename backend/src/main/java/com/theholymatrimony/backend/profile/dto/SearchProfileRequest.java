package com.theholymatrimony.backend.profile.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchProfileRequest {

    private Integer ageFrom;

    private Integer ageTo;

    private String gender;

    private String denomination;

    private String maritalStatus;

    private String country;

    private String state;

    private String city;

    private String highestEducation;

    private String profession;

    private Boolean baptized;

    /*
     * =====================================================
     * Trust Verification Filters
     * =====================================================
     */

    private Boolean aadhaarVerified;

    private Boolean idVerified;

    private Boolean churchVerified;

    /*
     * =====================================================
     * Result Ordering
     * =====================================================
     *
     * Supported values:
     *
     * RECOMMENDED
     * NEWEST
     * TRUST_VERIFIED
     *
     * RECOMMENDED currently follows newest-first ordering.
     * This gives us a stable API contract for introducing
     * matchmaking relevance ranking later.
     */

    private String sort;
}