package com.theholymatrimony.backend.profile.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchProfileRequest {

    private Integer ageFrom;

    private Integer ageTo;

    private String gender;

    private String denomination;

    private String maritalStatus;

    private String state;

    private String city;

    private String highestEducation;

    private String profession;

    private Boolean baptized;
}