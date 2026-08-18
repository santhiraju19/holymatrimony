package com.theholymatrimony.backend.verification.church;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.verification.entity.MemberVerification;
import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;
import com.theholymatrimony.backend.verification.repository.MemberVerificationRepository;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChurchProofService {

    private final UserRepository
            userRepository;

    private final ProfileRepository
            profileRepository;

    private final MemberVerificationRepository
            memberVerificationRepository;

    private final ChurchVerificationSubmissionRepository
            submissionRepository;

    private final ChurchProofStorageService
            storageService;

    /*
     * ============================================================
     * SUBMIT CHURCH VERIFICATION
     * ============================================================
     */

    @Transactional
    public ChurchVerificationSubmission submitChurchVerification(
            String email,
            ChurchVerificationMethod method,
            String pastorName,
            String churchPhone,
            String churchEmail,
            String membershipId,
            MultipartFile file,
            String note
    ) {

        if (method == null) {

            throw new IllegalArgumentException(
                    "Church verification method is required."
            );
        }

        User user =
                findUser(
                        email
                );

        validateChurchProfile(
                user
        );

        String normalizedPastorName =
                normalize(
                        pastorName
                );

        String normalizedChurchPhone =
                normalize(
                        churchPhone
                );

        String normalizedChurchEmail =
                normalizeEmail(
                        churchEmail
                );

        String normalizedMembershipId =
                normalize(
                        membershipId
                );

        validateMethod(
                method,
                normalizedChurchPhone,
                normalizedChurchEmail,
                normalizedMembershipId,
                file
        );

        MemberVerification verification =
                memberVerificationRepository
                        .findByUserIdAndVerificationType(
                                user.getId(),
                                VerificationType.CHURCH
                        )
                        .orElseGet(
                                () ->
                                        MemberVerification
                                                .builder()
                                                .user(
                                                        user
                                                )
                                                .verificationType(
                                                        VerificationType.CHURCH
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
                    "Your church verification is already under review."
            );
        }

        if (
                currentStatus ==
                        VerificationStatus.APPROVED
        ) {

            throw new IllegalStateException(
                    "Your church verification has already been approved."
            );
        }

        /*
         * A document is mandatory for DOCUMENT.
         *
         * MEMBERSHIP_ID may optionally include a document.
         *
         * PASTOR_CONTACT does not require a document.
         */
        ChurchProofStorageService.StoredChurchProof
                storedProof = null;

        if (
                file != null &&
                !file.isEmpty()
        ) {

            storedProof =
                    storageService.store(
                            file
                    );
        }

        String newlyStoredFileName =
                storedProof == null
                        ? null
                        : storedProof.storedFileName();

        String previousStoredFileName = null;

        try {

            MemberVerification savedVerification =
                    memberVerificationRepository.save(
                            verification
                    );

            ChurchVerificationSubmission submission =
                    submissionRepository
                            .findByVerificationId(
                                    savedVerification.getId()
                            )
                            .orElseGet(
                                    () ->
                                            ChurchVerificationSubmission
                                                    .builder()
                                                    .verification(
                                                            savedVerification
                                                    )
                                                    .user(
                                                            user
                                                    )
                                                    .build()
                            );

            previousStoredFileName =
                    submission
                            .getStoredFileName();

            submission.setVerificationMethod(
                    method
            );

            submission.setPastorName(
                    normalizedPastorName
            );

            submission.setChurchPhone(
                    normalizedChurchPhone
            );

            submission.setChurchEmail(
                    normalizedChurchEmail
            );

            submission.setMembershipId(
                    normalizedMembershipId
            );

            /*
             * If a new document was supplied, replace the existing
             * document metadata.
             *
             * If the new method does not use a document, clear any
             * document left from a previously rejected submission.
             */
            if (storedProof != null) {

                submission.setOriginalFileName(
                        storedProof.originalFileName()
                );

                submission.setStoredFileName(
                        storedProof.storedFileName()
                );

                submission.setContentType(
                        storedProof.contentType()
                );

                submission.setFileSize(
                        storedProof.fileSize()
                );

            } else if (
                    method ==
                            ChurchVerificationMethod.PASTOR_CONTACT
            ) {

                submission.setOriginalFileName(
                        null
                );

                submission.setStoredFileName(
                        null
                );

                submission.setContentType(
                        null
                );

                submission.setFileSize(
                        null
                );

            } else if (
                    method ==
                            ChurchVerificationMethod.MEMBERSHIP_ID
            ) {

                /*
                 * Membership ID does not require a document.
                 *
                 * A resubmission without a new file intentionally
                 * removes a previous proof document so the current
                 * submission accurately represents its chosen method.
                 */
                submission.setOriginalFileName(
                        null
                );

                submission.setStoredFileName(
                        null
                );

                submission.setContentType(
                        null
                );

                submission.setFileSize(
                        null
                );
            }

            ChurchVerificationSubmission savedSubmission =
                    submissionRepository.save(
                            submission
                    );

            savedVerification.submit(
                    note
            );

            memberVerificationRepository.save(
                    savedVerification
            );

            /*
             * Remove the superseded physical file only after the
             * database updates have succeeded.
             */
            if (
                    previousStoredFileName != null &&
                    !previousStoredFileName.equals(
                            newlyStoredFileName
                    )
            ) {

                storageService.delete(
                        previousStoredFileName
                );
            }

            return savedSubmission;

        } catch (RuntimeException exception) {

            /*
             * The database transaction will roll back, but filesystem
             * writes are not transactional. Remove a newly stored file.
             */
            if (newlyStoredFileName != null) {

                storageService.delete(
                        newlyStoredFileName
                );
            }

            throw exception;
        }
    }

    /*
     * ============================================================
     * MEMBER SUBMISSION
     * ============================================================
     */

    @Transactional(readOnly = true)
    public ChurchVerificationSubmission getMemberSubmission(
            String email
    ) {

        User user =
                findUser(
                        email
                );

        return submissionRepository
                .findByUserId(
                        user.getId()
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Church verification submission was not found."
                                )
                );
    }

    /*
     * ============================================================
     * ADMIN SUBMISSION
     * ============================================================
     */

    @Transactional(readOnly = true)
    public ChurchVerificationSubmission getAdminSubmission(
            UUID verificationId
    ) {

        if (verificationId == null) {

            throw new IllegalArgumentException(
                    "Verification ID is required."
            );
        }

        return submissionRepository
                .findByVerificationId(
                        verificationId
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Church verification submission was not found."
                                )
                );
    }

    /*
     * ============================================================
     * ADMIN DOCUMENT DOWNLOAD
     * ============================================================
     */

    @Transactional(readOnly = true)
    public DownloadedChurchProof loadAdminProof(
            UUID verificationId
    ) {

        ChurchVerificationSubmission submission =
                getAdminSubmission(
                        verificationId
                );

        if (
                !StringUtils.hasText(
                        submission.getStoredFileName()
                )
        ) {

            throw new EntityNotFoundException(
                    "This church verification submission does not include a document."
            );
        }

        ChurchProofStorageService.StoredFile
                storedFile =
                storageService.load(
                        submission.getStoredFileName()
                );

        Path path =
                storedFile.getPath();

        Resource resource =
                new FileSystemResource(
                        path
                );

        return new DownloadedChurchProof(
                resource,
                submission.getOriginalFileName(),
                submission.getContentType(),
                submission.getFileSize()
        );
    }

    /*
     * ============================================================
     * ACCOUNT DELETION CLEANUP
     * ============================================================
     */

    @Transactional
    public void deleteAllForUser(
            UUID userId
    ) {

        if (userId == null) {
            return;
        }

        submissionRepository
                .findByUserId(
                        userId
                )
                .ifPresent(
                        submission -> {

                            String storedFileName =
                                    submission
                                            .getStoredFileName();

                            submissionRepository.delete(
                                    submission
                            );

                            submissionRepository.flush();

                            if (
                                    StringUtils.hasText(
                                            storedFileName
                                    )
                            ) {

                                storageService.delete(
                                        storedFileName
                                );
                            }
                        }
                );
    }

    /*
     * ============================================================
     * CHURCH PROFILE VALIDATION
     * ============================================================
     */

    private void validateChurchProfile(
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
                !StringUtils.hasText(
                        profile.getChurchName()
                ) ||
                !StringUtils.hasText(
                        profile.getDenomination()
                ) ||
                !StringUtils.hasText(
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
     * METHOD VALIDATION
     * ============================================================
     */

    private void validateMethod(
            ChurchVerificationMethod method,
            String churchPhone,
            String churchEmail,
            String membershipId,
            MultipartFile file
    ) {

        switch (method) {

            case DOCUMENT -> {

                if (
                        file == null ||
                        file.isEmpty()
                ) {

                    throw new IllegalArgumentException(
                            "Upload a church-issued document for document verification."
                    );
                }
            }

            case PASTOR_CONTACT -> {

                if (
                        !StringUtils.hasText(
                                churchPhone
                        ) &&
                        !StringUtils.hasText(
                                churchEmail
                        )
                ) {

                    throw new IllegalArgumentException(
                            "Provide a church phone number or church email for pastor/contact verification."
                    );
                }

                if (
                        file != null &&
                        !file.isEmpty()
                ) {

                    throw new IllegalArgumentException(
                            "A document is not required for pastor/contact verification."
                    );
                }
            }

            case MEMBERSHIP_ID -> {

                if (
                        !StringUtils.hasText(
                                membershipId
                        )
                ) {

                    throw new IllegalArgumentException(
                            "Membership ID or membership number is required for this verification method."
                    );
                }
            }

            default ->
                    throw new IllegalArgumentException(
                            "Unsupported church verification method."
                    );
        }
    }

    /*
     * ============================================================
     * AUTHENTICATED USER
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
                email.trim()
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

    private String normalize(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String normalized =
                value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }

    private String normalizeEmail(
            String value
    ) {

        String normalized =
                normalize(
                        value
                );

        if (normalized == null) {
            return null;
        }

        return normalized.toLowerCase(
                Locale.ROOT
        );
    }

    public record DownloadedChurchProof(
            Resource resource,
            String originalFileName,
            String contentType,
            long fileSize
    ) {
    }
}
