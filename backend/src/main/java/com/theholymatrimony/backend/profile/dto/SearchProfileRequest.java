package com.theholymatrimony.backend.profile.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

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
     *
     * Legacy single-location fields remain supported for:
     *
     * - existing browse/search requests
     * - saved searches
     * - older frontend clients
     *
     * locations is the new multi-location search contract.
     *
     * Location groups are OR conditions:
     *
     *   location1 OR location2 OR location3
     *
     * Fields inside one location are AND conditions:
     *
     *   country AND state AND district AND city
     */

    private String country;

    private String state;

    private String district;

    private String city;

    private List<SearchLocationRequest> locations;

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