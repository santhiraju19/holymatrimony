package com.theholymatrimony.backend.admin.dto;

import com.theholymatrimony.backend.profile.dto.PhotoResponse;
import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProfileDetailResponse {

    private UUID profileId;

    private UUID userId;

    // User
    private String fullName;
    private String email;

    // Basic
    private String mobile;
    private LocalDate dateOfBirth;
    private String gender;
    private Integer age;
    private String maritalStatus;

    // Church
    private String denomination;
    private String churchName;
    private String pastorName;
    private Boolean baptized;
    private String membershipId;
    private String churchAddress;

    // Education
    private String highestEducation;
    private String profession;
    private String company;
    private String annualIncome;

    // Family
    private String fatherName;
    private String motherName;
    private String siblings;
    private String familyLocation;

    // Preferences
    private Integer preferredAgeFrom;
    private Integer preferredAgeTo;
    private String preferredDenomination;
    private String preferredEducation;

    // Location
    private String city;
    private String state;
    private String country;

    // About
    private String aboutMe;

    // Completion
    private Integer completionPercentage;
    private Boolean profileCompleted;

    // Verification
    private ProfileVerificationStatus verificationStatus;

    private LocalDateTime verificationSubmittedAt;

    private LocalDateTime verificationReviewedAt;

    private UUID verificationReviewedBy;

    private String verificationReason;

    // Photos
    private List<PhotoResponse> photos;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}