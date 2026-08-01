
package com.theholymatrimony.backend.interest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SendInterestRequest {

    @NotNull(message = "Receiver profile ID is required")
    private UUID receiverProfileId;

    @Size(
            max = 500,
            message = "Interest message must not exceed 500 characters"
    )
    private String message;
}