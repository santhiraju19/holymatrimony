package com.theholymatrimony.backend.compatibility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompatibilityScoreResponse {

    private Integer score;

    private Integer ageScore;

    private Integer denominationScore;

    private Integer educationScore;

    private Boolean ageCompatible;

    private Boolean denominationCompatible;

    private Boolean educationCompatible;
}