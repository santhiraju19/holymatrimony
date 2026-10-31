package com.theholymatrimony.backend.franchise.dto;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Franchise-facing member representation.
 *
 * Members returned by the franchise API are already restricted to the
 * authenticated franchise user's active canonical district scope.
 *
 * Internal authorization identifiers such as franchise ID, allocation ID,
 * and canonical district ID are intentionally not exposed.
 */
public record FranchiseMemberResponse(
        UUID profileId,
        String memberId,
        String fullName,
        String email,
        LocalDate dateOfBirth,
        String gender,
        String denomination,
        String churchName,
        String city,
        String district,
        String state,
        String country,
        Boolean profileCompleted,
        Boolean profileLive
) {
}
