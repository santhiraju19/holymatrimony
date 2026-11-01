package com.theholymatrimony.backend.franchise.dto;

import com.theholymatrimony.backend.franchise.enums.LeadSource;
import com.theholymatrimony.backend.franchise.enums.LeadStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record FranchiseLeadResponse(

        UUID id,

        String fullName,

        String mobile,

        String email,

        LeadSource source,

        LeadStatus status,

        String notes,

        UUID territoryId,

        String territoryName,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}
