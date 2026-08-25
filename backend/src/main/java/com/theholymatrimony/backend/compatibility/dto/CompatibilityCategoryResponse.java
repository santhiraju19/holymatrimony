package com.theholymatrimony.backend.compatibility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompatibilityCategoryResponse {

    private String key;

    private String label;

    private String status;

    private Integer weight;
}
