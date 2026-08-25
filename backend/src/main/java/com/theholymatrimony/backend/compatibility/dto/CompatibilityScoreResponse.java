package com.theholymatrimony.backend.compatibility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompatibilityScoreResponse {

    /*
     * ============================================================
     * Overall score
     * ============================================================
     */

    private Integer score;

    /*
     * ============================================================
     * Compatibility 2.0 breakdown
     * ============================================================
     */

    private List<CompatibilityCategoryResponse> categories;

    /*
     * ============================================================
     * Legacy frontend contract
     * ============================================================
     *
     * Keep temporarily while BrowseProfileCard and
     * ProfileDetailsContent migrate to the richer categories model.
     */

    private Integer ageScore;

    private Integer denominationScore;

    private Integer educationScore;

    private Boolean ageCompatible;

    private Boolean denominationCompatible;

    private Boolean educationCompatible;
}
