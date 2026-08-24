package com.theholymatrimony.backend.profile.dto;

import java.util.List;

import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProfileResponse {

    // =========================================================
    // Identity
    // =========================================================

    private UUID id;
    private UUID userId;

    // =========================================================
    // User
    // =========================================================

    private String fullName;
    private String email;

    // =========================================================
    // Basic
    // =========================================================

    private String mobile;
    private LocalDate dateOfBirth;
    private String gender;
    private Integer age;
    private String maritalStatus;

    // =========================================================
    // Personal Information
    // =========================================================

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

    // =========================================================
    // Lifestyle
    // =========================================================

    private String diet;
    private String smoking;
    private String drinking;

    // =========================================================
    // Church Information
    // =========================================================

    private String denomination;
    private String churchName;
    private String pastorName;
    private Boolean baptized;
    private String membershipId;

    /*
     * Legacy formatted church address.
     *
     * Retained for existing profiles and backward compatibility.
     */
    private String churchAddress;

    /*
     * Structured church location.
     *
     * Church information remains optional and these fields
     * must never block profile completion or verification.
     */
    private String churchCountry;
    private String churchState;
    private String churchDistrict;
    private String churchCity;

    // =========================================================
    // Education & Career
    // =========================================================

    private String highestEducation;
    private String educationField;
    private String profession;
    private String company;
    private String annualIncome;

    // =========================================================
    // Family Information
    // =========================================================

    private String fatherName;
    private String motherName;
    private String siblings;

    /*
     * Legacy formatted family location.
     *
     * Retained for existing profiles and backward compatibility.
     */
    private String familyLocation;

    /*
     * Structured family location.
     */
    private String familyCountry;
    private String familyState;
    private String familyDistrict;
    private String familyCity;

    private String familyType;
    private String familyValues;

    // =========================================================
    // Partner Preferences
    // =========================================================

    private Integer preferredAgeFrom;
    private Integer preferredAgeTo;

    private Integer preferredHeightFromCm;
    private Integer preferredHeightToCm;

    private String preferredReligion;
    private String preferredDenomination;
    private String preferredMaritalStatus;

    private String preferredCommunity;
    private Boolean communityNoBar;

    private String preferredMotherTongue;

    private String preferredEducation;
    private String preferredProfession;

    /*
     * Preferred location hierarchy.
     *
     * Preferences remain optional and do not affect profile
     * completion or verification eligibility.
     */
    private String preferredCountry;
    private String preferredState;
    private String preferredDistrict;
    private String preferredCity;

    private List<PreferredLocationDto> preferredLocations;

    private String preferredDiet;
    private String preferredSmoking;
    private String preferredDrinking;

    private String preferredFaithCommitment;

    // =========================================================
    // Current Location
    // =========================================================

    private String country;
    private String state;
    private String district;
    private String city;

    // =========================================================
    // About
    // =========================================================

    private String aboutMe;

    // =========================================================
    // Profile Completion
    // =========================================================

    private Integer completionPercentage;
    private Boolean profileCompleted;

    // =========================================================
    // Profile Verification
    // =========================================================

    private ProfileVerificationStatus verificationStatus;
    private LocalDateTime verificationSubmittedAt;
    private LocalDateTime verificationReviewedAt;
    private String verificationReason;
}
