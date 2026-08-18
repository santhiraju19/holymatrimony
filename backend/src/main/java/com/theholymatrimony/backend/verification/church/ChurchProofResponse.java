package com.theholymatrimony.backend.verification.church;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChurchProofResponse(
        UUID id,
        UUID verificationId,

        ChurchVerificationMethod verificationMethod,

        String pastorName,
        String churchPhone,
        String churchEmail,

        String membershipId,

        boolean documentAvailable,
        String originalFileName,
        String contentType,
        Long fileSize,

        LocalDateTime submittedAt,
        LocalDateTime updatedAt
) {
}
