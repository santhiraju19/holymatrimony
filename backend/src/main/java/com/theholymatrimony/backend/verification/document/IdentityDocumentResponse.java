package com.theholymatrimony.backend.verification.document;

import java.time.LocalDateTime;
import java.util.UUID;

public record IdentityDocumentResponse(
        UUID id,
        UUID verificationId,
        IdentityDocumentType documentType,
        String originalFileName,
        String contentType,
        long fileSize,
        LocalDateTime uploadedAt
) {
}