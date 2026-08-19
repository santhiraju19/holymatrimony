package com.theholymatrimony.backend.profile.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ProfileContactResponse {

    private UUID profileId;

    private String fullName;

    private String email;

    private String mobile;

    private Boolean mobileVerified;
}
