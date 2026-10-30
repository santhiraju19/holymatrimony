package com.theholymatrimony.backend.admin.franchise.dto;

import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * HQ request for changing the operational lifecycle status of a franchise.
 *
 * The service owns the transition rules. Supplying a valid enum value does not
 * by itself make a transition valid.
 */
public record UpdateFranchiseStatusRequest(

        @NotNull
        FranchiseStatus status,

        @Size(max = 500)
        String reason

) {
}
