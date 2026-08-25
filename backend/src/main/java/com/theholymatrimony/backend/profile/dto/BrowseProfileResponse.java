package com.theholymatrimony.backend.profile.dto;

import com.theholymatrimony.backend.compatibility.dto.CompatibilityCategoryResponse;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class BrowseProfileResponse {

    private UUID id;
    private UUID userId;

    /*
     * ============================================================
     * Premium Visibility
     * ============================================================
     */

    private Boolean highlightedProfile;

    private Boolean verifiedPremiumBadge;

    private Boolean boostedProfile;

    /*
     * ============================================================
     * Compatibility
     * ============================================================
     */

    private Integer compatibilityScore;

    private Integer compatibilityAgeScore;

    private Integer compatibilityDenominationScore;

    private Integer compatibilityEducationScore;

    /*
     * Compatibility 2.0 category breakdown.
     *
     * Legacy compatibility fields above remain temporarily for
     * existing frontend components.
     */
    private List<CompatibilityCategoryResponse> compatibilityCategories;

    /*
     * ============================================================
     * Basic
     * ============================================================
     */

    private String fullName;

    private LocalDate dateOfBirth;

    private String gender;

    private Integer age;

    private String maritalStatus;

    /*
     * ============================================================
     * Personal Information
     * ============================================================
     */

    private Integer heightCm;

    private Integer weightKg;

    private String complexion;

    private String bodyType;

    private String motherTongue;

    private String religion;

    private String community;

    private String subCommunity;

    private String faithBackground;

    private String physicalStatus;

    private String diet;

    private String smoking;

    private String drinking;

    /*
     * ============================================================
     * Church
     * ============================================================
     */

    private String denomination;

    private String churchName;

    private String pastorName;

    private Boolean baptized;

    /*
     * ============================================================
     * Education / Career
     * ============================================================
     */

    private String highestEducation;

    private String educationField;

    private String profession;

    private String company;

    private String annualIncome;

    /*
     * ============================================================
     * Family
     * ============================================================
     */

    private String familyType;

    private String familyValues;

    /*
     * ============================================================
     * Location
     * ============================================================
     */

    private String city;

    private String state;

    private String country;

    /*
     * ============================================================
     * About
     * ============================================================
     */

    private String aboutMe;

    /*
     * ============================================================
     * Completion
     * ============================================================
     */

    private Integer completionPercentage;

    private Boolean profileCompleted;

    /*
     * ============================================================
     * Trust Verification
     * ============================================================
     */

    private Boolean mobileVerified;

    private Boolean churchVerified;

    private Boolean identityVerified;

    private Boolean aadhaarVerified;

    private Boolean idVerified;

    private Boolean verifiedProfile;

    /*
     * ============================================================
     * Photo
     * ============================================================
     */

    private UUID primaryPhotoId;

    private String primaryPhotoUrl;

    /*
     * All member-facing profile photos.
     *
     * Primary photo is returned first followed by the
     * remaining photos in member-defined display order.
     */

    private List<BrowseProfilePhotoResponse> photos;
}