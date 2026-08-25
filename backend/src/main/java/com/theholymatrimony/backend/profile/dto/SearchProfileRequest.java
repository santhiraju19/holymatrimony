package com.theholymatrimony.backend.profile.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchProfileRequest {

    /*
     * ============================================================
     * Match Basics
     * ============================================================
     */

    private Integer ageFrom;

    private Integer ageTo;

    private Integer heightFrom;

    private Integer heightTo;

    private String gender;

    private String maritalStatus;

    /*
     * ============================================================
     * Faith & Background
     * ============================================================
     */

    private String religion;

    private String denomination;

    private String community;

    private String motherTongue;

    private Boolean baptized;

    /*
     * ============================================================
     * Education & Career
     * ============================================================
     */

    private String highestEducation;

    private String profession;

    /*
     * ============================================================
     * Location
     * ============================================================
     */

    private String country;

    private String state;

    private String district;


    private String city;

    /*
     * ============================================================
     * Lifestyle
     * ============================================================
     */

    private String diet;

    private String smoking;

    private String drinking;

    /*
     * ============================================================
     * Trust Verification Filters
     * ============================================================
     */

    private Boolean aadhaarVerified;

    private Boolean idVerified;

    private Boolean churchVerified;

    /*
     * ============================================================
     * Result Ordering
     * ============================================================
     *
     * Supported values:
     *
     * RECOMMENDED
     * NEWEST
     * TRUST_VERIFIED
     */

    private String sort;
}
