package com.theholymatrimony.backend.verification.document;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
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
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IdentityDocumentService {

    private final UserRepository
            userRepository;

    private final MemberVerificationRepository
            memberVerificationRepository;

    private final IdentityVerificationDocumentRepository
            documentRepository;

    private final IdentityDocumentStorageService
            storageService;

    @Transactional
    public IdentityVerificationDocument uploadIdentityDocument(
            String email,
            IdentityDocumentType documentType,
            MultipartFile file,
            String note
    ) {

        if (documentType == null) {
            throw new IllegalArgumentException(
                    "Identity document type is required."
            );
        }

        User user =
                findUser(
                        email
                );

        MemberVerification verification =
                memberVerificationRepository
                        .findByUserIdAndVerificationType(
                                user.getId(),
                                VerificationType.IDENTITY
                        )
                        .orElseGet(
                                () ->
                                        MemberVerification
                                                .builder()
                                                .user(user)
                                                .verificationType(
                                                        VerificationType.IDENTITY
                                                )
                                                .verificationStatus(
                                                        VerificationStatus.NOT_SUBMITTED
                                                )
                                                .build()
                        );

        VerificationStatus currentStatus =
                verification.getVerificationStatus();

        if (
                currentStatus ==
                        VerificationStatus.PENDING
        ) {
            throw new IllegalStateException(
                    "Your identity verification is already under review."
            );
        }

        if (
                currentStatus ==
                        VerificationStatus.APPROVED
        ) {
            throw new IllegalStateException(
                    "Your identity verification has already been approved."
            );
        }

        IdentityDocumentStorageService.StoredIdentityDocument
                storedDocument =
                storageService.store(
                        file
                );

        String previousStoredFileName = null;

        try {

            MemberVerification savedVerification =
                    memberVerificationRepository.save(
                            verification
                    );

            IdentityVerificationDocument existingDocument =
                    documentRepository
                            .findByVerificationId(
                                    savedVerification.getId()
                            )
                            .orElse(null);

            if (existingDocument != null) {

                previousStoredFileName =
                        existingDocument
                                .getStoredFileName();

                existingDocument.setDocumentType(
                        documentType
                );

                existingDocument.setOriginalFileName(
                        storedDocument
                                .originalFileName()
                );

                existingDocument.setStoredFileName(
                        storedDocument
                                .storedFileName()
                );

                existingDocument.setContentType(
                        storedDocument
                                .contentType()
                );

                existingDocument.setFileSize(
                        storedDocument
                                .fileSize()
                );

                documentRepository.save(
                        existingDocument
                );

            } else {

                IdentityVerificationDocument document =
                        IdentityVerificationDocument
                                .builder()
                                .verification(
                                        savedVerification
                                )
                                .user(
                                        user
                                )
                                .documentType(
                                        documentType
                                )
                                .originalFileName(
                                        storedDocument
                                                .originalFileName()
                                )
                                .storedFileName(
                                        storedDocument
                                                .storedFileName()
                                )
                                .contentType(
                                        storedDocument
                                                .contentType()
                                )
                                .fileSize(
                                        storedDocument
                                                .fileSize()
                                )
                                .build();

                documentRepository.save(
                        document
                );
            }

            savedVerification.submit(
                    note
            );

            memberVerificationRepository.save(
                    savedVerification
            );

            if (
                    previousStoredFileName != null &&
                    !previousStoredFileName.equals(
                            storedDocument
                                    .storedFileName()
                    )
            ) {

                storageService.delete(
                        previousStoredFileName
                );
            }

            return documentRepository
                    .findByVerificationId(
                            savedVerification.getId()
                    )
                    .orElseThrow();

        } catch (RuntimeException exception) {

            storageService.delete(
                    storedDocument
                            .storedFileName()
            );

            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public IdentityVerificationDocument getMemberDocument(
            String email
    ) {

        User user =
                findUser(
                        email
                );

        return documentRepository
                .findByUserId(
                        user.getId()
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Identity verification document was not found."
                                )
                );
    }

    @Transactional(readOnly = true)
    public IdentityVerificationDocument getAdminDocumentMetadata(
            UUID verificationId
    ) {

        if (verificationId == null) {
            throw new IllegalArgumentException(
                    "Verification ID is required."
            );
        }

        return documentRepository
                .findByVerificationId(
                        verificationId
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Identity verification document was not found."
                                )
                );
    }

    @Transactional(readOnly = true)
    public DownloadedIdentityDocument loadAdminDocument(
            UUID verificationId
    ) {

        IdentityVerificationDocument document =
                getAdminDocumentMetadata(
                        verificationId
                );

        IdentityDocumentStorageService.StoredFile
                storedFile =
                storageService.load(
                        document.getStoredFileName()
                );

        Path path =
                storedFile.getPath();

        Resource resource =
                new FileSystemResource(
                        path
                );

        return new DownloadedIdentityDocument(
                resource,
                document.getOriginalFileName(),
                document.getContentType(),
                document.getFileSize()
        );
    }

    @Transactional
    public void deleteAllForUser(
            UUID userId
    ) {

        if (userId == null) {
            return;
        }

        documentRepository
                .findByUserId(
                        userId
                )
                .ifPresent(
                        document -> {

                            String storedFileName =
                                    document.getStoredFileName();

                            documentRepository.delete(
                                    document
                            );

                            documentRepository.flush();

                            storageService.delete(
                                    storedFileName
                            );
                        }
                );
    }

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

    public record DownloadedIdentityDocument(
            Resource resource,
            String originalFileName,
            String contentType,
            long fileSize
    ) {
    }
}