package com.theholymatrimony.backend.shortlist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShortlistResponse {

    private UUID id;

    private UUID profileId;

    private UUID userId;

    private String fullName;

    private String gender;

    private Integer age;

    private String maritalStatus;

    private String denomination;

    private String churchName;

    private String highestEducation;

    private String profession;

    private String city;

    private String state;

    private String country;

    private Integer completionPercentage;

    private UUID primaryPhotoId;

    private String primaryPhotoUrl;

    private LocalDateTime createdAt;
}