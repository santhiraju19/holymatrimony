package com.theholymatrimony.backend.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicFeaturedProfileResponse {

    private UUID id;

    /*
     * Privacy-safe display name.
     * Only the member's first name is exposed publicly.
     */
    private String firstName;

    private Integer age;

    private String denomination;

    private String profession;

    private String city;

    private String state;

    private String country;

    private Integer completionPercentage;

    private Boolean mobileVerified;

    private Boolean churchVerified;

    private Boolean identityVerified;

    /*
     * True when at least one supported trust verification
     * has been approved.
     */
    private Boolean verifiedProfile;

    private String primaryPhotoUrl;
}
