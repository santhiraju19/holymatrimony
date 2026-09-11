package com.theholymatrimony.backend.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AiSearchModelResult {

    private Integer ageFrom;
    private Integer ageTo;

    private Integer heightFrom;
    private Integer heightTo;

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
    private String district;
    private String city;

    private String diet;
    private String smoking;
    private String drinking;

    private Boolean aadhaarVerified;
    private Boolean idVerified;
    private Boolean churchVerified;

    private String understoodAs;
}
