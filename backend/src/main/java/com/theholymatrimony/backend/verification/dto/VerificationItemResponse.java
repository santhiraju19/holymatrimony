package com.theholymatrimony.backend.verification.dto;

import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;

import java.time.LocalDateTime;

public record VerificationItemResponse(

        VerificationType type,

        VerificationStatus status,

        LocalDateTime submittedAt,

        LocalDateTime reviewedAt,

        String reviewReason,

        String memberNote
) {
}
