package com.theholymatrimony.backend.admin.franchise.dto;

import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * HQ lifecycle response for a District Franchise.
 */
public record AdminFranchiseStatusResponse(

        UUID franchiseId,
        String franchiseCode,
        String franchiseName,
        FranchiseStatus status,

        LocalDateTime activatedAt,
        LocalDateTime suspendedAt,
        LocalDateTime terminatedAt,
        LocalDateTime updatedAt

) {
}
