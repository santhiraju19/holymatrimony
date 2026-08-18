package com.theholymatrimony.backend.admin.service;

import com.theholymatrimony.backend.admin.dto.AdminMemberVerificationPageResponse;
import com.theholymatrimony.backend.admin.dto.AdminMemberVerificationResponse;
import com.theholymatrimony.backend.admin.dto.UpdateMemberVerificationRequest;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.verification.church.ChurchVerificationSubmission;
import com.theholymatrimony.backend.verification.church.ChurchVerificationSubmissionRepository;
import com.theholymatrimony.backend.verification.document.IdentityVerificationDocument;
import com.theholymatrimony.backend.verification.document.IdentityVerificationDocumentRepository;
import com.theholymatrimony.backend.verification.entity.MemberVerification;
import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;
import com.theholymatrimony.backend.verification.repository.MemberVerificationRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMemberVerificationServiceImpl
        implements AdminMemberVerificationService {

    private static final int DEFAULT_PAGE_SIZE = 20;

    private static final int MAX_PAGE_SIZE = 100;

    private final MemberVerificationRepository
            memberVerificationRepository;

    private final UserRepository
            userRepository;

    private final IdentityVerificationDocumentRepository
            identityVerificationDocumentRepository;

    private final ChurchVerificationSubmissionRepository
            churchVerificationSubmissionRepository;

    /*
     * ============================================================
     * LIST VERIFICATIONS
     * ============================================================
     */

    @Override
    public AdminMemberVerificationPageResponse getVerifications(
            int page,
            int size,
            String search,
            VerificationStatus status,
            VerificationType type
    ) {

        int safePage =
                Math.max(
                        page,
                        0
                );

        int safeSize =
                normalizePageSize(
                        size
                );

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "submittedAt"
                        ).and(
                                Sort.by(
                                        Sort.Direction.DESC,
                                        "createdAt"
                                )
                        )
                );

        Page<MemberVerification> result =
                memberVerificationRepository
                        .searchAdminVerifications(
                                normalizeSearch(
                                        search
                                ),
                                status,
                                type,
                                pageable
                        );

        List<AdminMemberVerificationResponse> content =
                result
                        .getContent()
                        .stream()
                        .map(
                                this::toResponse
                        )
                        .toList();

        return AdminMemberVerificationPageResponse
                .builder()
                .content(
                        content
                )
                .page(
                        result.getNumber()
                )
                .size(
                        result.getSize()
                )
                .totalElements(
                        result.getTotalElements()
                )
                .totalPages(
                        result.getTotalPages()
                )
                .first(
                        result.isFirst()
                )
                .last(
                        result.isLast()
                )
                .build();
    }

    /*
     * ============================================================
     * GET VERIFICATION
     * ============================================================
     */

    @Override
    public AdminMemberVerificationResponse getVerification(
            UUID verificationId
    ) {

        return toResponse(
                findVerification(
                        verificationId
                )
        );
    }

    /*
     * ============================================================
     * REVIEW VERIFICATION
     * ============================================================
     */

    @Override
    @Transactional
    public AdminMemberVerificationResponse updateVerification(
            UUID verificationId,
            UpdateMemberVerificationRequest request
    ) {

        MemberVerification verification =
                findVerification(
                        verificationId
                );

        /*
         * Mobile verification is automatic
         * through the OTP workflow.
         */
        if (
                verification.getVerificationType() ==
                        VerificationType.MOBILE
        ) {

            throw new IllegalStateException(
                    "Mobile verification cannot be reviewed manually."
            );
        }

        if (
                verification.getVerificationStatus() !=
                        VerificationStatus.PENDING
        ) {

            throw new IllegalStateException(
                    "Only pending verification requests can be reviewed."
            );
        }

        if (request == null) {

            throw new IllegalArgumentException(
                    "Verification review request is required."
            );
        }

        VerificationStatus requestedStatus =
                request.getStatus();

        if (
                requestedStatus !=
                        VerificationStatus.APPROVED
                        &&
                requestedStatus !=
                        VerificationStatus.REJECTED
        ) {

            throw new IllegalArgumentException(
                    "Verification status must be APPROVED or REJECTED."
            );
        }

        if (
                requestedStatus ==
                        VerificationStatus.REJECTED
                        &&
                (
                        request.getReason() == null
                                ||
                        request.getReason()
                                .isBlank()
                )
        ) {

            throw new IllegalArgumentException(
                    "A rejection reason is required."
            );
        }

        /*
         * ========================================================
         * Identity Approval Protection
         * ========================================================
         *
         * Identity verification cannot be approved unless
         * its securely uploaded identity document exists.
         */

        if (
                verification.getVerificationType() ==
                        VerificationType.IDENTITY
                        &&
                requestedStatus ==
                        VerificationStatus.APPROVED
                        &&
                identityVerificationDocumentRepository
                        .findByVerificationId(
                                verification.getId()
                        )
                        .isEmpty()
        ) {

            throw new IllegalStateException(
                    "Identity verification cannot be approved without an identity document."
            );
        }

        /*
         * ========================================================
         * Church Approval Protection
         * ========================================================
         *
         * Church verification cannot be approved unless
         * a method-based Church submission exists.
         */

        if (
                verification.getVerificationType() ==
                        VerificationType.CHURCH
                        &&
                requestedStatus ==
                        VerificationStatus.APPROVED
                        &&
                churchVerificationSubmissionRepository
                        .findByVerificationId(
                                verification.getId()
                        )
                        .isEmpty()
        ) {

            throw new IllegalStateException(
                    "Church verification cannot be approved without a church verification submission."
            );
        }

        User currentAdmin =
                getCurrentAdmin();

        if (
                requestedStatus ==
                        VerificationStatus.APPROVED
        ) {

            verification.approve(
                    currentAdmin.getId(),
                    request.getReason()
            );

        } else {

            verification.reject(
                    currentAdmin.getId(),
                    request.getReason()
            );
        }

        MemberVerification saved =
                memberVerificationRepository
                        .save(
                                verification
                        );

        return toResponse(
                saved
        );
    }

    /*
     * ============================================================
     * FIND VERIFICATION
     * ============================================================
     */

    private MemberVerification findVerification(
            UUID verificationId
    ) {

        if (verificationId == null) {

            throw new IllegalArgumentException(
                    "Verification ID is required."
            );
        }

        return memberVerificationRepository
                .findById(
                        verificationId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Verification request not found: " +
                                                verificationId
                                )
                );
    }

    /*
     * ============================================================
     * CURRENT ADMIN
     * ============================================================
     */

    private User getCurrentAdmin() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null
                        ||
                !authentication.isAuthenticated()
                        ||
                authentication.getName() == null
                        ||
                authentication.getName()
                        .isBlank()
        ) {

            throw new IllegalStateException(
                    "Authenticated administrator is required."
            );
        }

        String normalizedEmail =
                authentication
                        .getName()
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        return userRepository
                .findByEmail(
                        normalizedEmail
                )
                .orElseThrow(
                        () ->
                                new IllegalStateException(
                                        "Authenticated administrator was not found."
                                )
                );
    }

    /*
     * ============================================================
     * RESPONSE MAPPING
     * ============================================================
     */

    private AdminMemberVerificationResponse toResponse(
            MemberVerification verification
    ) {

        User user =
                verification.getUser();

        IdentityVerificationDocument
                identityDocument =
                null;

        ChurchVerificationSubmission
                churchSubmission =
                null;

        /*
         * Load identity-specific metadata only for
         * IDENTITY verification requests.
         */
        if (
                verification.getVerificationType() ==
                        VerificationType.IDENTITY
        ) {

            identityDocument =
                    identityVerificationDocumentRepository
                            .findByVerificationId(
                                    verification.getId()
                            )
                            .orElse(null);
        }

        /*
         * Load Church-specific metadata only for
         * CHURCH verification requests.
         */
        if (
                verification.getVerificationType() ==
                        VerificationType.CHURCH
        ) {

            churchSubmission =
                    churchVerificationSubmissionRepository
                            .findByVerificationId(
                                    verification.getId()
                            )
                            .orElse(null);
        }

        AdminMemberVerificationResponse
                .AdminMemberVerificationResponseBuilder
                builder =
                AdminMemberVerificationResponse
                        .builder()
                        .id(
                                verification.getId()
                        )
                        .userId(
                                user.getId()
                        )
                        .fullName(
                                user.getFullName()
                        )
                        .email(
                                user.getEmail()
                        )
                        .verificationType(
                                verification.getVerificationType()
                        )
                        .verificationStatus(
                                verification.getVerificationStatus()
                        )
                        .memberNote(
                                verification.getMemberNote()
                        )
                        .submittedAt(
                                verification.getSubmittedAt()
                        )
                        .reviewedAt(
                                verification.getReviewedAt()
                        )
                        .reviewedBy(
                                verification.getReviewedBy()
                        )
                        .reviewReason(
                                verification.getReviewReason()
                        )
                        .createdAt(
                                verification.getCreatedAt()
                        )
                        .updatedAt(
                                verification.getUpdatedAt()
                        )
                        .hasIdentityDocument(
                                identityDocument != null
                        )
                        .hasChurchSubmission(
                                churchSubmission != null
                        );

        /*
         * ========================================================
         * Identity Metadata
         * ========================================================
         */

        if (identityDocument != null) {

            builder
                    .identityDocumentType(
                            identityDocument
                                    .getDocumentType()
                    )
                    .identityDocumentFileName(
                            identityDocument
                                    .getOriginalFileName()
                    )
                    .identityDocumentContentType(
                            identityDocument
                                    .getContentType()
                    )
                    .identityDocumentFileSize(
                            identityDocument
                                    .getFileSize()
                    );
        }

        /*
         * ========================================================
         * Church Metadata
         * ========================================================
         */

        if (churchSubmission != null) {

            boolean hasChurchDocument =
                    churchSubmission
                            .getStoredFileName() != null
                            &&
                    !churchSubmission
                            .getStoredFileName()
                            .isBlank();

            builder
                    .churchVerificationMethod(
                            churchSubmission
                                    .getVerificationMethod()
                    )
                    .churchPastorName(
                            churchSubmission
                                    .getPastorName()
                    )
                    .churchPhone(
                            churchSubmission
                                    .getChurchPhone()
                    )
                    .churchEmail(
                            churchSubmission
                                    .getChurchEmail()
                    )
                    .churchMembershipId(
                            churchSubmission
                                    .getMembershipId()
                    )
                    .hasChurchDocument(
                            hasChurchDocument
                    )
                    .churchDocumentFileName(
                            churchSubmission
                                    .getOriginalFileName()
                    )
                    .churchDocumentContentType(
                            churchSubmission
                                    .getContentType()
                    )
                    .churchDocumentFileSize(
                            churchSubmission
                                    .getFileSize()
                    );
        }

        return builder.build();
    }

    /*
     * ============================================================
     * PAGE SIZE
     * ============================================================
     */

    private int normalizePageSize(
            int size
    ) {

        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }

        return Math.min(
                size,
                MAX_PAGE_SIZE
        );
    }

    /*
     * ============================================================
     * SEARCH NORMALIZATION
     * ============================================================
     */

    private String normalizeSearch(
            String search
    ) {

        if (
                search == null
                        ||
                search.isBlank()
        ) {

            return null;
        }

        return search.trim();
    }
}
