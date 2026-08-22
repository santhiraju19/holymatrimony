package com.theholymatrimony.backend.profile.dto;

import com.theholymatrimony.backend.profile.entity.SavedSearchAlertFrequency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSavedSearchRequest {

    @NotBlank
    @Size(max = 100)
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

    private Boolean defaultSearch;

    private Boolean alertsEnabled;

    private SavedSearchAlertFrequency alertFrequency;
}