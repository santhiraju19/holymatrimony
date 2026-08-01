
package com.theholymatrimony.backend.interest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterestUserResponse {

    private UUID userId;

    private UUID profileId;

    private String fullName;

    private String gender;

    private Integer age;

    private String denomination;

    private String profession;

    private String city;

    private String state;

    private String country;

    private UUID primaryPhotoId;

    private String primaryPhotoUrl;
}