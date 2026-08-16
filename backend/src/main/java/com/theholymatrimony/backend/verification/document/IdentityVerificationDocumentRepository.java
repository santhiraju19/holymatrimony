package com.theholymatrimony.backend.verification.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IdentityVerificationDocumentRepository
        extends JpaRepository<
                IdentityVerificationDocument,
                UUID
        > {

    Optional<IdentityVerificationDocument>
    findByVerificationId(
            UUID verificationId
    );

    Optional<IdentityVerificationDocument>
    findByVerificationIdAndUserId(
            UUID verificationId,
            UUID userId
    );

    Optional<IdentityVerificationDocument>
    findByUserId(
            UUID userId
    );

    void deleteAllByUserId(
            UUID userId
    );
}
