package com.theholymatrimony.backend.ai.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiSearchInterpretationResponse {

    private String originalQuery;

    private String understoodAs;

    private AiSearchFilters filters;

    /*
     * True when the AI provider successfully
     * interpreted the request.
     *
     * False allows the frontend to gracefully
     * fall back to ordinary keyword search.
     */
    private boolean aiInterpreted;
}
