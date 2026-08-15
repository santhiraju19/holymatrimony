package com.theholymatrimony.backend.admin.dto;

import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class AdminMemberVerificationResponse {

    private UUID id;

    private UUID userId;

    private String fullName;

    private String email;

    private VerificationType verificationType;

    private VerificationStatus verificationStatus;

    private String memberNote;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    private UUID reviewedBy;

    private String reviewReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
