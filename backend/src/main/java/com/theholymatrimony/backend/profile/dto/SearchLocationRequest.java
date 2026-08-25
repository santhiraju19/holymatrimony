package com.theholymatrimony.backend.profile.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchLocationRequest {

    private String country;

    private String state;

    private String district;

    private String city;
}