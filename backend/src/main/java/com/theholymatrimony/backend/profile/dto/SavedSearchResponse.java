package com.theholymatrimony.backend.profile.dto;

import com.theholymatrimony.backend.profile.entity.SavedSearchAlertFrequency;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class SavedSearchResponse {

    private UUID id;

    private String name;

    private Integer ageFrom;
    private Integer ageTo;

    private Integer heightFrom;
    private Integer heightTo;

    private String gender;
    private String maritalStatus;

    private String religion;
    private String denomination;
    private String community;
    private String motherTongue;

    private Boolean baptized;

    private String highestEducation;
    private String profession;

    private String country;
    private String state;
    private String city;

    private String diet;
    private String smoking;
    private String drinking;

    private Boolean aadhaarVerified;
    private Boolean idVerified;
    private Boolean churchVerified;

    private String sort;

    private boolean defaultSearch;

    private boolean alertsEnabled;

    private SavedSearchAlertFrequency alertFrequency;

    private Instant lastAlertedAt;

    private Instant createdAt;

    private Instant updatedAt;
}