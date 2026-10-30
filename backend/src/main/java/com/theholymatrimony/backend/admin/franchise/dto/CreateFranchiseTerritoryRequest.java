package com.theholymatrimony.backend.admin.franchise.dto;

import com.theholymatrimony.backend.franchise.enums.FranchiseTerritoryType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * HQ request for creating a territory under a District Franchise.
 *
 * Franchise, district allocation, district, and state scope are never
 * accepted from the client in this request. They are derived from the
 * franchise identified by the HQ route.
 */
public record CreateFranchiseTerritoryRequest(

        @NotBlank(message = "Territory code is required.")
        @Size(
                max = 60,
                message = "Territory code must not exceed 60 characters."
        )
        String territoryCode,

        @NotBlank(message = "Territory name is required.")
        @Size(
                max = 180,
                message = "Territory name must not exceed 180 characters."
        )
        String name,

        @NotNull(message = "Territory type is required.")
        FranchiseTerritoryType territoryType,

        String coverageDescription

) {
}
