package com.theholymatrimony.backend.profile.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ProfileRequest {

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

    /*
     * Current faith/religion.
     *
     * Example:
     * Christianity
     */
    private String religion;

    /*
     * Social/community background.
     *
     * Examples:
     * Reddy
     * Kamma
     * Kapu
     *
     * Optional.
     */
    private String community;

    private String subCommunity;

    /*
     * Examples:
     *
     * CHRISTIAN_BY_BIRTH
     * CONVERTED_TO_CHRISTIANITY
     * CHRISTIAN_FAMILY_BACKGROUND
     * PREFER_NOT_TO_SAY
     */
    private String faithBackground;

    private String physicalStatus;

    // =========================================================
    // Lifestyle
    // =========================================================

    private String diet;
    private String smoking;
    private String drinking;

    // =========================================================
    // Church
    // =========================================================

    private String denomination;
    private String churchName;
    private String pastorName;
    private Boolean baptized;
    private String membershipId;
    private String churchAddress;

    // =========================================================
    // Education & Career
    // =========================================================

    private String highestEducation;
    private String educationField;
    private String profession;
    private String company;
    private String annualIncome;

    // =========================================================
    // Family
    // =========================================================

    private String fatherName;
    private String motherName;
    private String siblings;
    private String familyLocation;
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

    /*
     * true:
     * Community should not restrict matching.
     *
     * false:
     * preferredCommunity may be used for matching.
     */
    private Boolean communityNoBar;

    private String preferredMotherTongue;

    private String preferredEducation;
    private String preferredProfession;

    private String preferredCountry;
    private String preferredState;
    private String preferredCity;

    private String preferredDiet;
    private String preferredSmoking;
    private String preferredDrinking;

    private String preferredFaithCommitment;

    // =========================================================
    // Current Location
    // =========================================================

    private String city;
    private String state;
    private String country;

    // =========================================================
    // About
    // =========================================================

    private String aboutMe;
}
