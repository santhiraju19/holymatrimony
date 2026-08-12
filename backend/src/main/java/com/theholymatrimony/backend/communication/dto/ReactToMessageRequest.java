package com.theholymatrimony.backend.communication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReactToMessageRequest(

        @NotBlank(
                message =
                        "Reaction is required"
        )
        @Size(
                max = 20,
                message =
                        "Reaction must not exceed 20 characters"
        )
        String reaction

) {
}