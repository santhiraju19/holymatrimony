package com.theholymatrimony.backend.franchise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Franchise-user request for updating operational territory metadata.
 *
 * Geographic and structural fields are intentionally excluded.
 * The client cannot change:
 * - franchise;
 * - district allocation;
 * - territory code;
 * - territory type;
 * - active status.
 *
 * Territory scope is derived server-side from the authenticated user.
 */
public record UpdateFranchiseTerritoryRequest(

        @NotBlank(
                message = "Territory name is required."
        )
        @Size(
                max = 180,
                message = "Territory name must not exceed 180 characters."
        )
        String name,

        @Size(
                max = 2000,
                message = "Coverage description must not exceed 2000 characters."
        )
        String coverageDescription

) {
}
