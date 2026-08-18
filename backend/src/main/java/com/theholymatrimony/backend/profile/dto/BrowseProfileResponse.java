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
    private Boolean identityVerified;
    private Boolean verifiedProfile;

    private UUID primaryPhotoId;
    private String primaryPhotoUrl;
}