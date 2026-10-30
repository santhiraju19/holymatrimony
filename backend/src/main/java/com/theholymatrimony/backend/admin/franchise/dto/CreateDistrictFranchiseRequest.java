package com.theholymatrimony.backend.admin.franchise.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * HQ request for provisioning one District Franchise.
 *
 * The district is selected by its internal geography UUID.
 * State and geographic scope are never accepted independently
 * from the client; they are derived from the selected district.
 *
 * The owner account is provisioned as ROLE_FRANCHISE with
 * FRANCHISE_OWNER membership.
 */
public record CreateDistrictFranchiseRequest(

        @NotBlank(message = "Franchise code is required.")
        @Size(
                max = 40,
                message = "Franchise code must not exceed 40 characters."
        )
        String franchiseCode,

        @NotBlank(message = "Franchise name is required.")
        @Size(
                max = 160,
                message = "Franchise name must not exceed 160 characters."
        )
        String franchiseName,

        @NotNull(message = "District is required.")
        UUID districtId,

        @NotBlank(message = "Owner full name is required.")
        @Size(
                max = 120,
                message = "Owner full name must not exceed 120 characters."
        )
        String ownerFullName,

        @NotBlank(message = "Owner email is required.")
        @Email(message = "Enter a valid owner email address.")
        @Size(
                max = 150,
                message = "Owner email must not exceed 150 characters."
        )
        String ownerEmail,

        @Size(
                max = 20,
                message = "Owner mobile must not exceed 20 characters."
        )
        String ownerMobile

) {
}
