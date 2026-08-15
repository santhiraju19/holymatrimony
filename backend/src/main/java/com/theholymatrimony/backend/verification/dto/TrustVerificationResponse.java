package com.theholymatrimony.backend.verification.dto;

import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record TrustVerificationResponse(

        UUID userId,

        boolean emailVerified,

        LocalDateTime emailVerifiedAt,

        ProfileVerificationStatus profileVerificationStatus,

        int trustScore,

        int completedChecks,

        int totalChecks,

        List<VerificationItemResponse> verifications
) {
}
