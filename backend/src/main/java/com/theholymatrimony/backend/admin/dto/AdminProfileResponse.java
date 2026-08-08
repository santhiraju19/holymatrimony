package com.theholymatrimony.backend.admin.dto;

import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProfileResponse {

    private UUID profileId;

    private UUID userId;

    private String fullName;

    private String email;

    private String mobile;

    private String gender;

    private Integer age;

    private String denomination;

    private String churchName;

    private String city;

    private String state;

    private String country;

    private Integer completionPercentage;

    private Boolean profileCompleted;

    private ProfileVerificationStatus verificationStatus;

    private LocalDateTime verificationSubmittedAt;

    private LocalDateTime verificationReviewedAt;

    private String primaryPhotoUrl;

    private LocalDateTime createdAt;
}