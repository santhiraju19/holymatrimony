package com.theholymatrimony.backend.profile.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class BrowseProfileResponse {

    private UUID id;
    private UUID userId;

    private String fullName;

    private LocalDate dateOfBirth;
    private String gender;
    private Integer age;
    private String maritalStatus;

    private String denomination;
    private String churchName;
    private Boolean baptized;

    private String highestEducation;
    private String profession;
    private String company;
    private String annualIncome;

    private String city;
    private String state;
    private String country;

    private String aboutMe;

    private Integer completionPercentage;
    private Boolean profileCompleted;

    // ===== Trust Verification =====

    private Boolean mobileVerified;

    private Boolean churchVerified;

    /*
     * Any approved identity document.
     * Kept for backward compatibility.
     */
    private Boolean identityVerified;

    /*
     * Approved Aadhaar document.
     */
    private Boolean aadhaarVerified;

    /*
     * Approved non-Aadhaar identity document:
     * Passport / Driving Licence / Voter ID.
     */
    private Boolean idVerified;

    /*
     * Existing compatibility field.
     */
    private Boolean verifiedProfile;

    private UUID primaryPhotoId;
    private String primaryPhotoUrl;
}