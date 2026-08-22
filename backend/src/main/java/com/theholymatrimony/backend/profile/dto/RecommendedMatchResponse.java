package com.theholymatrimony.backend.profile.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RecommendedMatchResponse {

    private UUID id;

    private String name;

    private Integer age;

    private String profession;

    private String denomination;

    private String location;

    private String imageUrl;

    private Integer compatibilityScore;

    private Boolean verified;

    private Boolean churchVerified;
}
