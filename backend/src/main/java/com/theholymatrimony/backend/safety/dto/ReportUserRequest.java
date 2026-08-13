
package com.theholymatrimony.backend.safety.dto;

import com.theholymatrimony.backend.safety.enums.ReportReason;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class ReportUserRequest {

    @NotNull(
            message = "Report reason is required"
    )
    private ReportReason reason;

    @Size(
            max = 1000,
            message = "Report details cannot exceed 1000 characters"
    )
    private String details;

    private UUID conversationId;
}