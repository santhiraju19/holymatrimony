package com.theholymatrimony.backend.verification.repository;

import com.theholymatrimony.backend.verification.entity.MemberVerification;
import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberVerificationRepository
        extends JpaRepository<MemberVerification, UUID> {

    Optional<MemberVerification>
    findByUserIdAndVerificationType(
            UUID userId,
            VerificationType verificationType
    );

    List<MemberVerification>
    findAllByUserId(
            UUID userId
    );

    List<MemberVerification>
    findAllByVerificationTypeAndVerificationStatus(
            VerificationType verificationType,
            VerificationStatus verificationStatus
    );

    boolean existsByUserIdAndVerificationTypeAndVerificationStatus(
            UUID userId,
            VerificationType verificationType,
            VerificationStatus verificationStatus
    );

    @Query("""
            SELECT mv
            FROM MemberVerification mv
            JOIN FETCH mv.user u
            WHERE
                (:status IS NULL OR mv.verificationStatus = :status)
                AND
                (:type IS NULL OR mv.verificationType = :type)
                AND
                (
                    :search IS NULL
                    OR :search = ''
                    OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """)
    Page<MemberVerification> searchAdminVerifications(
            @Param("search")
            String search,

            @Param("status")
            VerificationStatus status,

            @Param("type")
            VerificationType type,

            Pageable pageable
    );
}