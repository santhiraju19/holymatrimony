package com.theholymatrimony.backend.admin.service;

import com.theholymatrimony.backend.admin.dto.AdminMemberVerificationPageResponse;
import com.theholymatrimony.backend.admin.dto.AdminMemberVerificationResponse;
import com.theholymatrimony.backend.admin.dto.UpdateMemberVerificationRequest;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
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
                .content(content)
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

    private MemberVerification findVerification(
            UUID verificationId
    ) {

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

        return userRepository
                .findByEmail(
                        authentication
                                .getName()
                                .trim()
                                .toLowerCase()
                )
                .orElseThrow(
                        () ->
                                new IllegalStateException(
                                        "Authenticated administrator was not found."
                                )
                );
    }

    private AdminMemberVerificationResponse toResponse(
            MemberVerification verification
    ) {

        User user =
                verification.getUser();

        return AdminMemberVerificationResponse
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
                .build();
    }

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