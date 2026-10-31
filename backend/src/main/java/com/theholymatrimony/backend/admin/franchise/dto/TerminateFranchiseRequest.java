package com.theholymatrimony.backend.admin.franchise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Dedicated HQ request for permanent District Franchise closure.
 *
 * Termination is intentionally separate from the generic operational
 * lifecycle-status endpoint because closure releases geographic scope
 * and deactivates franchise operational access.
 */
public record TerminateFranchiseRequest(

        @NotBlank
        @Size(max = 500)
        String reason

) {
}
