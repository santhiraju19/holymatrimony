package com.theholymatrimony.backend.franchise.dto;

import com.theholymatrimony.backend.franchise.enums.LeadSource;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateFranchiseLeadRequest(

        @NotBlank
        @Size(max = 150)
        String fullName,

        @NotBlank
        @Size(max = 30)
        String mobile,

        @Email
        @Size(max = 180)
        String email,

        @NotNull
        LeadSource source,

        @Size(max = 5000)
        String notes,

        UUID territoryId
) {
}
