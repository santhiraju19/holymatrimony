package com.theholymatrimony.backend.verification.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.verification.dto.SubmitVerificationRequest;
import com.theholymatrimony.backend.verification.dto.TrustVerificationResponse;
import com.theholymatrimony.backend.verification.dto.VerificationItemResponse;
import com.theholymatrimony.backend.verification.entity.MemberVerification;
import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;
import com.theholymatrimony.backend.verification.repository.MemberVerificationRepository;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MemberVerificationService {

    private static final int TOTAL_CHECKS = 4;

    private final UserRepository
            userRepository;

    private final ProfileRepository
            profileRepository;

    private final MemberVerificationRepository
            memberVerificationRepository;

    /*
     * ============================================================
     * VERIFICATION CENTER
     * ============================================================
     */

    @Transactional(readOnly = true)
    public TrustVerificationResponse getVerificationCenter(
            String email
    ) {

        User user =
                findUser(
                        email
                );

        Profile profile =
                profileRepository
                        .findByUser(
                                user
                        )
                        .orElse(
                                null
                        );

        List<MemberVerification> records =
                memberVerificationRepository
                        .findAllByUserId(
                                user.getId()
                        );

        Map<
                VerificationType,
                MemberVerification
                >
                verificationMap =
                new EnumMap<>(
                        VerificationType.class
                );

        for (
                MemberVerification record :
                records
        ) {

            verificationMap.put(
                    record.getVerificationType(),
                    record
            );
        }

        List<VerificationItemResponse> items =
                new ArrayList<>();

        for (
                VerificationType type :
                VerificationType.values()
        ) {

            MemberVerification record =
                    verificationMap.get(
                            type
                    );

            items.add(
                    mapItem(
                            type,
                            record
                    )
            );
        }

        boolean emailVerified =
                user
                        .isEmailVerificationComplete();

        ProfileVerificationStatus
                profileVerificationStatus =
                profile == null ||
                profile.getVerificationStatus() == null
                        ? ProfileVerificationStatus.NOT_SUBMITTED
                        : profile.getVerificationStatus();

        int completedChecks = 0;

        if (emailVerified) {
            completedChecks++;
        }

        for (
                MemberVerification record :
                records
        ) {

            if (
                    record.getVerificationStatus() ==
                            VerificationStatus.APPROVED
            ) {

                completedChecks++;
            }
        }

        int trustScore =
                Math.min(
                        100,
                        Math.round(
                                (
                                        completedChecks *
                                                100.0f
                                )
                                        /
                                        TOTAL_CHECKS
                        )
                );

        return new TrustVerificationResponse(
                user.getId(),
                emailVerified,
                user.getEmailVerifiedAt(),
                profileVerificationStatus,
                trustScore,
                completedChecks,
                TOTAL_CHECKS,
                items
        );
    }

    /*
     * ============================================================
     * MANUAL VERIFICATION SUBMISSION
     * ============================================================
     *
     * Only verification methods that use the generic manual
     * workflow should pass through this method.
     *
     * MOBILE uses OTP verification.
     *
     * IDENTITY uses secure document upload.
     *
     * CHURCH currently uses this manual submission flow.
     * ============================================================
     */

    @Transactional
    public TrustVerificationResponse submitVerification(
            String email,
            VerificationType type,
            SubmitVerificationRequest request
    ) {

        User user =
                findUser(
                        email
                );

        if (type == null) {

            throw new IllegalArgumentException(
                    "Verification type is required."
            );
        }

        /*
         * Mobile verification is completed using
         * the OTP workflow.
         */
        if (
                type ==
                        VerificationType.MOBILE
        ) {

            throw new IllegalStateException(
                    "Mobile verification is available through OTP verification."
            );
        }

        /*
         * Identity verification must include a
         * securely uploaded identity document.
         *
         * The secure document workflow itself
         * moves the IDENTITY verification record
         * into PENDING state.
         */
        if (
                type ==
                        VerificationType.IDENTITY
        ) {

            throw new IllegalStateException(
                    "Identity verification must be submitted with a secure identity document."
            );
        }

        /*
         * Church verification requires the
         * church-related profile information
         * to be completed first.
         */
        if (
                type ==
                        VerificationType.CHURCH
        ) {

            validateChurchVerification(
                    user
            );
        }

        MemberVerification verification =
                memberVerificationRepository
                        .findByUserIdAndVerificationType(
                                user.getId(),
                                type
                        )
                        .orElseGet(
                                () ->
                                        MemberVerification
                                                .builder()
                                                .user(
                                                        user
                                                )
                                                .verificationType(
                                                        type
                                                )
                                                .verificationStatus(
                                                        VerificationStatus.NOT_SUBMITTED
                                                )
                                                .build()
                        );

        VerificationStatus currentStatus =
                verification
                        .getVerificationStatus();

        if (
                currentStatus ==
                        VerificationStatus.PENDING
        ) {

            throw new IllegalStateException(
                    "This verification request is already under review."
            );
        }

        if (
                currentStatus ==
                        VerificationStatus.APPROVED
        ) {

            throw new IllegalStateException(
                    "This verification has already been approved."
            );
        }

        verification.submit(
                request == null
                        ? null
                        : request.note()
        );

        memberVerificationRepository.save(
                verification
        );

        return getVerificationCenter(
                email
        );
    }

    /*
     * ============================================================
     * CHURCH VERIFICATION VALIDATION
     * ============================================================
     */

    private void validateChurchVerification(
            User user
    ) {

        Profile profile =
                profileRepository
                        .findByUser(
                                user
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "Complete your profile before requesting church verification."
                                        )
                        );

        if (
                isBlank(
                        profile.getChurchName()
                ) ||
                isBlank(
                        profile.getDenomination()
                ) ||
                isBlank(
                        profile.getChurchAddress()
                )
        ) {

            throw new IllegalStateException(
                    "Complete your church name, denomination and church location before requesting church verification."
            );
        }
    }

    /*
     * ============================================================
     * MAP VERIFICATION ITEM
     * ============================================================
     */

    private VerificationItemResponse mapItem(
            VerificationType type,
            MemberVerification verification
    ) {

        if (verification == null) {

            return new VerificationItemResponse(
                    type,
                    VerificationStatus.NOT_SUBMITTED,
                    null,
                    null,
                    null,
                    null
            );
        }

        return new VerificationItemResponse(
                type,
                verification.getVerificationStatus(),
                verification.getSubmittedAt(),
                verification.getReviewedAt(),
                verification.getReviewReason(),
                verification.getMemberNote()
        );
    }

    /*
     * ============================================================
     * USER LOOKUP
     * ============================================================
     */

    private User findUser(
            String email
    ) {

        if (
                email == null ||
                email.isBlank()
        ) {

            throw new EntityNotFoundException(
                    "Authenticated user was not found."
            );
        }

        String normalizedEmail =
                email
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
                                new EntityNotFoundException(
                                        "Authenticated user was not found."
                                )
                );
    }

    /*
     * ============================================================
     * STRING UTILITY
     * ============================================================
     */

    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.isBlank();
    }
}