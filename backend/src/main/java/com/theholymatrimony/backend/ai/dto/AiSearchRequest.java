package com.theholymatrimony.backend.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiSearchRequest {

    @NotBlank(message = "Search query is required")
    @Size(
        max = 500,
        message = "Search query must not exceed 500 characters"
    )
    private String query;
}
