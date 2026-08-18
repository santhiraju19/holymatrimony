package com.theholymatrimony.backend.verification.church;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChurchVerificationSubmissionRepository
        extends JpaRepository<
                ChurchVerificationSubmission,
                UUID
        > {

    Optional<ChurchVerificationSubmission>
    findByVerificationId(
            UUID verificationId
    );

    Optional<ChurchVerificationSubmission>
    findByUserId(
            UUID userId
    );
}
